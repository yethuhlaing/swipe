# Authentication & Security Roadmap

This document outlines security and authentication improvements for the SaaS application. The current implementation uses Better Auth with email/password and Google OAuth authentication.

## Current Implementation

- **Auth Library**: Better Auth v1.4.6
- **Database**: PostgreSQL with Drizzle ORM
- **Auth Methods**:
  - Email & Password
  - Google OAuth
- **Session Storage**: Database-backed sessions with IP address and user agent tracking

## Critical Security Gaps (High Priority)

### 1. Email Verification Not Enforced

**Risk Level**: Critical

**Current State**: The schema includes `emailVerified` field, but email verification is not enabled in Better Auth configuration.

**Risks**:
- Spam registrations
- Account takeover via typosquatting
- Inability to recover accounts securely
- GDPR compliance issues (can't prove user owns the email)

**Recommended Action**:
- Enable Better Auth's email verification plugin
- Require email verification before account activation
- Implement verification token expiration
- Add resend verification email functionality

### 2. ✅ Rate Limiting (IMPLEMENTED)

**Risk Level**: Critical → Mitigated

**Current State**: Rate limiting implemented using Upstash Redis.

**Implementation**:
- ✅ Upstash Redis rate limiting library integrated
- ✅ Reusable rate limit utilities created in `src/lib/rate-limit.ts`
- ✅ Multiple rate limit tiers: strict (5/10s), standard (10/10s), relaxed (30/1m)
- ✅ Helper functions for middleware integration
- ✅ IP-based and user-based rate limiting support

**Still TODO**:
- Apply rate limiting to authentication endpoints
- Add progressive delays after failed login attempts
- Rate limit password reset requests
- Rate limit registration endpoints

**Reference**: See `src/lib/rate-limit.ts` and `src/app/api/example-rate-limit/route.ts`

### 3. Missing Multi-Factor Authentication (MFA/2FA)

**Risk Level**: Critical

**Current State**: Single-factor authentication only (password or OAuth).

**Risks**:
- Account compromise from leaked credentials
- Insufficient protection for sensitive data
- Compliance failures (SOC2, ISO 27001, HIPAA)
- Limited protection against phishing attacks

**Recommended Action**:
- Implement TOTP-based 2FA (Time-based One-Time Password)
- Add SMS-based 2FA as backup option
- Provide recovery codes for account recovery
- Make MFA mandatory for admin accounts
- Optional MFA for regular users with strong encouragement


### 5. Session Security Weaknesses

**Risk Level**: High

**Current State**: Sessions are stored with IP and user agent, but lack comprehensive security controls.

**Gaps**:
- No visible session expiry configuration
- No refresh token rotation for OAuth
- Missing automatic session invalidation on password change
- No concurrent session limits
- No device/location-based anomaly detection

**Recommended Action**:
- Configure short session expiry (15-30 minutes of inactivity)
- Implement session refresh mechanism
- Automatically invalidate all sessions on password change
- Limit concurrent sessions per user (e.g., max 5 devices)
- Add ability for users to view and revoke active sessions
- Detect and flag suspicious login locations/devices

## Important Improvements (Medium Priority)

### 6. Account Lockout Protection

**Risk Level**: Medium-High

**Current State**: No protection against repeated failed login attempts.

**Recommended Action**:
- Implement temporary account lockout after N failed attempts (e.g., 5 attempts)
- Progressive lockout duration (5 min, 15 min, 30 min, etc.)
- Show CAPTCHA after 3 failed attempts
- Send email notification on account lockout
- Provide secure account unlock workflow
- Admin interface to unlock accounts

### 7. Audit Logging & Security Events

**Risk Level**: Medium-High

**Current State**: Basic IP address and user agent stored in sessions, but no comprehensive audit trail.

**Missing**:
- Failed login attempt logging
- Password change events
- Email change events
- MFA enrollment/removal events
- Account deletion requests
- Suspicious activity logging (new device, new location, unusual access patterns)
- Admin actions audit trail

**Recommended Action**:
- Implement comprehensive audit log table
- Log all authentication events (success and failure)
- Log all account modifications
- Store IP address, user agent, timestamp, event type
- Add retention policy for audit logs (7+ years for compliance)
- Create admin dashboard to view security events
- Set up alerts for critical security events

### 8. OAuth Security Hardening

**Risk Level**: Medium

**Current State**: Google OAuth configured but missing advanced security features.

**Recommended Action**:
- Implement PKCE (Proof Key for Code Exchange) for OAuth flows
- Validate state parameter to prevent CSRF attacks
- Limit OAuth scopes to only necessary permissions
- Implement account linking validation to prevent takeover if email changes
- Add OAuth token refresh and expiration handling
- Validate OAuth provider responses thoroughly
- Store OAuth tokens encrypted at rest

### 9. Password Reset Flow Security

**Risk Level**: Medium

**Current State**: No visible secure password reset implementation.

**Recommended Action**:
- Generate cryptographically secure reset tokens
- Implement time-limited tokens (15-30 minutes expiration)
- Make tokens single-use only
- Rate limit reset requests per email
- Send notification email when password is reset
- Require old password for password changes (vs. resets)
- Don't reveal whether email exists in system
- Invalidate all sessions after password reset

### 10. Authorization & Access Control

**Risk Level**: Medium

**Current State**: No role-based access control (RBAC) or permissions system visible.

**Recommended Action**:
- Implement user roles (admin, user, viewer, etc.)
- Create permissions system for fine-grained access control
- Add team/organization support for multi-tenant architecture
- Implement resource-level permissions
- Create middleware for route-based authorization
- Add permission checking utilities for components
- Implement row-level security in database

## Data Privacy & Compliance (Medium Priority)

### 11. PII Protection

**Risk Level**: Medium

**Current State**: Sensitive tokens stored in database without encryption.

**Issues**:
- OAuth tokens (access_token, refresh_token, id_token) stored in plain text
- Session tokens stored unencrypted
- No encryption at rest for sensitive fields
- Missing data retention policies
- No anonymization for deleted accounts

**Recommended Action**:
- Hash session tokens before storing (store only hash, compare on lookup)
- Encrypt OAuth tokens at rest using application-level encryption
- Implement data retention policies (auto-delete old sessions, logs)
- Anonymize user data on account deletion (GDPR "right to be forgotten")
- Consider database-level encryption for sensitive columns
- Implement secure key management (rotate encryption keys)

### 12. GDPR/Privacy Compliance

**Risk Level**: Medium (High if operating in EU)

**Current State**: Missing essential privacy compliance features.

**Missing Features**:
- Data export functionality (GDPR Article 20)
- Account deletion with full data purge (GDPR Article 17)
- Consent management system
- Privacy policy acceptance tracking
- Cookie consent management
- Data processing agreements

**Recommended Action**:
- Implement "Download my data" feature (export all user data as JSON/CSV)
- Create account deletion workflow with confirmation
- Add consent tracking table to database
- Require privacy policy acceptance on signup
- Display last acceptance date and allow re-acceptance
- Implement cookie consent banner for EU users
- Document data processing activities
- Add data subject request handling workflow

### 13. Session Cookie Security

**Risk Level**: Medium

**Current State**: Need to verify cookie security configuration.

**Recommended Settings**:
- `HttpOnly`: true (prevent XSS access to cookies)
- `Secure`: true (HTTPS only, never send over HTTP)
- `SameSite`: "Lax" or "Strict" (CSRF protection)
- Proper domain scoping (don't allow subdomains unless needed)
- Use cookie prefix `__Host-` or `__Secure-` for additional security
- Set appropriate Max-Age or Expires
- Clear cookies on logout

**Action Items**:
- Audit Better Auth cookie configuration
- Override defaults if necessary
- Test cookie security in production environment

## Infrastructure & Monitoring (Lower Priority but Important)

### 15. Security Monitoring & Alerting

**Risk Level**: Medium

**Current State**: No security monitoring or alerting system.

**Missing Visibility**:
- Failed authentication attempts
- Anomalous login patterns (unusual locations, times)
- Token theft or session hijacking indicators
- Credential stuffing attacks
- API abuse patterns
- Brute force attacks in progress

**Recommended Action**:
- Integrate security event logging with monitoring service
- Set up alerts for:
  - Multiple failed login attempts from same IP
  - Login from new country/location
  - Multiple concurrent sessions from different IPs
  - Rapid succession of password reset requests
  - Unusual API usage patterns
- Create security dashboard for ops team
- Consider integration with SIEM tools for enterprise customers
- Set up anomaly detection using ML (if scale justifies it)

### 16. Secrets Management

**Risk Level**: Low-Medium

**Current State**: Environment variables used for secrets (acceptable for small apps).

**Risks**:
- No secret rotation strategy
- Static `BETTER_AUTH_SECRET`
- OAuth credentials are static
- Secrets in `.env.local` could be accidentally committed

**Recommended Action**:
- Implement secret rotation strategy for production
- Rotate `BETTER_AUTH_SECRET` periodically (requires session invalidation)
- Rotate OAuth client secrets on schedule
- Use secrets management service (AWS Secrets Manager, HashiCorp Vault, etc.) for production
- Encrypt secrets at rest in secrets manager
- Audit secret access
- Never commit `.env.local` to version control (already in `.gitignore`)

### 17. Account Enumeration Prevention

**Risk Level**: Low-Medium

**Current State**: Likely vulnerable to account enumeration attacks.

**Common Vulnerabilities**:
- Login error messages reveal if email exists ("wrong password" vs "email not found")
- Registration reveals if email already exists
- Password reset reveals valid emails
- Different response times for existing vs non-existing accounts

**Recommended Action**:
- Use generic error messages: "Invalid email or password" (not "email not found")
- Registration: "If email doesn't exist, account created. Check email for verification."
- Password reset: "If email exists, reset link sent" (always same message)
- Normalize response times using constant-time operations
- Consider CAPTCHA on registration to slow down enumeration

## Additional Considerations

### 18. Backup Authentication Methods

**Risk Level**: Low

**Recommended Features**:
- Recovery codes for MFA device loss (generate 10 single-use codes)
- Backup email address for account recovery
- Security questions (NOT recommended anymore due to low security)
- Admin-assisted account recovery process for enterprise

### 19. Advanced Threat Protection

**Risk Level**: Low (Nice to have)

**Advanced Features**:
- Device fingerprinting to detect account takeover
- Behavioral biometrics (typing patterns, mouse movements)
- Bot detection and prevention (Cloudflare Turnstile, reCAPTCHA)
- Geo-blocking or geo-fencing capabilities
- IP reputation checking
- User and Entity Behavior Analytics (UEBA)

### 20. Cross-Site Scripting (XSS) Protection

**Risk Level**: Medium

**Current State**: Next.js provides some built-in XSS protection, but additional measures needed.

**Recommended Action**:
- Implement Content Security Policy (CSP) headers
- Set strict CSP directives (no inline scripts, whitelist domains)
- Sanitize all user-generated content before displaying
- Use Next.js built-in HTML escaping
- Validate and sanitize URLs before redirects (prevent open redirects)
- Use `dangerouslySetInnerHTML` sparingly and only with sanitized content
- Implement Subresource Integrity (SRI) for external scripts

---

## Implementation Phases

### Phase 1: Critical Security Fixes (Implement Immediately)

**Timeline**: Sprint 1 (1-2 weeks)

1. **Enable Email Verification**
   - Configure Better Auth email verification plugin
   - Set up email service (SendGrid, AWS SES, Resend)
   - Create verification email templates
   - Block unverified users from accessing application

2. **Implement Rate Limiting**
   - Add rate limiting middleware for auth endpoints
   - Configure limits: 5 attempts per 15 minutes for login
   - Add progressive delays on repeated failures
   - Rate limit password reset to 3 per hour

3. **Enforce Password Policies**
   - Minimum 12 characters
   - Require mix of character types
   - Client-side password strength meter
   - Server-side validation
   - Check against common passwords list

4. **Add Route Protection Middleware**
   - Create `middleware.ts` for Next.js
   - Protect all authenticated routes
   - Auto-redirect to login
   - Add CSRF protection

5. **Secure Session Cookies**
   - Verify and configure cookie security flags
   - Set appropriate expiration times
   - Test in production environment

### Phase 2: Enhanced Security (Next Sprint)

**Timeline**: Sprint 2-3 (2-4 weeks)

1. **Multi-Factor Authentication (MFA)**
   - Implement TOTP-based 2FA
   - Generate recovery codes
   - UI for MFA enrollment
   - Enforce for admin accounts

2. **Comprehensive Audit Logging**
   - Create audit log database schema
   - Log all authentication events
   - Log account modifications
   - Create admin dashboard for viewing logs

3. **Account Lockout Mechanism**
   - Lock account after 5 failed attempts
   - Progressive lockout duration
   - Email notification on lockout
   - Admin unlock interface

4. **Secure Password Reset Flow**
   - Time-limited, single-use tokens
   - Rate limiting on reset requests
   - Email notifications
   - Session invalidation after reset

5. **Security Event Notifications**
   - Email on password change
   - Email on new device login
   - Email on MFA changes
   - Configurable notification preferences

### Phase 3: Compliance & Advanced Features

**Timeline**: Sprint 4-6 (4-6 weeks)

1. **RBAC/Permissions System**
   - Define roles and permissions
   - Database schema for roles
   - Permission checking middleware
   - UI for role management

2. **GDPR Compliance Features**
   - Data export functionality
   - Account deletion with data purge
   - Consent management
   - Privacy policy acceptance tracking

3. **Advanced Session Management**
   - View active sessions UI
   - Revoke sessions remotely
   - Concurrent session limits
   - Location/device-based anomaly detection

4. **OAuth Security Hardening**
   - Implement PKCE
   - State validation
   - Scope limitation
   - Token encryption

5. **Security Monitoring Dashboard**
   - Real-time security event feed
   - Anomaly detection alerts
   - Failed login tracking
   - Suspicious activity patterns

### Phase 4: Advanced Protection (Future/Scale)

**Timeline**: Sprint 7+ (as needed)

1. **Advanced Threat Detection**
   - Device fingerprinting
   - Behavioral analytics
   - Bot detection integration

2. **Enhanced Secrets Management**
   - Migrate to secrets manager service
   - Implement secret rotation
   - Audit secret access

3. **Additional Security Hardening**
   - Content Security Policy (CSP)
   - Subresource Integrity (SRI)
   - Additional security headers

4. **Enterprise Features**
   - SSO/SAML support
   - Custom domain authentication
   - Advanced audit logs
   - Compliance reporting

---

## Testing & Validation

For each implementation phase, ensure:

### Security Testing
- Penetration testing for auth flows
- Vulnerability scanning
- Dependency audit (npm audit, Snyk)
- Manual security review

### Functional Testing
- Unit tests for auth logic
- Integration tests for auth flows
- E2E tests for login/signup/logout
- Password reset flow testing
- MFA enrollment and usage testing

### Performance Testing
- Rate limiting doesn't impact legitimate users
- Session lookup performance
- Auth middleware latency
- Database query optimization

### Compliance Testing
- GDPR data export/deletion verification
- Audit log completeness
- Cookie compliance
- Privacy policy enforcement

---

## Configuration Checklist

### Better Auth Configuration

```typescript
// Checklist for auth.ts improvements

☐ Email verification enabled
☐ Password policy configured
☐ Session expiration set (e.g., 30 minutes)
☐ MFA/2FA plugin enabled
☐ Rate limiting plugin enabled
☐ Audit logging enabled
☐ Cookie security settings verified
☐ CSRF protection enabled
☐ Account lockout configured
☐ Password reset security hardened
```

### Environment Variables Security

```bash
# Production environment checklist

☐ BETTER_AUTH_SECRET minimum 32 characters (use: openssl rand -base64 32)
☐ GOOGLE_CLIENT_SECRET kept secure
☐ DATABASE_URL uses strong password
☐ No secrets in version control
☐ Secrets stored in secure secrets manager (prod)
☐ Secret rotation schedule established
☐ Access to secrets is logged and audited
```

### Database Security

```sql
-- Database security checklist

☐ Password hashes use strong algorithm (bcrypt/argon2)
☐ Session tokens hashed before storage
☐ OAuth tokens encrypted at rest
☐ Row-level security enabled (if using Postgres RLS)
☐ Database access restricted by IP
☐ Database credentials rotated regularly
☐ Automated backups configured
☐ Backup encryption enabled
```

---

## Compliance Standards Reference

### SOC 2 Type II
- MFA for privileged access
- Audit logging of all authentication events
- Password complexity requirements
- Session timeout enforcement
- Encryption of data in transit and at rest

### ISO 27001
- Access control policy
- User registration and de-registration
- Password management system
- Regular access reviews
- Security event logging

### GDPR
- Right to access (data export)
- Right to erasure (account deletion)
- Consent management
- Data breach notification
- Privacy by design

### HIPAA (if handling health data)
- Unique user identification
- Emergency access procedure
- Automatic logoff
- Encryption and decryption
- Audit controls

---

## Useful Resources

### Better Auth Documentation
- [Better Auth Docs](https://better-auth.com)
- [Email Verification Plugin](https://better-auth.com/docs/plugins/email-verification)
- [Two Factor Auth Plugin](https://better-auth.com/docs/plugins/two-factor)
- [Rate Limiting](https://better-auth.com/docs/plugins/rate-limit)

### Security Best Practices
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)

### Password Security
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3)
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit) - Check for vulnerabilities
- [Snyk](https://snyk.io) - Continuous security monitoring
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Burp Suite](https://portswigger.net/burp) - Penetration testing

---

## Maintenance Schedule

### Daily
- Monitor security event logs
- Review failed login attempts
- Check for unusual access patterns

### Weekly
- Review audit logs
- Check for new security vulnerabilities (npm audit)
- Review active sessions for anomalies

### Monthly
- Review and rotate secrets (if policy requires)
- Audit user permissions and roles
- Review GDPR/compliance requirements
- Update dependencies with security patches

### Quarterly
- Conduct security audit
- Review and update security policies
- Penetration testing
- Employee security training

### Annually
- Full security assessment
- Compliance audit (SOC 2, GDPR, etc.)
- Update privacy policy and terms of service
- Review and improve security roadmap

---

**Document Version**: 1.0
**Last Updated**: 2025-12-14
**Next Review Date**: 2025-03-14
