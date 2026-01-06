import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const blogs = await prisma.blog.findMany();
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const newBlog = await prisma.blog.create({ data });
  return NextResponse.json(newBlog);
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json();
  const updatedBlog = await prisma.blog.update({
    where: { id },
    data,
  });
  return NextResponse.json(updatedBlog);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.blog.delete({ where: { id } });
  return NextResponse.json({ message: 'Blog deleted' });
}
