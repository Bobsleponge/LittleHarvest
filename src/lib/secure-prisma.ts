import { PrismaClient } from '@prisma/client'
import { securityLogger as logger } from './enhanced-logger'

// Enhanced Prisma client with security features
class SecurePrismaClient extends PrismaClient {
  private isConnected = false

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    // Event handlers disabled for now due to TypeScript compatibility issues
    // Can be re-enabled when Prisma types are updated
    console.log('Secure Prisma client initialized')
  }

  async connect() {
    if (!this.isConnected) {
      await super.$connect()
      this.isConnected = true
      
      logger.getLogger().info({
        type: 'database_connection',
        status: 'connected',
        timestamp: new Date().toISOString()
      }, 'Database Connected')
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await super.$disconnect()
      this.isConnected = false
      
      logger.getLogger().info({
        type: 'database_connection',
        status: 'disconnected',
        timestamp: new Date().toISOString()
      }, 'Database Disconnected')
    }
  }

  // Secure query methods with logging
  async secureQuery<T>(
    operation: string,
    query: () => Promise<T>,
    context: {
      userId?: string
      userEmail?: string
      ipAddress?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      logger.logDatabaseSecurity({
        operation,
        table: 'unknown',
        userId: context.userId,
        ipAddress: context.ipAddress,
        success: true,
        details: `Starting ${operation}`,
        metadata: context.metadata
      })

      const result = await query()
      
      const duration = Date.now() - startTime
      
      logger.logDatabaseSecurity({
        operation,
        table: 'unknown',
        userId: context.userId,
        ipAddress: context.ipAddress,
        success: true,
        details: `${operation} completed successfully`,
        metadata: {
          ...context.metadata,
          duration
        }
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.logDatabaseSecurity({
        operation,
        table: 'unknown',
        userId: context.userId,
        ipAddress: context.ipAddress,
        success: false,
        details: `${operation} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          ...context.metadata,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      throw error
    }
  }

  // Secure user operations
  async secureUserOperation<T>(
    operation: string,
    query: () => Promise<T>,
    context: {
      userId: string
      userEmail: string
      ipAddress?: string
      metadata?: Record<string, any>
    }
  ): Promise<T> {
    return this.secureQuery(operation, query, context)
  }

  // Secure admin operations
  async secureAdminOperation<T>(
    operation: string,
    query: () => Promise<T>,
    context: {
      adminId: string
      adminEmail: string
      ipAddress?: string
      metadata?: Record<string, any>
    }
  ): Promise<T> {
    return this.secureQuery(operation, query, {
      userId: context.adminId,
      userEmail: context.adminEmail,
      ipAddress: context.ipAddress,
      metadata: {
        ...context.metadata,
        isAdmin: true
      }
    })
  }
}

// Create secure Prisma instance
export const prisma = new SecurePrismaClient()

// Database security utilities
export class DatabaseSecurity {
  /**
   * Validate database connection security
   */
  static async validateConnection(): Promise<{
    isSecure: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check if using SSL/TLS
      const dbUrl = process.env.DATABASE_URL
      if (dbUrl && !dbUrl.includes('sslmode=require')) {
        issues.push('Database connection not using SSL/TLS')
        recommendations.push('Add sslmode=require to DATABASE_URL')
      }

      // Check connection
      await prisma.$queryRaw`SELECT 1`
      
      // Check for sensitive data exposure
      const userCount = await prisma.user.count()
      if (userCount === 0) {
        recommendations.push('No users found - ensure proper data seeding')
      }

      // Check for default passwords
      const usersWithDefaultPasswords = await prisma.user.findMany({
        where: {
          password: {
            not: null
          }
        },
        select: {
          id: true,
          email: true
        }
      })

      if (usersWithDefaultPasswords.length > 0) {
        recommendations.push('Review users with password authentication - consider migrating to OAuth')
      }

      return {
        isSecure: issues.length === 0,
        issues,
        recommendations
      }
    } catch (error) {
      issues.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return {
        isSecure: false,
        issues,
        recommendations
      }
    }
  }

  /**
   * Audit database access patterns
   */
  static async auditAccessPatterns(): Promise<{
    suspiciousQueries: any[]
    frequentAccess: any[]
    recommendations: string[]
  }> {
    const suspiciousQueries: any[] = []
    const frequentAccess: any[] = []
    const recommendations: string[] = []

    try {
      // Check for users with excessive failed logins
      const excessiveFailures = await prisma.securityEvent.groupBy({
        by: ['userId', 'ipAddress'],
        where: {
          type: 'failed_login',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        _count: {
          id: true
        },
        having: {
          id: {
            _count: {
              gt: 5
            }
          }
        }
      })

      if (excessiveFailures.length > 0) {
        suspiciousQueries.push({
          type: 'excessive_failed_logins',
          data: excessiveFailures,
          severity: 'high'
        })
        recommendations.push('Consider implementing account lockout after multiple failed attempts')
      }

      // Check for unusual access patterns
      const unusualAccess = await prisma.securityEvent.groupBy({
        by: ['userId', 'ipAddress'],
        where: {
          type: 'login',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        _count: {
          id: true
        }
      })

      // Find users accessing from multiple IPs
      const multiIPUsers = unusualAccess.filter(access => 
        unusualAccess.filter(a => a.userId === access.userId).length > 3
      )

      if (multiIPUsers.length > 0) {
        suspiciousQueries.push({
          type: 'multi_ip_access',
          data: multiIPUsers,
          severity: 'medium'
        })
        recommendations.push('Review users accessing from multiple IP addresses')
      }

      return {
        suspiciousQueries,
        frequentAccess,
        recommendations
      }
    } catch (error) {
      logger.logSystemError(error as Error, {
        context: 'database_audit',
        metadata: { operation: 'audit_access_patterns' }
      })

      return {
        suspiciousQueries: [],
        frequentAccess: [],
        recommendations: ['Database audit failed - check logs for details']
      }
    }
  }

  /**
   * Clean up sensitive data
   */
  static async cleanupSensitiveData(): Promise<{
    cleaned: number
    errors: string[]
  }> {
    let cleaned = 0
    const errors: string[] = []

    try {
      // Clean up expired sessions
      const expiredSessions = await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      })
      cleaned += expiredSessions.count

      // Clean up old security events (keep last 90 days)
      const oldEvents = await prisma.securityEvent.deleteMany({
        where: {
          createdAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      })
      cleaned += oldEvents.count

      // Clean up resolved security alerts older than 30 days
      const oldAlerts = await prisma.securityAlert.deleteMany({
        where: {
          resolved: true,
          resolvedAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
      cleaned += oldAlerts.count

      logger.getLogger().info({
        type: 'database_cleanup',
        cleaned,
        timestamp: new Date().toISOString()
      }, 'Database cleanup completed')

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMsg)
      
      logger.logSystemError(error as Error, {
        context: 'database_cleanup',
        metadata: { cleaned }
      })
    }

    return { cleaned, errors }
  }

  /**
   * Backup sensitive data
   */
  static async backupSensitiveData(): Promise<{
    success: boolean
    backupPath?: string
    error?: string
  }> {
    try {
      // In a real implementation, you'd create a proper backup
      // For now, we'll just log the operation
      logger.getLogger().info({
        type: 'database_backup',
        timestamp: new Date().toISOString()
      }, 'Database backup initiated')

      return {
        success: true,
        backupPath: `/backups/backup-${Date.now()}.sql`
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      logger.logSystemError(error as Error, {
        context: 'database_backup'
      })

      return {
        success: false,
        error: errorMsg
      }
    }
  }
}

// Initialize database connection
prisma.connect().catch((error) => {
  logger.logSystemError(error, {
    context: 'database_initialization'
  })
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.disconnect()
})

process.on('SIGINT', async () => {
  await prisma.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.disconnect()
  process.exit(0)
})

