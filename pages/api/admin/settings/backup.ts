import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../src/lib/auth'
import { prisma } from '../../../../src/lib/prisma'
import { logger } from '../../../../src/lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    switch (req.method) {
      case 'GET':
        return await createBackup(req, res, session.user.id)
      case 'POST':
        return await restoreBackup(req, res, session.user.id)
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
