// Smart Security Engine Decision System
// Automatically approves security actions within scope, requires approval for system config changes

export interface SecurityAction {
  id: string
  type: string
  description: string
  priority: string
  timestamp: string
  requiresApproval: boolean
  details?: Record<string, any>
}

export interface DecisionResult {
  approved: boolean
  reason: string
  confidence: number
  requiresHumanApproval: boolean
  actionTaken: string
}

export class SecurityDecisionEngine {
  // Actions that are within autonomous scope (security-focused)
  private readonly AUTONOMOUS_SCOPE = [
    'ip_block',
    'user_suspension', 
    'user_block',
    'threat_detection',
    'malware_quarantine',
    'suspicious_activity_response',
    'brute_force_protection',
    'ddos_mitigation',
    'intrusion_prevention',
    'security_rule_update',
    'firewall_rule_add',
    'access_control_update'
  ]

  // Actions that require human approval (system configuration)
  private readonly REQUIRES_APPROVAL = [
    'system_update',
    'database_migration',
    'service_restart',
    'configuration_change',
    'permission_change',
    'backup_restore',
    'certificate_renewal',
    'network_configuration',
    'server_maintenance',
    'application_deployment'
  ]

  // Risk thresholds for autonomous decisions
  private readonly RISK_THRESHOLDS = {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8,
    CRITICAL: 0.9
  }

  /**
   * Make an intelligent decision about a security action
   */
  public makeDecision(action: SecurityAction): DecisionResult {
    const actionType = action.type.toLowerCase()
    
    // Check if action is within autonomous scope
    if (this.isWithinAutonomousScope(actionType)) {
      return this.makeAutonomousDecision(action)
    }
    
    // Check if action requires approval
    if (this.requiresApproval(actionType)) {
      return {
        approved: false,
        reason: 'System configuration change requires admin approval',
        confidence: 1.0,
        requiresHumanApproval: true,
        actionTaken: 'Queued for admin review'
      }
    }
    
    // Default: require approval for unknown actions
    return {
      approved: false,
      reason: 'Unknown action type - requires admin review',
      confidence: 0.5,
      requiresHumanApproval: true,
      actionTaken: 'Queued for admin review'
    }
  }

  /**
   * Check if action is within autonomous security scope
   */
  private isWithinAutonomousScope(actionType: string): boolean {
    return this.AUTONOMOUS_SCOPE.some(scope => 
      actionType.includes(scope) || scope.includes(actionType)
    )
  }

  /**
   * Check if action requires human approval
   */
  private requiresApproval(actionType: string): boolean {
    return this.REQUIRES_APPROVAL.some(scope => 
      actionType.includes(scope) || scope.includes(actionType)
    )
  }

  /**
   * Make autonomous decision for security actions
   */
  private makeAutonomousDecision(action: SecurityAction): DecisionResult {
    const riskScore = this.calculateRiskScore(action)
    const priority = action.priority.toLowerCase()
    
    // High/Critical priority security actions are auto-approved
    if (priority === 'high' || priority === 'critical') {
      return {
        approved: true,
        reason: `High priority security action (${priority}) - autonomous approval`,
        confidence: 0.95,
        requiresHumanApproval: false,
        actionTaken: 'Automatically approved and executed'
      }
    }
    
    // Medium priority with high risk score
    if (priority === 'medium' && riskScore >= this.RISK_THRESHOLDS.MEDIUM) {
      return {
        approved: true,
        reason: `Medium priority with high risk score (${riskScore.toFixed(2)}) - autonomous approval`,
        confidence: 0.85,
        requiresHumanApproval: false,
        actionTaken: 'Automatically approved and executed'
      }
    }
    
    // Low priority or low risk - require approval
    return {
      approved: false,
      reason: `Low priority (${priority}) or low risk (${riskScore.toFixed(2)}) - requires admin review`,
      confidence: 0.7,
      requiresHumanApproval: true,
      actionTaken: 'Queued for admin review'
    }
  }

  /**
   * Calculate risk score based on action details
   */
  private calculateRiskScore(action: SecurityAction): number {
    let score = 0.5 // Base score
    
    // Adjust based on action type
    if (action.type.includes('ip_block')) score += 0.3
    if (action.type.includes('user_suspension')) score += 0.4
    if (action.type.includes('threat_detection')) score += 0.2
    if (action.type.includes('brute_force')) score += 0.4
    if (action.type.includes('ddos')) score += 0.5
    
    // Adjust based on details
    if (action.details) {
      if (action.details.riskScore) {
        score = Math.max(score, action.details.riskScore / 100)
      }
      if (action.details.multipleAttempts) score += 0.2
      if (action.details.suspiciousPattern) score += 0.3
      if (action.details.knownThreat) score += 0.4
    }
    
    return Math.min(score, 1.0) // Cap at 1.0
  }

  /**
   * Get autonomous scope actions for display
   */
  public getAutonomousScope(): string[] {
    return [...this.AUTONOMOUS_SCOPE]
  }

  /**
   * Get actions requiring approval for display
   */
  public getRequiresApproval(): string[] {
    return [...this.REQUIRES_APPROVAL]
  }
}

// Export singleton instance
export const securityDecisionEngine = new SecurityDecisionEngine()
