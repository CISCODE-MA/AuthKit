# Troubleshooting Guide

Common issues and solutions for AuthKit integration and usage.

---

## 🚀 Installation & Setup Issues

### Issue: Module fails to initialize - "JWT_SECRET is not set"

**Error:**

```
Error: JWT_SECRET environment variable is not set
```

**Solution:**

1. Check `.env` file exists in your project root
2. Add JWT_SECRET variable:
   ```env
   JWT_SECRET=your_very_long_random_secret_key_minimum_32_chars
   JWT_REFRESH_SECRET=another_long_random_secret_key
   JWT_EMAIL_SECRET=third_long_random_secret_key
   JWT_RESET_SECRET=fourth_long_random_secret_key
   ```
3. Restart your application
4. Ensure `dotenv` is loaded before importing modules

**Prevention:**

- Copy `.env.example` to `.env`
- Never commit `.env` files
- Use CI/CD secrets for production

---

### Issue: MongoDB connection fails - "connect ECONNREFUSED"

**Error:**

```
MongooseError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

**Local Development:**

1. Start MongoDB locally:

   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Docker
   docker run -d -p 27017:27017 --name mongodb mongo

   # Manual start
   mongod
   ```

2. Verify MongoDB is running:
   ```bash
   mongo --eval "db.adminCommand('ping')"
   ```

**Remote MongoDB:**

1. Check connection string in `.env`:
   ```env
   MONGO_URI=mongodb://username:password@host:port/database
   ```
2. Verify credentials and host are correct
3. Check firewall allows connection to MongoDB
4. Verify IP whitelist if using MongoDB Atlas

---

### Issue: Package not found - "Cannot find module '@ciscode/authentication-kit'"

**Error:**

```
ModuleNotFoundError: Cannot find module '@ciscode/authentication-kit'
```

**Solution:**

1. **If package not installed:**

   ```bash
   npm install @ciscode/authentication-kit
   ```

2. **If using npm link during development:**

   ```bash
   # In AuthKit directory
   npm link

   # In your app directory
   npm link @ciscode/authentication-kit

   # Verify it worked
   npm list @ciscode/authentication-kit
   ```

3. **If path alias issue:**
   - Verify `tsconfig.json` has correct paths
   - Run `npm run build` to compile

---

## 🔐 Authentication Issues

### Issue: Login fails - "Invalid credentials"

**Error:**

```
UnauthorizedException: Invalid credentials.
```

**Possible Causes:**

1. **User not found:**

   ```bash
   # Check if user exists in database
   mongo
   > use your_db_name
   > db.users.findOne({email: "user@example.com"})
   ```

   **Solution:** Register the user first

2. **Password incorrect:**
   - Verify you're entering correct password
   - Passwords are case-sensitive
   - Check for extra spaces

3. **Email not verified:**

   ```
   Error: Email not verified. Please verify your email first.
   ```

   **Solution:** Check email for verification link
   - If email not received, call: `POST /api/auth/resend-verification`

4. **User is banned:**
   ```
   Error: Account is banned.
   ```
   **Solution:** Contact admin to unban the account

---

### Issue: JWT validation fails - "Invalid token"

**Error:**

```
UnauthorizedException: Invalid token
```

**Causes:**

1. **Token expired:**

   ```
   JsonWebTokenError: jwt expired
   ```

   **Solution:** Refresh token using `/api/auth/refresh-token`

2. **Token malformed:**

   ```
   JsonWebTokenError: jwt malformed
   ```

   **Solution:**
   - Check Authorization header format: `Bearer <token>`
   - Verify token wasn't truncated

3. **Wrong secret used:**

   ```
   JsonWebTokenError: invalid signature
   ```

   **Solution:**
   - Check JWT_SECRET matches what was used to sign token
   - Don't change JWT_SECRET without invalidating existing tokens

4. **Token from different environment:**
   **Solution:** Each environment needs its own JWT_SECRET

---

### Issue: Refresh token fails - "Invalid refresh token"

**Error:**

```
UnauthorizedException: Invalid refresh token
```

**Causes:**

1. **Refresh token expired:**

   ```bash
   # Tokens expire based on JWT_REFRESH_TOKEN_EXPIRES_IN
   # Default: 7 days
   ```

   **Solution:** User must login again

2. **Password was changed:**
   - All refresh tokens invalidate on password change (security feature)
     **Solution:** User must login again with new password

3. **Token from cookie not sent:**

   ```bash
   # If using cookie-based refresh, ensure:
   fetch(url, {
     method: 'POST',
     credentials: 'include'  // Send cookies
   })
   ```

4. **Token from body malformed:**
   ```json
   POST /api/auth/refresh-token
   {
     "refreshToken": "your-refresh-token"
   }
   ```

---

## 📧 Email Issues

### Issue: Verification email not received

**Causes:**

1. **SMTP not configured:**

   ```bash
   # Check these env variables are set
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@yourapp.com
   ```

2. **Email in spam folder:**
   - Check spam/junk folder
   - Add sender to contacts

3. **Gmail app-specific password needed:**

   ```bash
   # If using Gmail, use app-specific password, not account password
   SMTP_PASS=your-16-character-app-password
   ```

4. **Resend verification email:**

   ```bash
   POST /api/auth/resend-verification
   Content-Type: application/json

   {
     "email": "user@example.com"
   }
   ```

---

### Issue: "SMTP Error: 535 Authentication failed"

**Solution:**

1. **Verify SMTP credentials:**

   ```bash
   # Test with OpenSSL
   openssl s_client -connect smtp.gmail.com:587 -starttls smtp
   ```

2. **Gmail users - use app password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate app-specific password
   - Use in SMTP_PASS (not your account password)

3. **Gmail 2FA enabled:**
   - App password required (see above)

4. **SMTP_PORT incorrect:**
   - Gmail: 587 (TLS) or 465 (SSL)
   - Other: check your provider

---

## 🔑 OAuth Issues

### Issue: Google OAuth fails - "Invalid ID token"

**Error:**

```
Error: Invalid ID token
```

**Causes:**

1. **ID token already used:**
   - Tokens can only be used once
     **Solution:** Get new token from Google

2. **Token expired:**
   - Google ID tokens expire quickly (~1 hour)
     **Solution:** Request new token before calling endpoint

3. **GOOGLE_CLIENT_ID mismatch:**

   ```bash
   # Check env variable matches Google Console
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```

   **Solution:** Verify in Google Console

4. **Frontend sending code instead of idToken:**

   ```typescript
   // ✅ Correct - send ID token
   fetch("/api/auth/oauth/google", {
     method: "POST",
     body: JSON.stringify({
       idToken: googleResponse.tokenId,
     }),
   });

   // ❌ Wrong - using code
   fetch("/api/auth/oauth/google", {
     method: "POST",
     body: JSON.stringify({
       code: googleResponse.code, // Wrong format
     }),
   });
   ```

---

### Issue: Microsoft OAuth fails - "Invalid token"

**Error:**

```
Error: Invalid Microsoft token
```

**Causes:**

1. **MICROSOFT_CLIENT_ID mismatch:**

   ```env
   MICROSOFT_CLIENT_ID=your-azure-app-id
   ```

2. **Token from wrong authority:**
   - Ensure token is from same tenant/app
   - Check MICROSOFT_TENANT_ID if using specific tenant

3. **JWKS endpoint unreachable:**
   - Microsoft provides public key endpoint
   - Verify internet connectivity

---

### Issue: Facebook OAuth fails - "Invalid access token"

**Error:**

```
Error: Invalid Facebook token
```

**Causes:**

1. **FB_CLIENT_ID or FB_CLIENT_SECRET incorrect:**

   ```bash
   # Verify in Facebook Developer Console
   FB_CLIENT_ID=your-app-id
   FB_CLIENT_SECRET=your-app-secret
   ```

2. **User access token:**
   - Must be server access token, not user token
     **Solution:** Get token from Facebook SDK correctly

---

## 🛡️ Permission & Authorization Issues

### Issue: Admin endpoint returns "Forbidden"

**Error:**

```
ForbiddenException: Access denied
```

**Causes:**

1. **User doesn't have admin role:**

   ```bash
   # Check user roles in database
   mongo
   > db.users.findOne({email: "user@example.com"}, {roles: 1})
   ```

   **Solution:** Assign admin role to user

2. **Token doesn't include roles:**
   - Verify JWT includes role IDs in payload
     **Solution:** Token might be from before role assignment

3. **@Admin() decorator not used:**

   ```typescript
   // ✅ Correct
   @Post('/admin/users')
   @UseGuards(AuthenticateGuard)
   @UseGuards(AdminGuard)
   async createUser(@Body() dto: CreateUserDto) {}

   // ❌ Missing guard
   @Post('/admin/users')
   async createUser(@Body() dto: CreateUserDto) {}
   ```

---

### Issue: Protected route returns "Unauthorized"

**Error:**

```
UnauthorizedException: Unauthorized
```

**Causes:**

1. **No Authorization header:**

   ```typescript
   // ✅ Correct
   fetch("/api/auth/me", {
     headers: {
       Authorization: "Bearer " + accessToken,
     },
   });

   // ❌ Wrong
   fetch("/api/auth/me");
   ```

2. **Invalid Authorization format:**
   - Must be: `Bearer <token>`
   - Not: `JWT <token>` or just `<token>`

3. **AuthenticateGuard not applied:**

   ```typescript
   // ✅ Correct
   @Get('/protected-route')
   @UseGuards(AuthenticateGuard)
   async protectedRoute() {}

   // ❌ Missing guard
   @Get('/protected-route')
   async protectedRoute() {}
   ```

---

## 🚫 Permission Model Issues

### Issue: User has role but still can't access permission-based endpoint

**Error:**

```
ForbiddenException: Permission denied
```

**Causes:**

1. **Role doesn't have permission:**

   ```bash
   # Check role permissions
   mongo
   > db.roles.findOne({name: "user"}, {permissions: 1})
   ```

   **Solution:** Add permission to role

2. **Permission doesn't exist:**
   - Check permission in database
   - Verify spelling matches exactly

3. **@Permissions() not used:**
   ```typescript
   // ✅ Correct
   @Patch('/admin/users')
   @Permissions('users:manage')
   async updateUser() {}
   ```

---

## 🐛 Debugging

### Enable Verbose Logging

```typescript
// In your main.ts or app.module.ts
import { Logger } from "@nestjs/common";

const logger = new Logger();
logger.debug("AuthKit initialized");

// For development, log JWT payload
import * as jwt from "jsonwebtoken";
const decoded = jwt.decode(token);
logger.debug("Token payload:", decoded);
```

### Check JWT Payload

```bash
# Use jwt.io website to decode token (verify only!)
# Or use CLI:
npx jwt-decode <your-token-here>
```

### Database Inspection

```bash
# MongoDB shell
mongo

# List all users
> db.users.find()

# Find specific user
> db.users.findOne({email: "user@example.com"})

# Check roles
> db.roles.find()

# Check permissions
> db.permissions.find()
```

### Network Debugging

```bash
# Check what's being sent
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Check response headers
curl -i http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 Getting Help

If your issue isn't listed:

1. **Check existing issues:** https://github.com/CISCODE-MA/AuthKit/issues
2. **Read documentation:** [README.md](README.md)
3. **Check copilot instructions:** [.github/copilot-instructions.md](.github/copilot-instructions.md)
4. **Open new issue** with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Your Node/npm/MongoDB versions
   - What you've already tried

---

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io (Token Decoder)](https://jwt.io)
- [OWASP Security](https://owasp.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Last Updated:** January 31, 2026  
**Version:** 1.0.0
