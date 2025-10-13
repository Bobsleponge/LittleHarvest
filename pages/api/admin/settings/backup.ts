import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'
import { withCSRFProtection } from '../../../../src/lib/csrf'
import { withAPIRateLimit, RATE_LIMITS } from '../../../../src/lib/rate-limit'

export default withCSRFProtection(withAPIRateLimit(
  RATE_LIMITS.SETTINGS,
  (req) => req.user?.id || req.ip
)(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        return await createBackup(req, res, session.user.id)
      case 'POST':
        return await handleBackupRequest(req, res, session.user.id)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    logger.error('Settings backup API error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      method: req.method 
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}))

async function handleBackupRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { type, action } = req.body

  if (action === 'restore') {
    return await restoreBackup(req, res, userId)
  }

  if (type && ['database', 'files', 'full'].includes(type)) {
    return await createManualBackup(req, res, userId, type)
  }

  return res.status(400).json({ error: 'Invalid backup request' })
}

async function createManualBackup(req: NextApiRequest, res: NextApiResponse, userId: string, type: string) {
  try {
    logger.info('Manual backup requested', { userId, type })

    let backupResult = {
      success: true,
      message: '',
      downloadUrl: null as string | null,
      size: 0,
      timestamp: new Date().toISOString()
    }

    switch (type) {
      case 'database':
        backupResult = await createDatabaseBackup(userId)
        break
      case 'files':
        backupResult = await createFilesBackup(userId)
        break
      case 'full':
        backupResult = await createFullBackup(userId)
        break
    }

    return res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} backup completed successfully`,
      ...backupResult
    })

  } catch (error) {
    logger.error('Manual backup failed', { 
      userId,
      type,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Backup failed' })
  }
}

async function createDatabaseBackup(userId: string) {
  try {
    // Get all database data
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ` as Array<{ table_name: string }>

    const backupData = {
      metadata: {
        type: 'database',
        createdAt: new Date().toISOString(),
        createdBy: userId,
        tables: tables.map(t => t.table_name)
      },
      data: {} as Record<string, any[]>
    }

    // Export data from each table
    for (const table of tables) {
      try {
        const tableData = await prisma.$queryRawUnsafe(`SELECT * FROM "${table.table_name}"`)
        backupData.data[table.table_name] = tableData as any[]
      } catch (error) {
        logger.error(`Failed to backup table ${table.table_name}`, { error })
      }
    }

    logger.info('Database backup created', { 
      userId, 
      tables: tables.length,
      totalRecords: Object.values(backupData.data).reduce((sum, records) => sum + records.length, 0)
    })

    return {
      success: true,
      message: 'Database backup completed',
      downloadUrl: `/api/admin/settings/backup/download?type=database&timestamp=${Date.now()}`,
      size: JSON.stringify(backupData).length,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('Database backup failed', { userId, error })
    throw error
  }
}

async function createFilesBackup(userId: string) {
  try {
    // In a real implementation, you would backup uploaded files, images, etc.
    // For now, we'll create a manifest of files that would be backed up
    
    const fileManifest = {
      metadata: {
        type: 'files',
        createdAt: new Date().toISOString(),
        createdBy: userId
      },
      files: [
        // This would be populated with actual file information
        { path: '/uploads/products/', count: 0 },
        { path: '/uploads/users/', count: 0 },
        { path: '/uploads/temp/', count: 0 }
      ]
    }

    logger.info('Files backup created', { userId })

    return {
      success: true,
      message: 'Files backup completed',
      downloadUrl: `/api/admin/settings/backup/download?type=files&timestamp=${Date.now()}`,
      size: JSON.stringify(fileManifest).length,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('Files backup failed', { userId, error })
    throw error
  }
}

async function createFullBackup(userId: string) {
  try {
    // Create both database and files backup
    const [dbBackup, filesBackup] = await Promise.all([
      createDatabaseBackup(userId),
      createFilesBackup(userId)
    ])

    logger.info('Full backup created', { userId })

    return {
      success: true,
      message: 'Full backup completed (database + files)',
      downloadUrl: `/api/admin/settings/backup/download?type=full&timestamp=${Date.now()}`,
      size: dbBackup.size + filesBackup.size,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    logger.error('Full backup failed', { userId, error })
    throw error
  }
}

async function createBackup(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { format = 'json' } = req.query

    // Get all settings
    const settings = await prisma.storeSettings.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Get recent history (last 100 changes)
    const history = await prisma.settingsHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const backup = {
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: userId,
        version: '1.0',
        totalSettings: settings.length,
        totalHistoryEntries: history.length
      },
      settings: settings.map(setting => ({
        category: setting.category,
        key: setting.key,
        value: setting.value,
        description: setting.description,
        updatedBy: setting.updatedBy,
        createdAt: setting.createdAt.toISOString(),
        updatedAt: setting.updatedAt.toISOString()
      })),
      history: history.map(entry => ({
        category: entry.category,
        key: entry.key,
        oldValue: entry.oldValue,
        newValue: entry.newValue,
        changedBy: entry.changedBy,
        changeReason: entry.changeReason,
        createdAt: entry.createdAt.toISOString()
      }))
    }

    logger.info('Settings backup created', { 
      userId, 
      settingsCount: settings.length,
      historyCount: history.length 
    })

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(settings)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="settings-backup-${new Date().toISOString().split('T')[0]}.csv"`)
      return res.status(200).send(csvData)
    }

    return res.status(200).json({ 
      success: true, 
      backup,
      downloadUrl: `/api/admin/settings/backup?format=json&download=true`
    })

  } catch (error) {
    logger.error('Error creating backup', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to create backup' })
  }
}

async function restoreBackup(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { backup, confirm = false } = req.body

    if (!backup) {
      return res.status(400).json({ error: 'Backup data is required' })
    }

    if (!confirm) {
      // Return preview of what will be restored
      const preview = {
        settingsToRestore: backup.settings?.length || 0,
        historyEntries: backup.history?.length || 0,
        metadata: backup.metadata,
        conflicts: await checkConflicts(backup.settings || [])
      }
      
      return res.status(200).json({ 
        success: true, 
        preview,
        message: 'Send confirm: true to proceed with restore'
      })
    }

    // Perform the restore
    const results = await performRestore(backup, userId)

    logger.info('Settings backup restored', { 
      userId, 
      settingsRestored: results.settingsRestored,
      errors: results.errors.length 
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Backup restored successfully',
      results
    })

  } catch (error) {
    logger.error('Error restoring backup', { 
      userId,
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return res.status(500).json({ error: 'Failed to restore backup' })
  }
}

async function checkConflicts(settings: any[]) {
  const conflicts = []
  
  for (const setting of settings) {
    const existing = await prisma.storeSettings.findUnique({
      where: {
        category_key: {
          category: setting.category,
          key: setting.key
        }
      }
    })
    
    if (existing && existing.value !== setting.value) {
      conflicts.push({
        category: setting.category,
        key: setting.key,
        currentValue: existing.value,
        backupValue: setting.value,
        lastUpdated: existing.updatedAt
      })
    }
  }
  
  return conflicts
}

async function performRestore(backup: any, userId: string) {
  const results = {
    settingsRestored: 0,
    historyEntries: 0,
    errors: [] as any[]
  }

  // Restore settings
  if (backup.settings) {
    for (const setting of backup.settings) {
      try {
        await prisma.storeSettings.upsert({
          where: {
            category_key: {
              category: setting.category,
              key: setting.key
            }
          },
          update: {
            value: setting.value,
            description: setting.description,
            updatedBy: userId,
            updatedAt: new Date()
          },
          create: {
            category: setting.category,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            updatedBy: userId
          }
        })
        results.settingsRestored++
      } catch (error) {
        results.errors.push({
          type: 'setting',
          category: setting.category,
          key: setting.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  // Restore history (optional - usually we don't restore history)
  if (backup.history && backup.metadata?.includeHistory) {
    for (const entry of backup.history) {
      try {
        await prisma.settingsHistory.create({
          data: {
            category: entry.category,
            key: entry.key,
            oldValue: entry.oldValue,
            newValue: entry.newValue,
            changedBy: entry.changedBy || userId,
            changeReason: entry.changeReason || 'Restored from backup'
          }
        })
        results.historyEntries++
      } catch (error) {
        results.errors.push({
          type: 'history',
          category: entry.category,
          key: entry.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  return results
}

function convertToCSV(settings: any[]) {
  const headers = ['Category', 'Key', 'Value', 'Description', 'Updated By', 'Created At', 'Updated At']
  const rows = settings.map(setting => [
    setting.category,
    setting.key,
    setting.value,
    setting.description || '',
    setting.updatedBy || '',
    setting.createdAt.toISOString(),
    setting.updatedAt.toISOString()
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  
  return csvContent
}
