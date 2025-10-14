import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Publication from "@/lib/models/Publication";

// GET /api/publications - Fetch publications with filters and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build query object
    const query: Record<string, unknown> = { status: "published" };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Add category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Build sort object
    let sortObj: Record<string, unknown> = {};
    switch (sort) {
      case "newest":
        sortObj = { publishedAt: -1 };
        break;
      case "oldest":
        sortObj = { publishedAt: 1 };
        break;
      case "popular":
        sortObj = { viewCount: -1, publishedAt: -1 };
        break;
      case "title":
        sortObj = { title: 1 };
        break;
      default:
        sortObj = { publishedAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const publications = await Publication.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select("-content -reviewNotes -submittedBy")
      .lean();

    // Get total count for pagination
    const total = await Publication.countDocuments(query);

    return NextResponse.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching publications:", error);
    return NextResponse.json(
      { error: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

// POST /api/publications - Create new publication submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      author,
      authorEmail,
      category,
      description,
      content,
      tags,
      media,
      submittedByName,
      submittedByEmail,
      submittedByPhone,
      agreeToTerms
    } = body;

    // Validate required fields
    if (!title || !author || !authorEmail || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { error: "You must agree to the terms and conditions" },
        { status: 400 }
      );
    }

    // Process tags
    const processedTags = tags 
      ? tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    // Create publication
    const publication = new Publication({
      title,
      author,
      authorEmail,
      category,
      description,
      content: content || "",
      tags: processedTags,
      media: media || [],
      status: "pending",
      submittedBy: {
        name: submittedByName,
        email: submittedByEmail,
        phone: submittedByPhone || ""
      }
    });

    await publication.save();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to submitter

    return NextResponse.json(
      { 
        message: "Publication submitted successfully",
        id: publication._id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating publication:", error);
    return NextResponse.json(
      { error: "Failed to create publication" },
      { status: 500 }
    );
  }
}
