import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    // Only allow updating safe profile fields
    const allowedFields: Record<string, unknown> = {};
    const safeKeys = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "dob",
      "gender",
      "image",
    ];

    for (const key of safeKeys) {
      if (body[key] !== undefined) {
        allowedFields[key] = body[key];
      }
    }

    // Ensure dob is stored as plain "YYYY-MM-DD" string with no time/timezone
    if (typeof allowedFields.dob === "string" && allowedFields.dob) {
      allowedFields.dob = allowedFields.dob.split("T")[0];
    }

    const updatedUser = await User.findByIdAndUpdate(id, allowedFields, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
