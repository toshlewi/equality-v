import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// POST /api/upload - Handle file uploads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo",
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/ogg"
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed` },
          { status: 400 }
        );
      }

      // Validate file size (200MB max for videos, 10MB for others)
      const maxSize = file.type.startsWith('video/') ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
      const maxSizeLabel = file.type.startsWith('video/') ? '200MB' : '10MB';
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is ${maxSizeLabel}.` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const fileExtension = file.name.split(".").pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Save file
      const filePath = join(uploadsDir, uniqueFileName);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      // Store file metadata
      uploadedFiles.push({
        name: file.name,
        url: `/uploads/${uniqueFileName}`,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      });
    }

    return NextResponse.json(uploadedFiles);

  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
