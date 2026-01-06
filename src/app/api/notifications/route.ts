import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from "@/lib/auth-middleware";
import { StatusCodes } from "http-status-codes";

export async function GET(request: NextRequest) {

  const user = await authenticateRequest(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required. Please log in' },
      { status: StatusCodes.UNAUTHORIZED }
    )
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page")!, 10)
    : 1;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : 10;
  const skip = (page - 1) * limit;

  try {
    const notifications = await prisma.notification.findMany({
      // where: {
      //   userId: user.id,
      // },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

