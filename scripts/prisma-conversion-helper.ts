#!/usr/bin/env tsx

/**
 * Prisma to Supabase Conversion Helper
 * 
 * This script helps identify and convert remaining Prisma references
 * to Supabase equivalents in the codebase.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Common Prisma to Supabase conversion patterns
const conversionPatterns = [
  // Import statements
  {
    pattern: /import\s*{\s*prisma\s*}\s*from\s*['"][^'"]*prisma['"]/g,
    replacement: `import { supabaseAdmin } from '../../../src/lib/supabaseClient'`
  },
  {
    pattern: /import\s*{\s*prisma\s*}\s*from\s*['"][^'"]*prisma['"]/g,
    replacement: `import { supabaseAdmin } from '../../../../src/lib/supabaseClient'`
  },
  
  // Common Prisma operations
  {
    pattern: /prisma\.(\w+)\.findMany\(/g,
    replacement: 'supabaseAdmin.from(\'$1\').select(\'*\')'
  },
  {
    pattern: /prisma\.(\w+)\.findUnique\(/g,
    replacement: 'supabaseAdmin.from(\'$1\').select(\'*\').eq(\'id\','
  },
  {
    pattern: /prisma\.(\w+)\.create\(/g,
    replacement: 'supabaseAdmin.from(\'$1\').insert(['
  },
  {
    pattern: /prisma\.(\w+)\.update\(/g,
    replacement: 'supabaseAdmin.from(\'$1\').update('
  },
  {
    pattern: /prisma\.(\w+)\.delete\(/g,
    replacement: 'supabaseAdmin.from(\'$1\').delete('
  },
  
  // Common query patterns
  {
    pattern: /where:\s*{\s*id:\s*([^}]+)\s*}/g,
    replacement: '.eq(\'id\', $1)'
  },
  {
    pattern: /include:\s*{\s*([^}]+)\s*}/g,
    replacement: '.select(\'*, $1\')'
  }
]

// Files to scan for Prisma references
const scanDirectories = [
  'pages/api',
  'src/lib',
  'src/components'
]

// Files to exclude from conversion
const excludeFiles = [
  'node_modules',
  '.next',
  '.git',
  'prisma',
  'scripts'
]

function shouldExcludeFile(filePath: string): boolean {
  return excludeFiles.some(exclude => filePath.includes(exclude))
}

function scanForPrismaFiles(directory: string): string[] {
  const prismaFiles: string[] = []
  
  try {
    const files = readdirSync(directory)
    
    for (const file of files) {
      const filePath = join(directory, file)
      const stat = statSync(filePath)
      
      if (stat.isDirectory() && !shouldExcludeFile(filePath)) {
        prismaFiles.push(...scanForPrismaFiles(filePath))
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))) {
        try {
          const content = readFileSync(filePath, 'utf8')
          if (content.includes('prisma') || content.includes('PrismaClient')) {
            prismaFiles.push(filePath)
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return prismaFiles
}

function analyzePrismaUsage(filePath: string): { patterns: string[], lines: number[] } {
  try {
    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    const patterns: string[] = []
    const lineNumbers: number[] = []
    
    lines.forEach((line, index) => {
      if (line.includes('prisma') || line.includes('PrismaClient')) {
        patterns.push(line.trim())
        lineNumbers.push(index + 1)
      }
    })
    
    return { patterns, lines: lineNumbers }
  } catch (error) {
    return { patterns: [], lines: [] }
  }
}

function generateConversionReport(): void {
  log(`${colors.cyan}🔍 Scanning for Prisma references...${colors.reset}`)
  
  const allPrismaFiles: string[] = []
  
  scanDirectories.forEach(dir => {
    if (require('fs').existsSync(dir)) {
      allPrismaFiles.push(...scanForPrismaFiles(dir))
    }
  })
  
  log(`\n${colors.yellow}📋 Found ${allPrismaFiles.length} files with Prisma references:${colors.reset}`)
  
  const report: { file: string, patterns: string[], lines: number[] }[] = []
  
  allPrismaFiles.forEach(file => {
    const analysis = analyzePrismaUsage(file)
    if (analysis.patterns.length > 0) {
      report.push({
        file,
        patterns: analysis.patterns,
        lines: analysis.lines
      })
    }
  })
  
  // Sort by priority (API files first)
  report.sort((a, b) => {
    const aIsApi = a.file.includes('pages/api')
    const bIsApi = b.file.includes('pages/api')
    if (aIsApi && !bIsApi) return -1
    if (!aIsApi && bIsApi) return 1
    return a.file.localeCompare(b.file)
  })
  
  report.forEach(({ file, patterns, lines }) => {
    log(`\n${colors.blue}📄 ${file}${colors.reset}`)
    patterns.forEach((pattern, index) => {
      log(`  Line ${lines[index]}: ${colors.yellow}${pattern}${colors.reset}`)
    })
  })
  
  // Generate conversion suggestions
  log(`\n${colors.green}💡 Conversion Suggestions:${colors.reset}`)
  log(`${colors.green}1. Replace Prisma imports with Supabase imports${colors.reset}`)
  log(`${colors.green}2. Convert Prisma query syntax to Supabase syntax${colors.reset}`)
  log(`${colors.green}3. Update error handling for Supabase responses${colors.reset}`)
  log(`${colors.green}4. Test each converted file thoroughly${colors.reset}`)
  
  // Priority files
  const priorityFiles = report.filter(r => r.file.includes('pages/api'))
  log(`\n${colors.red}🚨 Priority Files (${priorityFiles.length}):${colors.reset}`)
  priorityFiles.forEach(({ file }) => {
    log(`  • ${file}`)
  })
  
  log(`\n${colors.cyan}📊 Summary:${colors.reset}`)
  log(`  Total files with Prisma: ${report.length}`)
  log(`  API files: ${priorityFiles.length}`)
  log(`  Other files: ${report.length - priorityFiles.length}`)
}

// Main execution
if (require.main === module) {
  log(`${colors.cyan}🧩 Prisma to Supabase Conversion Helper${colors.reset}`)
  log(`${colors.cyan}=====================================${colors.reset}`)
  
  generateConversionReport()
  
  log(`\n${colors.green}✅ Scan complete! Review the files above and convert them manually.${colors.reset}`)
  log(`${colors.yellow}💡 Tip: Start with the priority API files first.${colors.reset}`)
}

export { generateConversionReport, scanForPrismaFiles, analyzePrismaUsage }
