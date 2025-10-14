import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Publication from "@/lib/models/Publication";

// GET /api/publications/[id] - Get single publication by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Try to find by slug first, then by ID
    const publication = await Publication.findOne({
      $or: [
        { slug: id },
        { _id: id }
      ],
      status: "published"
    }).lean();

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }

    // Increment view count (in background)
    Publication.findByIdAndUpdate(publication._id, {
      $inc: { viewCount: 1 }
    }).exec();

    return NextResponse.json(publication);

  } catch (error) {
    console.error("Error fetching publication:", error);
    return NextResponse.json(
      { error: "Failed to fetch publication" },
      { status: 500 }
    );
  }
}

// PUT /api/publications/[id] - Update publication (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // TODO: Add admin authentication check
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = params;
    const body = await request.json();

    const publication = await Publication.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(publication);

  } catch (error) {
    console.error("Error updating publication:", error);
    return NextResponse.json(
      { error: "Failed to update publication" },
      { status: 500 }
    );
  }
}

// DELETE /api/publications/[id] - Delete publication (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // TODO: Add admin authentication check
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user.isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { id } = params;

    const publication = await Publication.findByIdAndDelete(id);

    if (!publication) {
      return NextResponse.json(
        { error: "Publication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Publication deleted successfully" });

  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { error: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
