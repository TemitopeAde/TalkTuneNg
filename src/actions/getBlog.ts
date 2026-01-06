'use server'

import { prisma } from "@/lib/prisma"

export interface GetBlogsParams {
  category?: string
  limit?: number
  page?: number
  published?: boolean
}

export interface GetBlogsResponse {
  success?: boolean
  error?: string
  data?: {
    blogs: any[]
    pagination: {
      currentPage: number
      totalPages: number
      totalBlogs: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export async function getBlogs(params: GetBlogsParams = {}): Promise<GetBlogsResponse> {
  try {
    const {
      category,
      limit = 10,
      page = 1,
      published = true
    } = params

    const whereClause: any = {
      published: published
    }

    if (category && category !== 'view-all') {
      whereClause.category = category
    }

    const skip = (page - 1) * limit
    const take = limit

    const totalBlogs = await prisma.blog.count({
      where: whereClause
    })

    const blogs = await prisma.blog.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        authorName: true,
        createdAt: true,
        content: true
      }
    })

    const totalPages = Math.ceil(totalBlogs / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        blogs: blogs,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalBlogs: totalBlogs,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
        }
      }
    }

  } catch (error) {
    console.error('Get blogs error:', error)

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any

      switch (prismaError.code) {
        case 'P2025':
          return { error: 'Record not found' }
        default:
          return { error: `Database error: ${prismaError.message || 'Unknown database error'}` }
      }
    }

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unexpected error occurred while fetching blogs'

    return { error: errorMessage }
  }
}

// export async function getBlogBySlug(slug: string) {
//   try {
//     const blog = await prisma.blog.findUnique({
//       where: {
//         slug: slug,
//         published: true
//       }
//     })

//     if (!blog) {
//       return { error: 'Blog not found' }
//     }

//     return {
//       success: true,
//       data: blog
//     }

//   } catch (error) {
//     console.error('Get blog by slug error:', error)

//     const errorMessage = error instanceof Error
//       ? error.message
//       : 'An unexpected error occurred while fetching the blog'

//     return { error: errorMessage }
//   }
// }