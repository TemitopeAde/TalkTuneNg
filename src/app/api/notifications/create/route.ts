import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";
import { authenticateRequest } from "@/lib/auth-middleware";
import { StatusCodes } from "http-status-codes";

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)

  // if (!user) {
  //   return NextResponse.json(
  //     { error: 'Authentication required. Please log in to add notifications' },
  //     { status: StatusCodes.UNAUTHORIZED }
  //   )
  // }

  const { title, message } = await request.json();

  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId: 454554,
      },
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
