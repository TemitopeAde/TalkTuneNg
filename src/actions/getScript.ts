'use server'

import { prisma } from "@/lib/prisma"

export interface GetScriptsParams {
  userId: number
  page?: number
  limit?: number
  search?: string
  language?: string
  sortBy?: 'createdAt' | 'projectName'
  sortOrder?: 'asc' | 'desc'
}

export interface GetScriptsResponse {
  success?: boolean
  error?: string
  data?: {
    scripts: any[]
    pagination: {
      currentPage: number
      totalPages: number
      totalScripts: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export async function getScripts(params: GetScriptsParams): Promise<GetScriptsResponse> {
  try {
    const {
      userId,
      page = 1,
      limit = 10,
      search = '',
      language = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params

    // Validate userId
    if (!userId) {
      return { error: 'User ID is required' }
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExists) {
      return { error: 'User not found' }
    }

    // Build where clause for filtering
    const whereClause: any = {
      userId: userId,
    }

    // Add search filter if provided
    if (search.trim()) {
      whereClause.OR = [
        { projectName: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
        { fileName: { contains: search.trim(), mode: 'insensitive' } },
      ]
    }

    // Add language filter if provided
    if (language.trim()) {
      whereClause.language = language.toLowerCase().trim()
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const take = limit

    // Get total count for pagination
    const totalScripts = await prisma.script.count({
      where: whereClause
    })

    // Fetch scripts with pagination
    const scripts = await prisma.script.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      orderBy: {
        [sortBy]: sortOrder
      },
      select: {
        id: true,
        projectName: true,
        language: true,
        content: true,
        fileName: true,
        fileSize: true,
        fileType: true,
        uploadMode: true,
        audioFileName: true,
        audioFileSize: true,
        audioFileUrl: true,
        audioGenerated: true,
        audioSettings: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalScripts / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      success: true,
      data: {
        scripts: scripts,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalScripts: totalScripts,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
        }
      }
    }

  } catch (error) {
    console.error('Get scripts error:', error)

    // Handle Prisma errors
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
      : 'An unexpected error occurred while fetching scripts'

    return { error: errorMessage }
  }
}