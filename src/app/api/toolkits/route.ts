import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Toolkit from "@/lib/models/Toolkit";

// GET /api/toolkits - Fetch toolkits with filters and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const audience = searchParams.get("audience");
    const difficulty = searchParams.get("difficulty");
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

    // Add audience filter
    if (audience && audience !== "All") {
      query.targetAudience = { $in: [new RegExp(audience, "i")] };
    }

    // Add difficulty filter
    if (difficulty && difficulty !== "All") {
      query.difficultyLevel = difficulty;
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
    const toolkits = await Toolkit.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select("-content -reviewNotes -submittedBy")
      .lean();

    // Get total count for pagination
    const total = await Toolkit.countDocuments(query);

    return NextResponse.json({
      toolkits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching toolkits:", error);
    return NextResponse.json(
      { error: "Failed to fetch toolkits" },
      { status: 500 }
    );
  }
}

// POST /api/toolkits - Create new toolkit submission
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
      targetAudience,
      difficultyLevel,
      estimatedTime,
      files,
      submittedByName,
      submittedByEmail,
      submittedByOrganization,
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

    // Process target audience
    const processedAudience = targetAudience 
      ? Array.isArray(targetAudience) ? targetAudience : [targetAudience]
      : ["General Public"];

    // Create toolkit
    const toolkit = new Toolkit({
      title,
      author,
      authorEmail,
      category,
      description,
      content: content || "",
      targetAudience: processedAudience,
      difficultyLevel: difficultyLevel || "Beginner",
      estimatedTime: estimatedTime || "",
      files: files || [],
      status: "pending",
      submittedBy: {
        name: submittedByName,
        email: submittedByEmail,
        organization: submittedByOrganization || ""
      }
    });

    await toolkit.save();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to submitter

    return NextResponse.json(
      { 
        message: "Toolkit submitted successfully",
        id: toolkit._id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating toolkit:", error);
    return NextResponse.json(
      { error: "Failed to create toolkit" },
      { status: 500 }
    );
  }
}
