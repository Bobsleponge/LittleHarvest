import { prisma } from './prisma'
import { logger } from './logger'

export interface SecurityEventAnalysis {
  riskScore: number
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  threatType: string
  indicators: string[]
  recommendedActions: string[]
  playbookId?: string
  shouldCreateIncident: boolean
  confidence: number
}

export interface IncidentResponse {
  incidentId: string
  actions: string[]
  timeline: Array<{
    timestamp: Date
    action: string
    actor: string
    details: string
  }>
  evidence: string[]
  lessons: string[]
}

export class SecurityIncidentResponseEngine {
  private threatIntelligence: Map<string, any> = new Map()
  private playbooks: Map<string, any> = new Map()
  private initialized: boolean = false

  constructor() {
    // Don't load data in constructor - defer to first use
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.loadThreatIntelligence()
      await this.loadPlaybooks()
      this.initialized = true
    }
  }

  /**
   * Analyze a security event and determine appropriate response
   */
  async analyzeSecurityEvent(event: any): Promise<SecurityEventAnalysis> {
    await this.ensureInitialized()
    
    const analysis: SecurityEventAnalysis = {
      riskScore: 0,
      severity: 'info',
      threatType: 'unknown',
      indicators: [],
      recommendedActions: [],
      shouldCreateIncident: false,
      confidence: 0
    }

    // Risk scoring based on event characteristics
    analysis.riskScore = this.calculateRiskScore(event)
    analysis.severity = this.determineSeverity(analysis.riskScore)
    analysis.threatType = this.classifyThreatType(event)
    analysis.indicators = this.extractIndicators(event)
    analysis.confidence = this.calculateConfidence(event, analysis)

    // Determine if incident should be created
    analysis.shouldCreateIncident = this.shouldCreateIncident(analysis)

    // Get recommended actions from playbooks
    analysis.recommendedActions = await this.getRecommendedActions(event, analysis)
    analysis.playbookId = await this.findMatchingPlaybook(event, analysis)

    return analysis
  }

  /**
   * Create and manage a security incident
   */
  async createIncident(
    event: any, 
    analysis: SecurityEventAnalysis, 
    reportedBy: string
  ): Promise<IncidentResponse> {
    await this.ensureInitialized()
    
    const incidentId = await this.generateIncidentId()
    
    // Create the incident record
    const incident = await prisma.securityIncident.create({
      data: {
        incidentId,
        title: this.generateIncidentTitle(event, analysis),
        description: this.generateIncidentDescription(event, analysis),
        type: analysis.threatType,
        severity: analysis.severity,
        status: 'open',
        priority: this.determinePriority(analysis),
        riskScore: analysis.riskScore,
        source: 'automated',
        affectedSystems: JSON.stringify(this.getAffectedSystems(event)),
        indicators: JSON.stringify(analysis.indicators),
        timeline: JSON.stringify([{
          timestamp: new Date(),
          action: 'Incident Created',
          actor: 'Security System',
          details: 'Automated incident creation based on security event analysis'
        }]),
        evidence: JSON.stringify(this.collectInitialEvidence(event)),
        actions: JSON.stringify(analysis.recommendedActions),
        reportedBy,
        detectedAt: new Date(event.createdAt || new Date())
      }
    })

    // Link the security event to the incident
    await prisma.securityEvent.update({
      where: { id: event.id },
      data: { incidentId: incident.id }
    })

    // Execute initial response actions
    const response = await this.executeInitialResponse(incident, analysis)

    // Log the incident creation
    logger.warn('Security incident created', {
      incidentId: incident.incidentId,
      type: analysis.threatType,
      severity: analysis.severity,
      riskScore: analysis.riskScore
    })

    return response
  }

  /**
   * Execute automated response actions
   */
  async executeAutomatedResponse(incident: any, actions: string[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(incident, action)
        
        // Log the action
        await this.addTimelineEntry(incident.id, {
          timestamp: new Date(),
          action: `Automated: ${action}`,
          actor: 'Security System',
          details: `Automated response action executed: ${action}`
        })
      } catch (error) {
        logger.error('Failed to execute automated response action', {
          incidentId: incident.incidentId,
          action,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  /**
   * Calculate risk score based on event characteristics
   */
  private calculateRiskScore(event: any): number {
    let score = 0

    // Base score by event type
    const typeScores: Record<string, number> = {
      'failed_login': 20,
      'suspicious_activity': 40,
      'unauthorized_access': 60,
      'data_breach': 80,
      'malware': 90,
      'phishing': 70,
      'ddos': 85
    }
    score += typeScores[event.type] || 10

    // Severity multiplier
    const severityMultipliers: Record<string, number> = {
      'critical': 1.5,
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8,
      'info': 0.5
    }
    score *= severityMultipliers[event.severity] || 1.0

    // IP reputation check
    if (this.isKnownThreatIP(event.ipAddress)) {
      score += 30
    }

    // User agent analysis
    if (this.isSuspiciousUserAgent(event.userAgent)) {
      score += 15
    }

    // Geographic anomaly
    if (this.isGeographicAnomaly(event.location)) {
      score += 20
    }

    // Time-based anomaly
    if (this.isTimeAnomaly(event.createdAt)) {
      score += 10
    }

    return Math.min(100, Math.max(0, score))
  }

  /**
   * Determine severity based on risk score
   */
  private determineSeverity(riskScore: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    if (riskScore >= 80) return 'critical'
    if (riskScore >= 60) return 'high'
    if (riskScore >= 40) return 'medium'
    if (riskScore >= 20) return 'low'
    return 'info'
  }

  /**
   * Classify threat type based on event characteristics
   */
  private classifyThreatType(event: any): string {
    const patterns: Record<string, string[]> = {
      'malware': ['malware', 'virus', 'trojan', 'ransomware'],
      'phishing': ['phishing', 'spoof', 'fake', 'credential'],
      'ddos': ['ddos', 'flood', 'overload', 'attack'],
      'data_breach': ['breach', 'leak', 'exfiltrat', 'unauthorized_access'],
      'suspicious_activity': ['suspicious', 'anomaly', 'unusual', 'strange'],
      'failed_login': ['failed_login', 'brute_force', 'password'],
      'unauthorized_access': ['unauthorized', 'privilege', 'escalation']
    }

    const eventText = `${event.type} ${event.details || ''}`.toLowerCase()
    
    for (const [threatType, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => eventText.includes(keyword))) {
        return threatType
      }
    }

    return 'unknown'
  }

  /**
   * Extract indicators of compromise
   */
  private extractIndicators(event: any): string[] {
    const indicators: string[] = []

    // IP address
    if (event.ipAddress) {
      indicators.push(`IP:${event.ipAddress}`)
    }

    // User agent
    if (event.userAgent) {
      indicators.push(`UserAgent:${event.userAgent}`)
    }

    // Email
    if (event.userEmail) {
      indicators.push(`Email:${event.userEmail}`)
    }

    // Location
    if (event.location) {
      indicators.push(`Location:${event.location}`)
    }

    // Extract additional indicators from metadata
    if (event.metadata) {
      try {
        const metadata = JSON.parse(event.metadata)
        if (metadata.url) indicators.push(`URL:${metadata.url}`)
        if (metadata.domain) indicators.push(`Domain:${metadata.domain}`)
        if (metadata.hash) indicators.push(`Hash:${metadata.hash}`)
      } catch (error) {
        // Ignore JSON parse errors
      }
    }

    return indicators
  }

  /**
   * Get recommended actions from playbooks
   */
  private async getRecommendedActions(event: any, analysis: SecurityEventAnalysis): Promise<string[]> {
    const actions: string[] = []

    // Default actions based on threat type
    const defaultActions: Record<string, string[]> = {
      'malware': [
        'Isolate affected systems',
        'Run antivirus scan',
        'Check for lateral movement',
        'Update threat intelligence feeds'
      ],
      'phishing': [
        'Block malicious URLs',
        'Notify affected users',
        'Check for credential compromise',
        'Update email filters'
      ],
      'ddos': [
        'Activate DDoS protection',
        'Scale up resources',
        'Monitor traffic patterns',
        'Contact ISP if needed'
      ],
      'data_breach': [
        'Contain the breach',
        'Assess data exposure',
        'Notify stakeholders',
        'Preserve evidence'
      ],
      'failed_login': [
        'Block suspicious IPs',
        'Enable account lockout',
        'Monitor for patterns',
        'Check for credential stuffing'
      ],
      'unauthorized_access': [
        'Revoke access',
        'Change passwords',
        'Audit permissions',
        'Monitor for persistence'
      ]
    }

    actions.push(...(defaultActions[analysis.threatType] || ['Investigate further']))

    // Add severity-specific actions
    if (analysis.severity === 'critical') {
      actions.unshift('Immediate escalation to security team')
    }

    return actions
  }

  /**
   * Execute a specific action
   */
  private async executeAction(incident: any, action: string): Promise<void> {
    // This would integrate with actual security tools
    // For now, we'll simulate the actions
    
    if (action.includes('Block')) {
      // Block IP addresses, URLs, etc.
      await this.blockThreatIndicators(incident)
    }
    
    if (action.includes('Isolate')) {
      // Isolate affected systems
      await this.isolateSystems(incident)
    }
    
    if (action.includes('Scan')) {
      // Run security scans
      await this.runSecurityScans(incident)
    }
    
    if (action.includes('Notify')) {
      // Send notifications
      await this.sendNotifications(incident, action)
    }
  }

  /**
   * Helper methods for threat intelligence and analysis
   */
  private isKnownThreatIP(ip: string): boolean {
    // Check against threat intelligence database
    return this.threatIntelligence.has(`ip:${ip}`)
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      'bot', 'crawler', 'scanner', 'hack', 'exploit',
      'sqlmap', 'nikto', 'nmap', 'masscan'
    ]
    return suspiciousPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    )
  }

  private isGeographicAnomaly(location: string): boolean {
    // Check if location is unusual for the organization
    const normalLocations = ['South Africa', 'Cape Town', 'Johannesburg']
    return !normalLocations.some(loc => location.includes(loc))
  }

  private isTimeAnomaly(timestamp: Date): boolean {
    const hour = timestamp.getHours()
    // Flag activity outside business hours (6 AM - 10 PM)
    return hour < 6 || hour > 22
  }

  private shouldCreateIncident(analysis: SecurityEventAnalysis): boolean {
    return analysis.riskScore >= 40 || analysis.severity === 'high' || analysis.severity === 'critical'
  }

  private calculateConfidence(event: any, analysis: SecurityEventAnalysis): number {
    let confidence = 50 // Base confidence

    // Increase confidence based on indicators
    confidence += analysis.indicators.length * 5

    // Increase confidence for known threat patterns
    if (this.isKnownThreatIP(event.ipAddress)) {
      confidence += 20
    }

    // Decrease confidence for low-severity events
    if (analysis.severity === 'low' || analysis.severity === 'info') {
      confidence -= 20
    }

    return Math.min(100, Math.max(0, confidence))
  }

  private async generateIncidentId(): Promise<string> {
    const year = new Date().getFullYear()
    const count = await prisma.securityIncident.count({
      where: {
        incidentId: {
          startsWith: `INC-${year}`
        }
      }
    })
    return `INC-${year}-${String(count + 1).padStart(3, '0')}`
  }

  private generateIncidentTitle(event: any, analysis: SecurityEventAnalysis): string {
    return `${analysis.threatType.replace('_', ' ').toUpperCase()} - ${event.type.replace('_', ' ')} from ${event.ipAddress}`
  }

  private generateIncidentDescription(event: any, analysis: SecurityEventAnalysis): string {
    return `Security incident detected: ${event.type} event with ${analysis.severity} severity. Risk score: ${analysis.riskScore}/100. Indicators: ${analysis.indicators.join(', ')}`
  }

  private determinePriority(analysis: SecurityEventAnalysis): string {
    if (analysis.severity === 'critical') return 'p1'
    if (analysis.severity === 'high') return 'p2'
    if (analysis.severity === 'medium') return 'p3'
    return 'p4'
  }

  private getAffectedSystems(event: any): string[] {
    // Determine affected systems based on event
    const systems = ['Web Application', 'Database', 'API']
    
    if (event.type.includes('login')) {
      systems.push('Authentication System')
    }
    
    if (event.type.includes('data')) {
      systems.push('Data Storage')
    }

    return systems
  }

  private collectInitialEvidence(event: any): string[] {
    const evidence = []
    
    if (event.ipAddress) evidence.push(`Source IP: ${event.ipAddress}`)
    if (event.userAgent) evidence.push(`User Agent: ${event.userAgent}`)
    if (event.userEmail) evidence.push(`User Email: ${event.userEmail}`)
    if (event.location) evidence.push(`Location: ${event.location}`)
    if (event.details) evidence.push(`Event Details: ${event.details}`)
    
    return evidence
  }

  private async executeInitialResponse(incident: any, analysis: SecurityEventAnalysis): Promise<IncidentResponse> {
    const response: IncidentResponse = {
      incidentId: incident.incidentId,
      actions: analysis.recommendedActions,
      timeline: [],
      evidence: [],
      lessons: []
    }

    // Execute automated actions
    await this.executeAutomatedResponse(incident, analysis.recommendedActions.slice(0, 3))

    return response
  }

  private async addTimelineEntry(incidentId: string, entry: any): Promise<void> {
    const incident = await prisma.securityIncident.findUnique({
      where: { id: incidentId }
    })

    if (incident) {
      const timeline = JSON.parse(incident.timeline || '[]')
      timeline.push(entry)
      
      await prisma.securityIncident.update({
        where: { id: incidentId },
        data: { timeline: JSON.stringify(timeline) }
      })
    }
  }

  private async blockThreatIndicators(incident: any): Promise<void> {
    const indicators = JSON.parse(incident.indicators || '[]')
    
    for (const indicator of indicators) {
      if (indicator.startsWith('IP:')) {
        const ip = indicator.replace('IP:', '')
        await prisma.blockedIP.create({
          data: {
            ipAddress: ip,
            reason: `Blocked due to incident ${incident.incidentId}`,
            blockedBy: 'Security System',
            metadata: JSON.stringify({ incidentId: incident.incidentId })
          }
        })
      }
    }
  }

  private async isolateSystems(incident: any): Promise<void> {
    // Simulate system isolation
    logger.info('Systems isolated', { incidentId: incident.incidentId })
  }

  private async runSecurityScans(incident: any): Promise<void> {
    // Simulate security scans
    logger.info('Security scans initiated', { incidentId: incident.incidentId })
  }

  private async sendNotifications(incident: any, action: string): Promise<void> {
    // Send notifications to security team
    logger.info('Notifications sent', { 
      incidentId: incident.incidentId, 
      action 
    })
  }

  private async findMatchingPlaybook(event: any, analysis: SecurityEventAnalysis): Promise<string | undefined> {
    const playbook = await prisma.securityPlaybook.findFirst({
      where: {
        category: analysis.threatType,
        severity: analysis.severity,
        isActive: true
      }
    })
    
    return playbook?.id
  }

  private async loadThreatIntelligence(): Promise<void> {
    try {
      // Load threat intelligence from database
      const threats = await prisma.securityThreatIntelligence.findMany({
        where: { isActive: true }
      })
      
      for (const threat of threats) {
        this.threatIntelligence.set(`${threat.type}:${threat.value}`, threat)
      }
    } catch (error) {
      logger.warn('Failed to load threat intelligence', { error })
      // Add some default threat intelligence
      this.addDefaultThreatIntelligence()
    }
  }

  private addDefaultThreatIntelligence(): void {
    const defaultThreats = [
      { type: 'ip_address', value: '192.168.1.1', threatType: 'malware', severity: 'high', confidence: 85 },
      { type: 'domain', value: 'malicious-site.com', threatType: 'phishing', severity: 'critical', confidence: 95 },
      { type: 'email', value: 'spam@example.com', threatType: 'spam', severity: 'medium', confidence: 70 }
    ]
    
    for (const threat of defaultThreats) {
      this.threatIntelligence.set(`${threat.type}:${threat.value}`, threat)
    }
  }

  private async loadPlaybooks(): Promise<void> {
    try {
      // Load security playbooks from database
      const playbooks = await prisma.securityPlaybook.findMany({
        where: { isActive: true }
      })
      
      for (const playbook of playbooks) {
        this.playbooks.set(`${playbook.category}:${playbook.severity}`, playbook)
      }
    } catch (error) {
      logger.warn('Failed to load security playbooks', { error })
      // Add some default playbooks
      this.addDefaultPlaybooks()
    }
  }

  private addDefaultPlaybooks(): void {
    const defaultPlaybooks = [
      { 
        category: 'malware', 
        severity: 'critical', 
        steps: ['Isolate affected systems', 'Run antivirus scan', 'Update security patches', 'Monitor for lateral movement'],
        name: 'Malware Response - Critical'
      },
      { 
        category: 'phishing', 
        severity: 'high', 
        steps: ['Block malicious URLs', 'Reset compromised passwords', 'Educate users', 'Monitor for data exfiltration'],
        name: 'Phishing Response - High'
      },
      { 
        category: 'suspicious_activity', 
        severity: 'medium', 
        steps: ['Investigate source', 'Monitor user behavior', 'Check for data access', 'Document findings'],
        name: 'Suspicious Activity Response - Medium'
      }
    ]
    
    for (const playbook of defaultPlaybooks) {
      this.playbooks.set(`${playbook.category}:${playbook.severity}`, playbook)
    }
  }
}
