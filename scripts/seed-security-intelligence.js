const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const securityPlaybooks = [
  {
    name: 'Malware Detection Response',
    description: 'Standard response procedure for malware detection incidents',
    type: 'incident_type',
    category: 'malware',
    severity: 'critical',
    steps: JSON.stringify([
      'Isolate affected systems immediately',
      'Run full antivirus scan on all systems',
      'Check for lateral movement indicators',
      'Update threat intelligence feeds',
      'Notify security team and stakeholders',
      'Preserve evidence for forensic analysis',
      'Implement additional monitoring',
      'Review and update security policies'
    ]),
    conditions: JSON.stringify([
      'malware_detected',
      'virus_alert',
      'trojan_detected',
      'ransomware_alert'
    ]),
    isActive: true,
    version: '1.0',
    createdBy: 'system'
  },
  {
    name: 'Phishing Attack Response',
    description: 'Response procedure for phishing attacks and credential compromise',
    type: 'incident_type',
    category: 'phishing',
    severity: 'high',
    steps: JSON.stringify([
      'Block malicious URLs and domains',
      'Notify affected users immediately',
      'Check for credential compromise',
      'Force password reset for affected accounts',
      'Update email filters and security rules',
      'Monitor for additional phishing attempts',
      'Conduct security awareness training',
      'Review email security policies'
    ]),
    conditions: JSON.stringify([
      'phishing_email_detected',
      'credential_compromise',
      'suspicious_email_activity',
      'fake_login_page'
    ]),
    isActive: true,
    version: '1.0',
    createdBy: 'system'
  },
  {
    name: 'DDoS Attack Response',
    description: 'Response procedure for distributed denial of service attacks',
    type: 'incident_type',
    category: 'ddos',
    severity: 'critical',
    steps: JSON.stringify([
      'Activate DDoS protection services',
      'Scale up server resources immediately',
      'Monitor traffic patterns and sources',
      'Contact ISP for additional protection',
      'Implement rate limiting',
      'Monitor system performance',
      'Prepare incident report',
      'Review DDoS mitigation strategies'
    ]),
    conditions: JSON.stringify([
      'high_traffic_volume',
      'server_overload',
      'network_congestion',
      'service_unavailability'
    ]),
    isActive: true,
    version: '1.0',
    createdBy: 'system'
  },
  {
    name: 'Data Breach Response',
    description: 'Critical response procedure for data breach incidents',
    type: 'incident_type',
    category: 'data_breach',
    severity: 'critical',
    steps: JSON.stringify([
      'Contain the breach immediately',
      'Assess scope of data exposure',
      'Notify legal and compliance teams',
      'Preserve all evidence',
      'Notify affected customers/users',
      'Report to regulatory authorities',
      'Implement additional security measures',
      'Conduct post-incident review'
    ]),
    conditions: JSON.stringify([
      'unauthorized_data_access',
      'data_exfiltration',
      'database_breach',
      'sensitive_data_exposure'
    ]),
    isActive: true,
    version: '1.0',
    createdBy: 'system'
  },
  {
    name: 'Failed Login Response',
    description: 'Response procedure for suspicious login attempts and brute force attacks',
    type: 'incident_type',
    category: 'failed_login',
    severity: 'medium',
    steps: JSON.stringify([
      'Block suspicious IP addresses',
      'Enable account lockout policies',
      'Monitor for credential stuffing patterns',
      'Check for compromised accounts',
      'Implement additional authentication',
      'Review access logs',
      'Update password policies',
      'Notify affected users'
    ]),
    conditions: JSON.stringify([
      'multiple_failed_logins',
      'brute_force_attempt',
      'credential_stuffing',
      'suspicious_login_patterns'
    ]),
    isActive: true,
    version: '1.0',
    createdBy: 'system'
  },
  {
    name: 'Unauthorized Access Response',
    description: 'Response procedure for unauthorized access attempts',
    type: 'incident_type',
    category: 'unauthorized_access',
    severity: 'high',
    steps: JSON.stringify([
      'Revoke unauthorized access immediately',
      'Change all affected passwords',
      'Audit user permissions and roles',
      'Monitor for persistence indicators',
      'Check for privilege escalation',
      'Review access control policies',
      'Implement additional monitoring',
      'Conduct security assessment'
    ]),
    conditions: JSON.stringify([
      'privilege_escalation',
      'unauthorized_admin_access',
      'suspicious_permission_changes',
      'access_anomaly'
    ]),
    isActive: true,
    version: '1.0',
    createdBy: 'system'
  }
]

const threatIntelligence = [
  // Known malicious IP addresses
  { type: 'ip_address', value: '192.168.1.100', threatType: 'malware', severity: 'high', confidence: 85, source: 'external', description: 'Known malware C&C server', tags: JSON.stringify(['malware', 'c2', 'botnet']) },
  { type: 'ip_address', value: '10.0.0.50', threatType: 'phishing', severity: 'medium', confidence: 70, source: 'external', description: 'Phishing campaign source', tags: JSON.stringify(['phishing', 'spam']) },
  { type: 'ip_address', value: '172.16.0.25', threatType: 'ddos', severity: 'high', confidence: 90, source: 'external', description: 'DDoS attack source', tags: JSON.stringify(['ddos', 'attack']) },
  
  // Malicious domains
  { type: 'domain', value: 'fake-bank-security.com', threatType: 'phishing', severity: 'critical', confidence: 95, source: 'external', description: 'Fake banking phishing site', tags: JSON.stringify(['phishing', 'banking', 'fake']) },
  { type: 'domain', value: 'malware-download.net', threatType: 'malware', severity: 'high', confidence: 80, source: 'external', description: 'Malware distribution site', tags: JSON.stringify(['malware', 'download']) },
  
  // Suspicious email addresses
  { type: 'email', value: 'noreply@fake-paypal.com', threatType: 'phishing', severity: 'high', confidence: 85, source: 'external', description: 'Fake PayPal phishing email', tags: JSON.stringify(['phishing', 'paypal', 'fake']) },
  { type: 'email', value: 'security@microsoft-support.net', threatType: 'phishing', severity: 'medium', confidence: 75, source: 'external', description: 'Fake Microsoft support email', tags: JSON.stringify(['phishing', 'microsoft', 'support']) },
  
  // Malicious URLs
  { type: 'url', value: 'https://bit.ly/suspicious-link', threatType: 'malware', severity: 'high', confidence: 80, source: 'external', description: 'Shortened URL leading to malware', tags: JSON.stringify(['malware', 'shortened-url']) },
  { type: 'url', value: 'http://fake-login-page.com/login', threatType: 'phishing', severity: 'critical', confidence: 90, source: 'external', description: 'Fake login page for credential theft', tags: JSON.stringify(['phishing', 'login', 'fake']) },
  
  // File hashes
  { type: 'hash', value: 'a1b2c3d4e5f6789012345678901234567890abcd', threatType: 'malware', severity: 'high', confidence: 95, source: 'external', description: 'Known malware file hash', tags: JSON.stringify(['malware', 'trojan', 'hash']) },
  { type: 'hash', value: 'f9e8d7c6b5a4321098765432109876543210fedc', threatType: 'malware', severity: 'critical', confidence: 98, source: 'external', description: 'Ransomware file hash', tags: JSON.stringify(['malware', 'ransomware', 'hash']) }
]

async function seedSecurityData() {
  try {
    console.log('🌱 Seeding security playbooks...')
    
    for (const playbook of securityPlaybooks) {
      await prisma.securityPlaybook.create({
        data: playbook
      })
    }
    
    console.log(`✅ Created ${securityPlaybooks.length} security playbooks`)

    console.log('🌱 Seeding threat intelligence...')
    
    for (const threat of threatIntelligence) {
      await prisma.securityThreatIntelligence.create({
        data: threat
      })
    }
    
    console.log(`✅ Created ${threatIntelligence.length} threat intelligence entries`)

    console.log('🎉 Security data seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding security data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedSecurityData()
