import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/Book";

// GET /api/books - Fetch books with filters and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const genre = searchParams.get("genre");
    const matriarchiveCategory = searchParams.get("matriarchiveCategory");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Build query object
    const query: Record<string, unknown> = { status: "approved" };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { genre: { $in: [new RegExp(search, "i")] } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }

    // Add category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Add genre filter
    if (genre && genre !== "All") {
      query.genre = { $in: [new RegExp(genre, "i")] };
    }

    // Add matriarchive category filter
    if (matriarchiveCategory && matriarchiveCategory !== "All") {
      query.matriarchiveCategory = matriarchiveCategory;
    }

    // Build sort object
    let sortObj: Record<string, unknown> = {};
    switch (sort) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "title":
        sortObj = { title: 1 };
        break;
      case "author":
        sortObj = { author: 1 };
        break;
      case "year":
        sortObj = { year: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const books = await Book.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select("-suggestedBy -meetingNotes -discussionHighlights")
      .lean();

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    return NextResponse.json({
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST /api/books - Create new book suggestion
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      author,
      year,
      category,
      genre,
      summary,
      reason,
      coverImage,
      suggestedByName,
      suggestedByEmail,
      suggestedByPhone,
      agreeToTerms
    } = body;

    // Validate required fields
    if (!title || !author || !year || !category || !summary || !reason) {
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

    // Process genre
    const processedGenre = genre 
      ? genre.split(",").map((g: string) => g.trim()).filter(Boolean)
      : [];

    // Create book
    const book = new Book({
      title,
      author,
      year,
      category,
      genre: processedGenre,
      summary,
      coverImage: coverImage || null,
      status: "pending",
      suggestedBy: {
        name: suggestedByName,
        email: suggestedByEmail,
        reason: reason
      }
    });

    await book.save();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to suggester

    return NextResponse.json(
      { 
        message: "Book suggestion submitted successfully",
        id: book._id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating book suggestion:", error);
    return NextResponse.json(
      { error: "Failed to create book suggestion" },
      { status: 500 }
    );
  }
}
