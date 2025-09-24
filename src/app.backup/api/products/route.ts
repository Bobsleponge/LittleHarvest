import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, cacheKeys, CACHE_TTL } from '@/lib/cache'
import { logger, perfLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  return perfLogger.timeAsync('products:get', async () => {
    try {
      const { searchParams } = new URL(request.url)
      const age = searchParams.get('age')
      const texture = searchParams.get('texture')
      const search = searchParams.get('search')
      const page = parseInt(searchParams.get('page') || '1')
      const limit = 12
      const offset = (page - 1) * limit

      logger.info('Fetching products', { age, texture, search, page, limit })

      // Create cache key based on filters
      const filters = { age, texture, search, page, limit }
      const cacheKey = cacheKeys.products(filters)
      
      // Try to get from cache first
      const cachedResult = cache.get(cacheKey)
      if (cachedResult) {
        logger.debug('Cache hit for products', { cacheKey })
        return NextResponse.json(cachedResult)
      }

      logger.debug('Cache miss for products', { cacheKey })

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (age) {
      where.ageGroupId = age
    }

    if (texture) {
      where.textureId = texture
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Optimize query with better includes and ordering
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          contains: true,
          createdAt: true,
          ageGroup: {
            select: { id: true, name: true, minMonths: true, maxMonths: true }
          },
          texture: {
            select: { id: true, name: true }
          },
          prices: {
            where: { isActive: true },
            select: {
              id: true,
              amountZar: true,
              portionSize: {
                select: { id: true, name: true, description: true, measurement: true }
              },
            },
            orderBy: { portionSize: { name: 'asc' } }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where })
    ])

    const result = {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

      // Cache the result
      cache.set(cacheKey, result, CACHE_TTL.PRODUCTS)
      logger.debug('Cached products result', { cacheKey, productCount: result.products.length })

      return NextResponse.json(result)
    } catch (error) {
      logger.error('Error fetching products', { error: error instanceof Error ? error.message : 'Unknown error' }, error as Error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }
  }, { endpoint: 'products:get' })
}
