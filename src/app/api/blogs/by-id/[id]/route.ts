import { NextRequest, NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth-middleware'
import type { Prisma } from '@/generated/prisma'


const updateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().min(10).optional(),
  content: z.string().min(20).optional(),
  coverImage: z.string().url().optional(),
  category: z.string().min(2).optional(),
  authorName: z.string().min(2).optional(),
  published: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, { message: 'No fields provided to update' })

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: StatusCodes.FORBIDDEN })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing blog id' }, { status: StatusCodes.BAD_REQUEST })
    }

    const json = await request.json()
    const parsed = updateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: StatusCodes.BAD_REQUEST })
    }

    const input = parsed.data

    const data: Prisma.BlogUpdateInput = {}
    if (input.slug) {
      const newSlug = slugify(input.slug)
      const exists = await prisma.blog.findUnique({ where: { slug: newSlug } })
      if (exists && exists.id !== id) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: StatusCodes.CONFLICT })
      }
      data.slug = newSlug
    }
    if (input.title !== undefined) data.title = input.title
    if (input.excerpt !== undefined) data.excerpt = input.excerpt
    if (input.content !== undefined) data.content = input.content
    if (input.coverImage !== undefined) data.coverImage = input.coverImage
    if (input.category !== undefined) data.category = input.category
    if (input.authorName !== undefined) data.authorName = input.authorName
    if (input.published !== undefined) data.published = input.published

    const updated = await prisma.blog.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        category: true,
        published: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ success: true, data: updated }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Update Blog API Route Error:', error)
    const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred while updating blog'
    return NextResponse.json({ error: errMsg }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: StatusCodes.FORBIDDEN })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Missing blog id' }, { status: StatusCodes.BAD_REQUEST })
    }

    await prisma.blog.delete({ where: { id } })

    return NextResponse.json({ success: true }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Delete Blog API Route Error:', error)
    const errMsg = error instanceof Error ? error.message : 'An unexpected error occurred while deleting blog'
    return NextResponse.json({ error: errMsg }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
