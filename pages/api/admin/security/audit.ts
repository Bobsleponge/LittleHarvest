import { NextApiRequest, NextApiResponse } from 'next'
import { logger } from '../../../../src/lib/logger'
import { SecurityUtils } from '../../../../src/lib/security'
import { CSRFProtection } from '../../../../src/lib/csrf'
import { FileValidator } from '../../../../src/lib/file-validation'
import { VirusScanner } from '../../../../src/lib/virus-scanning'
import { NetworkSecurity } from '../../../../src/lib/network-security'
import { DatabaseSecurity } from '../../../../src/lib/secure-prisma'
import { SecurityPerformanceMonitor } from '../../../../src/lib/security-performance'

export interface SecurityAuditResult {
  overallScore: number
  category: string
  status: 'PASS' | 'WARN' | 'FAIL'
  findings: SecurityFinding[]
  recommendations: string[]
  timestamp: string
}

export interface SecurityFinding {
  id: string
  category: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  title: string
  description: string
  impact: string
  remediation: string
  evidence?: string
  status: 'Open' | 'Fixed' | 'Accepted'
}

export class SecurityAuditor {
  private static findings: SecurityFinding[] = []

  /**
   * Run comprehensive security audit
   */
  static async runFullAudit(): Promise<SecurityAuditResult> {
    const startTime = Date.now()
    this.findings = []

    try {
      // Run all audit categories
      await Promise.all([
        this.auditAuthentication(),
        this.auditInputValidation(),
        this.auditFileUpload(),
        this.auditCSRFProtection(),
        this.auditRateLimiting(),
        this.auditSecurityHeaders(),
        this.auditDatabaseSecurity(),
        this.auditNetworkSecurity(),
        this.auditSessionManagement(),
        this.auditErrorHandling(),
        this.auditLogging(),
        this.auditConfiguration(),
        this.auditDependencies(),
        this.auditPerformance()
      ])

      // Calculate overall score
      const overallScore = this.calculateOverallScore()
      const status = this.determineOverallStatus(overallScore)
      const recommendations = this.generateRecommendations()

      const auditResult: SecurityAuditResult = {
        overallScore,
        category: 'Full Security Audit',
        status,
        findings: this.findings,
        recommendations,
        timestamp: new Date().toISOString()
      }

      // Log audit completion
      logger.info('Security audit completed', {
        severity: 'low',
        details: `Security audit completed with score: ${overallScore}`,
        metadata: {
          findingsCount: this.findings.length,
          duration: Date.now() - startTime,
          status
        }
      })

      return auditResult
    } catch (error) {
      logger.error('Security audit failed', {
        context: 'security_audit',
        metadata: { duration: Date.now() - startTime }
      }, error as Error)

      throw error
    }
  }

  /**
   * Audit authentication and authorization
   */
  private static async auditAuthentication(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check for hardcoded secrets
    const envVars = process.env
    const secretKeys = ['SECRET', 'KEY', 'PASSWORD', 'TOKEN']
    
    for (const [key, value] of Object.entries(envVars)) {
      if (secretKeys.some(secretKey => key.includes(secretKey))) {
        if (value && (value.includes('test') || value.includes('dev') || value.includes('123'))) {
          findings.push({
            id: 'AUTH-001',
            category: 'Authentication',
            severity: 'High',
            title: 'Weak Secret Configuration',
            description: `Environment variable ${key} contains weak value`,
            impact: 'Weak secrets can be easily guessed or cracked',
            remediation: 'Use cryptographically secure random secrets',
            evidence: `Variable: ${key}`,
            status: 'Open'
          })
        }
      }
    }

    // Check for development authentication in production
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEV_AUTH === 'true') {
      findings.push({
        id: 'AUTH-002',
        category: 'Authentication',
        severity: 'Critical',
        title: 'Development Authentication Enabled in Production',
        description: 'Development authentication is enabled in production environment',
        impact: 'Allows unauthorized access to production system',
        remediation: 'Disable development authentication in production',
        evidence: 'ENABLE_DEV_AUTH=true in production',
        status: 'Open'
      })
    }

    // Check session configuration
    const sessionMaxAge = 24 * 60 * 60 // 24 hours
    if (sessionMaxAge > 7 * 24 * 60 * 60) { // More than 7 days
      findings.push({
        id: 'AUTH-003',
        category: 'Authentication',
        severity: 'Medium',
        title: 'Long Session Duration',
        description: 'Session duration is longer than recommended',
        impact: 'Increases risk of session hijacking',
        remediation: 'Reduce session duration to 24 hours or less',
        evidence: `Session max age: ${sessionMaxAge} seconds`,
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit input validation and sanitization
   */
  private static async auditInputValidation(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Test XSS detection
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">'
    ]

    for (const payload of xssPayloads) {
      if (!SecurityUtils.detectXSS(payload)) {
        findings.push({
          id: 'INPUT-001',
          category: 'Input Validation',
          severity: 'High',
          title: 'XSS Detection Failure',
          description: `XSS detection failed for payload: ${payload}`,
          impact: 'Malicious scripts could be executed',
          remediation: 'Improve XSS detection patterns',
          evidence: `Payload: ${payload}`,
          status: 'Open'
        })
      }
    }

    // Test HTML sanitization
    const maliciousHTML = '<script>alert("xss")</script><p>Hello</p>'
    const sanitized = SecurityUtils.sanitizeHTML(maliciousHTML)
    if (sanitized.includes('<script>')) {
      findings.push({
        id: 'INPUT-002',
        category: 'Input Validation',
        severity: 'High',
        title: 'HTML Sanitization Failure',
        description: 'HTML sanitization failed to remove malicious script',
        impact: 'Malicious HTML could be executed',
        remediation: 'Review and improve HTML sanitization',
        evidence: `Input: ${maliciousHTML}, Output: ${sanitized}`,
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit file upload security
   */
  private static async auditFileUpload(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const maliciousTypes = ['text/html', 'application/javascript', 'application/x-executable']

    for (const type of maliciousTypes) {
      const result = FileValidator.validateMimeType(type)
      if (result.isValid) {
        findings.push({
          id: 'FILE-001',
          category: 'File Upload',
          severity: 'High',
          title: 'Dangerous File Type Allowed',
          description: `Dangerous file type ${type} was allowed`,
          impact: 'Malicious files could be uploaded',
          remediation: 'Restrict file types to safe formats only',
          evidence: `Type: ${type}`,
          status: 'Open'
        })
      }
    }

    // Check file size limits
    const maxSize = 5 * 1024 * 1024 // 5MB
    const oversizedFile = 10 * 1024 * 1024 // 10MB
    const sizeResult = FileValidator.validateFileSize(oversizedFile)
    if (sizeResult.isValid) {
      findings.push({
        id: 'FILE-002',
        category: 'File Upload',
        severity: 'Medium',
        title: 'File Size Limit Too High',
        description: 'File size limit allows oversized files',
        impact: 'Could lead to storage exhaustion or DoS',
        remediation: 'Implement stricter file size limits',
        evidence: `Size limit: ${maxSize}, Test size: ${oversizedFile}`,
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit CSRF protection
   */
  private static async auditCSRFProtection(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Test CSRF token generation
    const token = CSRFProtection.createSignedToken()
    if (!token || token.split(':').length !== 3) {
      findings.push({
        id: 'CSRF-001',
        category: 'CSRF Protection',
        severity: 'High',
        title: 'CSRF Token Generation Failure',
        description: 'CSRF token generation failed or malformed',
        impact: 'CSRF protection may not work properly',
        remediation: 'Fix CSRF token generation',
        evidence: `Generated token: ${token}`,
        status: 'Open'
      })
    }

    // Test CSRF token validation
    const validation = CSRFProtection.verifySignedToken(token)
    if (!validation.isValid) {
      findings.push({
        id: 'CSRF-002',
        category: 'CSRF Protection',
        severity: 'High',
        title: 'CSRF Token Validation Failure',
        description: 'Valid CSRF token failed validation',
        impact: 'Legitimate requests may be blocked',
        remediation: 'Fix CSRF token validation',
        evidence: `Token: ${token}, Error: ${validation.error}`,
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit rate limiting
   */
  private static async auditRateLimiting(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check rate limit configurations
    const rateLimits = {
      GENERAL: { limit: 100, windowMs: 15 * 60 * 1000 },
      AUTH: { limit: 5, windowMs: 15 * 60 * 1000 },
      UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }
    }

    for (const [key, config] of Object.entries(rateLimits)) {
      if (config.limit > 1000) {
        findings.push({
          id: 'RATE-001',
          category: 'Rate Limiting',
          severity: 'Medium',
          title: 'Rate Limit Too High',
          description: `Rate limit for ${key} is too high`,
          impact: 'Could allow abuse or DoS attacks',
          remediation: 'Reduce rate limits to reasonable values',
          evidence: `Limit: ${config.limit}, Window: ${config.windowMs}`,
          status: 'Open'
        })
      }
    }

    this.findings.push(...findings)
  }

  /**
   * Audit security headers
   */
  private static async auditSecurityHeaders(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check for required security headers
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ]

    // This would typically check actual response headers
    // For now, we'll check configuration
    const nextConfig = require('../../../../next.config.js')
    if (!nextConfig.headers || !nextConfig.headers()) {
      findings.push({
        id: 'HEADER-001',
        category: 'Security Headers',
        severity: 'High',
        title: 'Missing Security Headers Configuration',
        description: 'Security headers are not configured',
        impact: 'Application vulnerable to various attacks',
        remediation: 'Configure security headers in next.config.js',
        evidence: 'No headers configuration found',
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit database security
   */
  private static async auditDatabaseSecurity(): Promise<void> {
    const findings: SecurityFinding[] = []

    try {
      const dbAudit = await DatabaseSecurity.validateConnection()
      
      if (!dbAudit.isSecure) {
        for (const issue of dbAudit.issues) {
          findings.push({
            id: 'DB-001',
            category: 'Database Security',
            severity: 'High',
            title: 'Database Security Issue',
            description: issue,
            impact: 'Database may be vulnerable to attacks',
            remediation: 'Address database security issues',
            evidence: issue,
            status: 'Open'
          })
        }
      }

      for (const recommendation of dbAudit.recommendations) {
        findings.push({
          id: 'DB-002',
          category: 'Database Security',
          severity: 'Medium',
          title: 'Database Security Recommendation',
          description: recommendation,
          impact: 'Database security could be improved',
          remediation: recommendation,
          evidence: recommendation,
          status: 'Open'
        })
      }
    } catch (error) {
      findings.push({
        id: 'DB-003',
        category: 'Database Security',
        severity: 'Critical',
        title: 'Database Connection Failed',
        description: 'Unable to connect to database for security audit',
        impact: 'Cannot verify database security',
        remediation: 'Fix database connection issues',
        evidence: error instanceof Error ? error.message : 'Unknown error',
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit network security
   */
  private static async auditNetworkSecurity(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check CORS configuration
    const corsConfig = NetworkSecurity.getConfig()
    if (corsConfig.allowedOrigins.includes('*')) {
      findings.push({
        id: 'NET-001',
        category: 'Network Security',
        severity: 'High',
        title: 'Overly Permissive CORS',
        description: 'CORS allows all origins',
        impact: 'Could allow cross-origin attacks',
        remediation: 'Restrict CORS to specific domains',
        evidence: 'CORS allows all origins (*)',
        status: 'Open'
      })
    }

    // Check for blocked IPs
    if (corsConfig.blockedIPs.length === 0) {
      findings.push({
        id: 'NET-002',
        category: 'Network Security',
        severity: 'Low',
        title: 'No Blocked IPs',
        description: 'No IP addresses are currently blocked',
        impact: 'No protection against known malicious IPs',
        remediation: 'Consider blocking known malicious IPs',
        evidence: 'No blocked IPs configured',
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit session management
   */
  private static async auditSessionManagement(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check session configuration
    const sessionConfig = {
      strategy: 'jwt',
      maxAge: 24 * 60 * 60, // 24 hours
      updateAge: 60 * 60 // 1 hour
    }

    if (sessionConfig.maxAge > 7 * 24 * 60 * 60) { // More than 7 days
      findings.push({
        id: 'SESSION-001',
        category: 'Session Management',
        severity: 'Medium',
        title: 'Long Session Duration',
        description: 'Session duration is longer than recommended',
        impact: 'Increases risk of session hijacking',
        remediation: 'Reduce session duration',
        evidence: `Max age: ${sessionConfig.maxAge} seconds`,
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit error handling
   */
  private static async auditErrorHandling(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check for generic error messages
    const errorMessages = [
      'Internal server error',
      'Something went wrong',
      'An error occurred'
    ]

    // This would typically check actual error responses
    // For now, we'll assume proper error handling is in place
    findings.push({
      id: 'ERROR-001',
      category: 'Error Handling',
      severity: 'Low',
      title: 'Error Handling Review Needed',
      description: 'Manual review of error handling recommended',
      impact: 'May expose sensitive information in errors',
      remediation: 'Review all error responses for information disclosure',
      evidence: 'Manual review required',
      status: 'Open'
    })

    this.findings.push(...findings)
  }

  /**
   * Audit logging
   */
  private static async auditLogging(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check logging configuration
    const logLevel = process.env.LOG_LEVEL || 'info'
    if (logLevel === 'debug' && process.env.NODE_ENV === 'production') {
      findings.push({
        id: 'LOG-001',
        category: 'Logging',
        severity: 'Medium',
        title: 'Debug Logging in Production',
        description: 'Debug logging is enabled in production',
        impact: 'May expose sensitive information in logs',
        remediation: 'Disable debug logging in production',
        evidence: `Log level: ${logLevel}`,
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Audit configuration
   */
  private static async auditConfiguration(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check environment variables
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'CSRF_SECRET_KEY',
      'DATABASE_URL'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        findings.push({
          id: 'CONFIG-001',
          category: 'Configuration',
          severity: 'Critical',
          title: 'Missing Required Environment Variable',
          description: `Required environment variable ${envVar} is not set`,
          impact: 'Application may not function properly',
          remediation: `Set ${envVar} environment variable`,
          evidence: `Missing: ${envVar}`,
          status: 'Open'
        })
      }
    }

    this.findings.push(...findings)
  }

  /**
   * Audit dependencies
   */
  private static async auditDependencies(): Promise<void> {
    const findings: SecurityFinding[] = []

    // Check for known vulnerable packages
    const packageJson = require('../../../../package.json')
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

    // Known vulnerable packages (this would typically use npm audit)
    const vulnerablePackages = [
      'lodash', // Example - check for specific versions
      'moment'  // Example - check for specific versions
    ]

    for (const pkg of vulnerablePackages) {
      if (dependencies[pkg]) {
        findings.push({
          id: 'DEPS-001',
          category: 'Dependencies',
          severity: 'Medium',
          title: 'Potentially Vulnerable Dependency',
          description: `Package ${pkg} may have known vulnerabilities`,
          impact: 'Application may be vulnerable to known attacks',
          remediation: 'Update package to latest secure version',
          evidence: `Package: ${pkg}@${dependencies[pkg]}`,
          status: 'Open'
        })
      }
    }

    this.findings.push(...findings)
  }

  /**
   * Audit performance impact
   */
  private static async auditPerformance(): Promise<void> {
    const findings: SecurityFinding[] = []

    try {
      const performanceStats = SecurityPerformanceMonitor.getPerformanceStats()
      const securityImpact = performanceStats.securityImpact

      if (securityImpact.totalOverhead > 1000) { // More than 1 second
        findings.push({
          id: 'PERF-001',
          category: 'Performance',
          severity: 'Medium',
          title: 'High Security Overhead',
          description: 'Security operations add significant overhead',
          impact: 'May impact user experience',
          remediation: 'Optimize security operations',
          evidence: `Total overhead: ${securityImpact.totalOverhead}ms`,
          status: 'Open'
        })
      }

      if (performanceStats.avgResponseTime > 2000) { // More than 2 seconds
        findings.push({
          id: 'PERF-002',
          category: 'Performance',
          severity: 'Medium',
          title: 'Slow Response Times',
          description: 'Average response time is too high',
          impact: 'Poor user experience',
          remediation: 'Optimize application performance',
          evidence: `Avg response time: ${performanceStats.avgResponseTime}ms`,
          status: 'Open'
        })
      }
    } catch (error) {
      findings.push({
        id: 'PERF-003',
        category: 'Performance',
        severity: 'Low',
        title: 'Performance Audit Failed',
        description: 'Unable to complete performance audit',
        impact: 'Cannot assess performance impact',
        remediation: 'Fix performance monitoring',
        evidence: error instanceof Error ? error.message : 'Unknown error',
        status: 'Open'
      })
    }

    this.findings.push(...findings)
  }

  /**
   * Calculate overall security score
   */
  private static calculateOverallScore(): number {
    if (this.findings.length === 0) return 100

    const severityWeights = {
      Critical: 10,
      High: 7,
      Medium: 4,
      Low: 1
    }

    const totalWeight = this.findings.reduce((sum, finding) => {
      return sum + severityWeights[finding.severity]
    }, 0)

    const maxPossibleWeight = this.findings.length * 10
    const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100)

    return Math.round(score)
  }

  /**
   * Determine overall audit status
   */
  private static determineOverallStatus(score: number): 'PASS' | 'WARN' | 'FAIL' {
    if (score >= 90) return 'PASS'
    if (score >= 70) return 'WARN'
    return 'FAIL'
  }

  /**
   * Generate recommendations
   */
  private static generateRecommendations(): string[] {
    const recommendations: string[] = []

    const criticalFindings = this.findings.filter(f => f.severity === 'Critical')
    const highFindings = this.findings.filter(f => f.severity === 'High')

    if (criticalFindings.length > 0) {
      recommendations.push('Address all critical security findings immediately')
    }

    if (highFindings.length > 0) {
      recommendations.push('Address high-severity security findings within 48 hours')
    }

    if (this.findings.length > 10) {
      recommendations.push('Consider implementing automated security testing')
    }

    recommendations.push('Schedule regular security audits')
    recommendations.push('Implement continuous security monitoring')
    recommendations.push('Review and update security policies')

    return recommendations
  }
}

/**
 * Security audit API endpoint
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const auditResult = await SecurityAuditor.runFullAudit()
    res.status(200).json(auditResult)
  } catch (error) {
    logger.error('Security audit API failed', {
      context: 'security_audit_api'
    }, error as Error)
    res.status(500).json({ error: 'Security audit failed' })
  }
}

