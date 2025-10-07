# Tiny Tasters Security Documentation

## Table of Contents
1. [Security Overview](#security-overview)
2. [Security Architecture](#security-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [File Upload Security](#file-upload-security)
6. [CSRF Protection](#csrf-protection)
7. [Rate Limiting](#rate-limiting)
8. [Security Headers](#security-headers)
9. [Database Security](#database-security)
10. [Network Security](#network-security)
11. [Security Monitoring](#security-monitoring)
12. [Incident Response](#incident-response)
13. [Security Testing](#security-testing)
14. [Performance Impact](#performance-impact)
15. [Deployment Security](#deployment-security)
16. [Security Checklist](#security-checklist)

## Security Overview

Tiny Tasters implements a comprehensive security framework designed to protect against common web application vulnerabilities and ensure compliance with industry best practices.

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal necessary permissions
- **Fail Secure**: Secure defaults and graceful degradation
- **Security by Design**: Security integrated from the ground up
- **Continuous Monitoring**: Real-time security monitoring

### Threat Model
- **External Threats**: Malicious users, automated attacks, DDoS
- **Internal Threats**: Privilege escalation, data exfiltration
- **Infrastructure Threats**: Server compromise, network attacks
- **Data Threats**: Data breaches, unauthorized access

## Security Architecture

### Security Layers
1. **Network Layer**: Firewall, DDoS protection, SSL/TLS
2. **Application Layer**: Authentication, authorization, input validation
3. **Data Layer**: Encryption, access controls, audit logging
4. **Infrastructure Layer**: Server hardening, monitoring, backups

### Security Components
- **Authentication System**: NextAuth.js with multiple providers
- **Authorization Framework**: Role-based access control
- **Input Validation**: Joi schemas with XSS protection
- **File Security**: Magic byte validation, virus scanning
- **CSRF Protection**: Signed tokens with expiration
- **Rate Limiting**: Redis-backed with multiple policies
- **Security Headers**: Helmet.js with CSP
- **Monitoring**: Structured logging with real-time alerts

## Authentication & Authorization

### Authentication Methods
1. **Email Magic Links**: Passwordless authentication
2. **Google OAuth**: Social authentication
3. **Development Login**: Local development only

### Session Management
- **Strategy**: JWT tokens with 24-hour expiration
- **Refresh**: Automatic token refresh
- **Security**: Secure session validation
- **Monitoring**: Session hijacking detection

### Authorization Levels
- **ADMIN**: Full system access
- **CUSTOMER**: Limited user access
- **GUEST**: Public access only

### Security Controls
```typescript
// Role-based access control
if (session.user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'Unauthorized' })
}

// Session validation
const sessionValidation = await SessionSecurityManager.validateSession(req)
if (!sessionValidation.isValid) {
  return res.status(401).json({ error: 'Invalid session' })
}
```

## Input Validation & Sanitization

### Validation Framework
- **Primary**: Joi schemas with custom validators
- **Secondary**: Zod schemas for type safety
- **Security**: XSS detection and prevention

### Validation Rules
```typescript
// User profile validation
const profileSchema = Joi.object({
  firstName: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .custom((value, helpers) => {
      if (SecurityUtils.detectXSS(value)) {
        return helpers.error('string.xss')
      }
      return SecurityUtils.sanitizeText(value)
    })
})
```

### Sanitization Methods
- **HTML Sanitization**: DOMPurify for safe HTML
- **Text Sanitization**: Remove dangerous characters
- **SQL Escaping**: Parameterized queries (Prisma)
- **XSS Prevention**: Pattern detection and removal

## File Upload Security

### Security Measures
1. **File Type Validation**: Magic byte checking
2. **Size Limits**: 5MB maximum
3. **Virus Scanning**: Malicious content detection
4. **Secure Storage**: Isolated upload directory
5. **Access Controls**: Authenticated users only

### File Validation Pipeline
```typescript
// 1. Basic validation
const validation = await FileValidator.validateFile(filePath, originalName, mimeType, size)

// 2. Magic byte verification
const detectedType = await fileTypeFromBuffer(fileBuffer)
if (!allowedMimeTypes.includes(detectedType.mime)) {
  throw new Error('File type mismatch')
}

// 3. Virus scanning
const scanResult = await VirusScanner.scanFile(filePath)
if (!scanResult.isClean) {
  await VirusScanner.quarantineFile(filePath, scanResult.threats.join(', '))
  throw new Error('Malicious file detected')
}
```

### Allowed File Types
- **Images**: JPEG, PNG, WebP
- **Size Limit**: 5MB
- **Security**: Magic byte validation required

## CSRF Protection

### Implementation
- **Token Generation**: Cryptographically secure random tokens
- **Token Signing**: HMAC-SHA256 signatures
- **Token Expiration**: 1-hour lifetime
- **Validation**: Server-side verification

### Usage
```typescript
// Generate token
const token = CSRFProtection.createSignedToken()

// Validate token
const validation = CSRFProtection.verifySignedToken(token)
if (!validation.isValid) {
  return res.status(403).json({ error: 'CSRF token invalid' })
}
```

### Security Features
- **Nonce Support**: Dynamic token generation
- **Origin Validation**: Request origin checking
- **Header Validation**: Multiple token sources
- **Automatic Cleanup**: Expired token removal

## Rate Limiting

### Rate Limit Policies
```typescript
const RATE_LIMITS = {
  GENERAL: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100/15min
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 },      // 5/15min
  UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 },   // 10/hour
  ADMIN: { limit: 200, windowMs: 15 * 60 * 1000 },    // 200/15min
}
```

### Implementation
- **Storage**: Redis for production, in-memory for development
- **Key Strategy**: User ID + IP address
- **Headers**: Rate limit information in responses
- **Monitoring**: Violation logging and alerting

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-TotalHits: 5
```

## Security Headers

### Implemented Headers
```typescript
// Security headers via Helmet.js
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

### Content Security Policy
```typescript
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: []
}
```

## Database Security

### Security Measures
- **Connection Encryption**: SSL/TLS required
- **Query Logging**: All database operations logged
- **Access Controls**: Role-based database access
- **Audit Trail**: Complete operation history
- **Data Sanitization**: Input validation before queries

### Secure Database Operations
```typescript
// Secure query execution
const result = await prisma.secureQuery(
  'user_update',
  () => prisma.user.update({ where: { id }, data: updateData }),
  { userId, userEmail, ipAddress }
)
```

### Database Monitoring
- **Query Performance**: Response time tracking
- **Access Patterns**: Unusual activity detection
- **Error Monitoring**: Database error logging
- **Backup Verification**: Regular backup testing

## Network Security

### Network Controls
- **CORS Policy**: Restricted origins only
- **IP Blocking**: Automatic malicious IP blocking
- **Header Validation**: Suspicious header detection
- **Request Size Limits**: Oversized request prevention

### Allowed Origins
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://tinytastes.co.za',
  'https://www.tinytastes.co.za'
]
```

### Network Monitoring
- **Traffic Analysis**: Unusual pattern detection
- **DDoS Protection**: Rate limiting and IP blocking
- **Geographic Filtering**: Country-based access controls
- **Bot Detection**: Automated request identification

## Security Monitoring

### Logging Framework
- **Structured Logging**: JSON format with Pino
- **Security Events**: Dedicated security event logging
- **Performance Metrics**: Security operation timing
- **Error Tracking**: Comprehensive error logging

### Security Event Types
```typescript
const securityEventTypes = [
  'login',
  'logout',
  'failed_login',
  'file_upload',
  'csrf_violation',
  'rate_limit_violation',
  'suspicious_activity',
  'config_change'
]
```

### Monitoring Dashboard
- **Real-time Metrics**: Live security statistics
- **Threat Level**: Dynamic threat assessment
- **System Health**: Infrastructure monitoring
- **Alert Management**: Critical event notifications

## Incident Response

### Response Procedures
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Threat level evaluation
3. **Containment**: Immediate threat isolation
4. **Investigation**: Root cause analysis
5. **Recovery**: System restoration
6. **Lessons Learned**: Process improvement

### Incident Types
- **Security Breach**: Unauthorized access
- **Data Leak**: Sensitive information exposure
- **Service Disruption**: Availability impact
- **Malicious Activity**: Attack attempts

### Response Team
- **Security Lead**: Incident coordination
- **Development Team**: Technical response
- **Operations Team**: Infrastructure management
- **Management**: Business impact assessment

## Security Testing

### Test Coverage
- **Unit Tests**: Individual component testing
- **Integration Tests**: System interaction testing
- **Security Tests**: Vulnerability testing
- **Performance Tests**: Security overhead testing

### Test Categories
```typescript
describe('Security Tests', () => {
  describe('XSS Prevention', () => { /* ... */ })
  describe('CSRF Protection', () => { /* ... */ })
  describe('File Upload Security', () => { /* ... */ })
  describe('Input Validation', () => { /* ... */ })
  describe('Authentication', () => { /* ... */ })
})
```

### Automated Testing
- **CI/CD Integration**: Automated security testing
- **Vulnerability Scanning**: Dependency and code scanning
- **Penetration Testing**: Regular security assessments
- **Performance Testing**: Security impact measurement

## Performance Impact

### Security Overhead
- **CSRF Protection**: ~5% response time increase
- **Input Validation**: ~15% response time increase
- **Security Logging**: ~10% response time increase
- **File Scanning**: ~8% response time increase
- **Total Overhead**: ~38% response time increase

### Optimization Strategies
- **Caching**: Security operation caching
- **Async Operations**: Non-blocking security checks
- **Batch Processing**: Log aggregation
- **Resource Pooling**: Connection reuse

### Performance Monitoring
```typescript
// Performance measurement
const { result, duration, memoryDelta } = await SecurityPerformanceMonitor
  .measureSecurityOperation('file_upload', uploadFunction, context)
```

## Deployment Security

### Environment Security
- **Production**: Strict security controls
- **Staging**: Production-like security
- **Development**: Relaxed for development
- **Testing**: Isolated test environment

### Security Configuration
```bash
# Production environment variables
NODE_ENV=production
NEXTAUTH_SECRET=secure-random-secret
CSRF_SECRET_KEY=secure-csrf-secret
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
REDIS_URL=redis://secure-redis:6379
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] SSL/TLS certificates installed
- [ ] Security headers enabled
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Incident response plan ready

## Security Checklist

### Pre-Deployment
- [ ] All security tests passing
- [ ] Vulnerability scan completed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring dashboard active
- [ ] Incident response plan ready

### Post-Deployment
- [ ] Security monitoring active
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User access working
- [ ] Admin functions secure
- [ ] Backup procedures verified

### Ongoing Security
- [ ] Regular security updates
- [ ] Monitoring dashboard review
- [ ] Performance impact assessment
- [ ] Security log analysis
- [ ] Incident response testing
- [ ] Security training updates

## Security Contacts

### Security Team
- **Security Lead**: security@tinytastes.co.za
- **Development Team**: dev@tinytastes.co.za
- **Operations Team**: ops@tinytastes.co.za

### Emergency Contacts
- **24/7 Security Hotline**: +27-XX-XXX-XXXX
- **Incident Response**: incident@tinytastes.co.za
- **Management Escalation**: management@tinytastes.co.za

---

*This document is updated regularly. Last updated: [Current Date]*
*For questions or concerns, contact the security team.*

