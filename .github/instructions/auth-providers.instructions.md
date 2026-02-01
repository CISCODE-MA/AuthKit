# Auth Providers Instructions - AuthKit Module

> **Last Updated**: February 2026  
> **Version**: 1.5.x

---

## 🔐 Authentication Providers Overview

AuthKit supports **4 authentication methods**:

1. **Local Authentication** (email + password)
2. **Google OAuth 2.0** (ID token + Authorization code)
3. **Microsoft OAuth 2.0** (Entra ID with JWKS verification)
4. **Facebook OAuth 2.0** (App token validation)

### Provider Comparison

| Provider      | Flow Type        | Verification Method                  | Use Case                   |
| ------------- | ---------------- | ------------------------------------ | -------------------------- |
| **Local**     | Email + Password | bcrypt hash comparison               | Traditional registration   |
| **Google**    | OAuth 2.0        | ID token validation OR code exchange | Mobile apps, web apps      |
| **Microsoft** | OAuth 2.0        | JWKS signature verification          | Enterprise apps (Entra ID) |
| **Facebook**  | OAuth 2.0        | App token validation                 | Social login               |

---

## 🏗️ Provider Architecture

### Service Layer: `OAuthService`

**File**: [src/services/oauth.service.ts](src/services/oauth.service.ts)

**Responsibilities**:

- Validate OAuth tokens/codes from providers
- Exchange authorization codes for user info
- Find or create users based on OAuth data
- Issue JWT tokens for authenticated users

**Methods**:

```typescript
class OAuthService {
  // Google
  async loginWithGoogle(
    idToken: string,
  ): Promise<{ accessToken; refreshToken }>;
  async loginWithGoogleCode(
    code: string,
  ): Promise<{ accessToken; refreshToken }>;

  // Microsoft
  async loginWithMicrosoft(
    idToken: string,
  ): Promise<{ accessToken; refreshToken }>;
  async loginWithMicrosoftCode(
    code: string,
  ): Promise<{ accessToken; refreshToken }>;

  // Facebook
  async loginWithFacebook(
    accessToken: string,
  ): Promise<{ accessToken; refreshToken }>;
  async loginWithFacebookCode(
    code: string,
  ): Promise<{ accessToken; refreshToken }>;

  // Internal helper
  private async findOrCreateOAuthUser(email: string, name: string);
}
```

### Controller Layer: `AuthController`

**File**: [src/controllers/auth.controller.ts](src/controllers/auth.controller.ts)

**OAuth Endpoints**:

```typescript
// Mobile flow (token/code exchange)
POST /api/auth/google/token         → loginWithGoogle(idToken)
POST /api/auth/google/code          → loginWithGoogleCode(code)
POST /api/auth/microsoft/token      → loginWithMicrosoft(idToken)
POST /api/auth/microsoft/code       → loginWithMicrosoftCode(code)
POST /api/auth/facebook/token       → loginWithFacebook(accessToken)
POST /api/auth/facebook/code        → loginWithFacebookCode(code)

// Web flow (Passport redirect)
GET  /api/auth/google               → Redirect to Google login
GET  /api/auth/google/callback      → Handle Google callback
GET  /api/auth/microsoft            → Redirect to Microsoft login
GET  /api/auth/microsoft/callback   → Handle Microsoft callback
GET  /api/auth/facebook             → Redirect to Facebook login
GET  /api/auth/facebook/callback    → Handle Facebook callback
```

### Configuration Layer: `passport.config.ts`

**File**: [src/config/passport.config.ts](src/config/passport.config.ts)

**Responsibilities**:

- Register Passport strategies for web redirect flow
- Configure callback URLs
- Handle OAuth provider callbacks

---

## 🎯 Provider-Specific Implementation

### 1. Local Authentication

**Implementation**: [src/services/auth.service.ts](src/services/auth.service.ts)

**Flow**:

```
1. User registers → Email + Password
2. Hash password (bcrypt, 12 rounds)
3. Store in database
4. Send verification email (JWT token)
5. User verifies email → Update isVerified flag
6. User logs in → Validate credentials → Issue JWT tokens
```

**Key Methods**:

```typescript
class AuthService {
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // 1. Check duplicate email
    const existing = await this.users.findByEmail(dto.email.toLowerCase());
    if (existing) throw new ConflictException("Email already registered");

    // 2. Get default role
    const role = await this.roles.findByName("user");
    if (!role) throw new InternalServerErrorException("Default role not found");

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // 4. Create user
    const user = await this.users.create({
      fullname: dto.fullname,
      username:
        dto.username ||
        generateUsernameFromName(dto.fullname.fname, dto.fullname.lname),
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      roles: [role._id],
      isVerified: false,
    });

    // 5. Send verification email
    const emailToken = this.signEmailToken({ sub: user._id.toString() });
    await this.mail.sendVerificationEmail(user.email, emailToken);

    return { message: "Registration successful. Please verify your email." };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Find user with password
    const user = await this.users.findByEmailWithPassword(
      dto.email.toLowerCase(),
    );
    if (!user) throw new UnauthorizedException("Invalid credentials");

    // 2. Validate password
    const valid = await bcrypt.compare(dto.password, user.password!);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    // 3. Check verification status
    if (!user.isVerified) {
      throw new ForbiddenException(
        "Email not verified. Please check your inbox",
      );
    }

    // 4. Check banned status
    if (user.isBanned) {
      throw new ForbiddenException(
        "Account has been banned. Please contact support",
      );
    }

    // 5. Issue tokens
    return this.issueTokensForUser(user._id.toString());
  }
}
```

**Environment Variables**:

```env
JWT_SECRET=your_jwt_secret_change_this
JWT_REFRESH_SECRET=your_refresh_secret_change_this
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
```

---

### 2. Google OAuth 2.0

**Implementation**: [src/services/oauth.service.ts](src/services/oauth.service.ts)

**Supported Flows**:

#### A. ID Token Flow (Mobile Apps)

```typescript
async loginWithGoogle(idToken: string) {
  try {
    // Validate ID token
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestException('Invalid Google token');

    const email = payload.email;
    if (!email) throw new BadRequestException('Email not provided by Google');

    // Find or create user
    return this.findOrCreateOAuthUser(email, payload.name || email.split('@')[0]);
  } catch (error) {
    this.logger.error(`Google login failed: ${error.message}`, error.stack, 'OAuthService');
    throw new UnauthorizedException('Invalid Google token');
  }
}
```

#### B. Authorization Code Flow (Web Apps)

```typescript
async loginWithGoogleCode(code: string) {
  try {
    // Exchange code for tokens
    const { tokens } = await this.googleClient.getToken(code);
    this.googleClient.setCredentials(tokens);

    // Get user info
    const userInfo = await this.googleClient.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });

    const { email, name } = userInfo.data as any;
    if (!email) throw new BadRequestException('Email not provided by Google');

    return this.findOrCreateOAuthUser(email, name || email.split('@')[0]);
  } catch (error) {
    this.logger.error(`Google code exchange failed: ${error.message}`, error.stack, 'OAuthService');
    throw new UnauthorizedException('Failed to authenticate with Google');
  }
}
```

**Environment Variables**:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

**Setup Instructions**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Copy Client ID and Secret to `.env`

---

### 3. Microsoft OAuth 2.0 (Entra ID)

**Implementation**: [src/services/oauth.service.ts](src/services/oauth.service.ts)

**Verification Method**: JWKS (JSON Web Key Set)

```typescript
private msJwks = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

private verifyMicrosoftIdToken(idToken: string) {
  return new Promise<any>((resolve, reject) => {
    const getKey = (header: any, cb: (err: any, key?: string) => void) => {
      this.msJwks
        .getSigningKey(header.kid)
        .then((k) => cb(null, k.getPublicKey()))
        .catch((err) => {
          this.logger.error(`Failed to get Microsoft signing key: ${err.message}`, err.stack, 'OAuthService');
          cb(err);
        });
    };

    jwt.verify(
      idToken,
      getKey as any,
      { algorithms: ['RS256'], audience: process.env.MICROSOFT_CLIENT_ID },
      (err, payload) => {
        if (err) {
          this.logger.error(`Microsoft token verification failed: ${err.message}`, err.stack, 'OAuthService');
          reject(new UnauthorizedException('Invalid Microsoft token'));
        } else {
          resolve(payload);
        }
      }
    );
  });
}

async loginWithMicrosoft(idToken: string) {
  try {
    const ms: any = await this.verifyMicrosoftIdToken(idToken);
    const email = ms.preferred_username || ms.email;

    if (!email) {
      throw new BadRequestException('Email not provided by Microsoft');
    }

    return this.findOrCreateOAuthUser(email, ms.name);
  } catch (error) {
    if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
      throw error;
    }
    this.logger.error(`Microsoft login failed: ${error.message}`, error.stack, 'OAuthService');
    throw new UnauthorizedException('Failed to authenticate with Microsoft');
  }
}
```

**Environment Variables**:

```env
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_CALLBACK_URL=http://localhost:3000/api/auth/microsoft/callback
MICROSOFT_TENANT_ID=common  # or specific tenant ID
```

**Setup Instructions**:

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Create new registration
4. Add redirect URIs
5. Generate client secret
6. Copy Application (client) ID and Secret to `.env`

---

### 4. Facebook OAuth 2.0

**Implementation**: [src/services/oauth.service.ts](src/services/oauth.service.ts)

**Verification Method**: App Token Validation

```typescript
private async getFacebookAppToken(): Promise<string> {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new InternalServerErrorException('Facebook credentials not configured');
  }

  try {
    const url = `https://graph.facebook.com/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
    const res = await axios.get(url, this.axiosConfig);
    return res.data.access_token;
  } catch (error) {
    this.logger.error(`Failed to get Facebook app token: ${error.message}`, error.stack, 'OAuthService');
    throw new InternalServerErrorException('Failed to verify Facebook token');
  }
}

async loginWithFacebook(accessToken: string) {
  try {
    const appToken = await this.getFacebookAppToken();

    // Validate user token
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appToken}`;
    const debugRes = await axios.get(debugUrl, this.axiosConfig);

    if (!debugRes.data?.data?.is_valid) {
      throw new UnauthorizedException('Invalid Facebook token');
    }

    // Get user info
    const userUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`;
    const userRes = await axios.get(userUrl, this.axiosConfig);

    const { email, name } = userRes.data;
    if (!email) {
      throw new BadRequestException('Email not provided by Facebook');
    }

    return this.findOrCreateOAuthUser(email, name);
  } catch (error) {
    if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
      throw error;
    }
    this.logger.error(`Facebook login failed: ${error.message}`, error.stack, 'OAuthService');
    throw new UnauthorizedException('Failed to authenticate with Facebook');
  }
}
```

**Environment Variables**:

```env
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

**Setup Instructions**:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add Facebook Login
3. Configure OAuth redirect URIs
4. Copy App ID and App Secret to `.env`

---

## 🔄 Common OAuth Flow: `findOrCreateOAuthUser()`

**Shared logic for all OAuth providers:**

```typescript
private async findOrCreateOAuthUser(email: string, name: string) {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    let user = await this.users.findByEmail(normalizedEmail);

    if (!user) {
      // Create new user
      this.logger.log(`Creating new OAuth user: ${normalizedEmail}`, 'OAuthService');

      const defaultRole = await this.getDefaultRoleId();
      const [fname, ...lnameParts] = name.split(' ');
      const lname = lnameParts.join(' ') || fname;

      user = await this.users.create({
        fullname: { fname, lname },
        username: generateUsernameFromName(fname, lname),
        email: normalizedEmail,
        roles: [defaultRole],
        isVerified: true, // OAuth users are pre-verified
        password: undefined, // No password for OAuth users
      });
    } else {
      // Check if user is banned
      if (user.isBanned) {
        throw new ForbiddenException('Account has been banned. Please contact support');
      }

      // Auto-verify OAuth users (if not already)
      if (!user.isVerified) {
        await this.users.updateById(user._id, { isVerified: true });
      }
    }

    // Issue JWT tokens
    return this.auth.issueTokensForUser(user._id.toString());
  } catch (error) {
    if (error instanceof ForbiddenException || error instanceof InternalServerErrorException) {
      throw error;
    }
    this.logger.error(`Failed to find or create OAuth user: ${error.message}`, error.stack, 'OAuthService');
    throw new InternalServerErrorException('Failed to process OAuth login');
  }
}
```

**Key behaviors**:

- ✅ Auto-creates user if email doesn't exist
- ✅ Auto-verifies email (no verification needed for OAuth)
- ✅ No password stored (OAuth users can't use local login)
- ✅ Assigns default "user" role
- ✅ Checks if user is banned
- ✅ Issues JWT tokens (same as local login)

---

## ➕ Adding a New OAuth Provider

### Example: Add LinkedIn OAuth

#### Step 1: Install SDK (if available)

```bash
npm install passport-linkedin-oauth2
npm install --save-dev @types/passport-linkedin-oauth2
```

#### Step 2: Add Environment Variables

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/api/auth/linkedin/callback
```

#### Step 3: Implement Verification in OAuthService

**File**: [src/services/oauth.service.ts](src/services/oauth.service.ts)

```typescript
import axios from "axios";

@Injectable()
export class OAuthService {
  // ... existing code ...

  async loginWithLinkedIn(accessToken: string) {
    try {
      // Get user info from LinkedIn
      const userUrl = "https://api.linkedin.com/v2/me";
      const emailUrl =
        "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))";

      const [userRes, emailRes] = await Promise.all([
        axios.get(userUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        }),
        axios.get(emailUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 10000,
        }),
      ]);

      const { localizedFirstName, localizedLastName } = userRes.data;
      const email = emailRes.data.elements[0]?.["handle~"]?.emailAddress;

      if (!email) {
        throw new BadRequestException("Email not provided by LinkedIn");
      }

      const name = `${localizedFirstName} ${localizedLastName}`;
      return this.findOrCreateOAuthUser(email, name);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(
        `LinkedIn login failed: ${error.message}`,
        error.stack,
        "OAuthService",
      );
      throw new UnauthorizedException("Failed to authenticate with LinkedIn");
    }
  }

  async loginWithLinkedInCode(code: string) {
    try {
      // Exchange code for access token
      const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
      const tokenRes = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: process.env.LINKEDIN_CALLBACK_URL!,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        },
      );

      const accessToken = tokenRes.data.access_token;
      return this.loginWithLinkedIn(accessToken);
    } catch (error) {
      this.logger.error(
        `LinkedIn code exchange failed: ${error.message}`,
        error.stack,
        "OAuthService",
      );
      throw new UnauthorizedException("Failed to authenticate with LinkedIn");
    }
  }
}
```

#### Step 4: Add Controller Endpoints

**File**: [src/controllers/auth.controller.ts](src/controllers/auth.controller.ts)

```typescript
// Mobile flow
@Post('linkedin/token')
async linkedInToken(@Body('accessToken') accessToken: string, @Res() res: Response) {
  if (!accessToken) {
    return res.status(400).json({ message: 'Access token required' });
  }

  const tokens = await this.oauth.loginWithLinkedIn(accessToken);
  return res.status(200).json(tokens);
}

@Post('linkedin/code')
async linkedInCode(@Body('code') code: string, @Res() res: Response) {
  if (!code) {
    return res.status(400).json({ message: 'Authorization code required' });
  }

  const tokens = await this.oauth.loginWithLinkedInCode(code);
  return res.status(200).json(tokens);
}

// Web flow (Passport)
@Get('linkedin')
@UseGuards(AuthGuard('linkedin'))
async linkedIn() {
  // Redirects to LinkedIn
}

@Get('linkedin/callback')
@UseGuards(AuthGuard('linkedin'))
async linkedInCallback(@Req() req: Request, @Res() res: Response) {
  const tokens = await this.oauth.loginWithLinkedIn((req.user as any).accessToken);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return res.redirect(`${frontendUrl}/auth/callback?token=${tokens.accessToken}`);
}
```

#### Step 5: Add Passport Strategy (Web Flow)

**File**: [src/config/passport.config.ts](src/config/passport.config.ts)

```typescript
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";

export function registerOAuthStrategies(oauth: OAuthService) {
  // ... existing strategies ...

  // LinkedIn Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: process.env.LINKEDIN_CALLBACK_URL,
          scope: ["r_emailaddress", "r_liteprofile"],
        },
        (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: any,
        ) => {
          done(null, { accessToken, profile });
        },
      ),
    );
  }
}
```

#### Step 6: Write Tests

**File**: [src/services/oauth.service.spec.ts](src/services/oauth.service.spec.ts)

```typescript
describe("loginWithLinkedIn", () => {
  it("should authenticate user with valid LinkedIn token", async () => {
    const mockLinkedInResponse = {
      localizedFirstName: "John",
      localizedLastName: "Doe",
    };

    const mockEmailResponse = {
      elements: [{ "handle~": { emailAddress: "john.doe@example.com" } }],
    };

    jest
      .spyOn(axios, "get")
      .mockResolvedValueOnce({ data: mockLinkedInResponse })
      .mockResolvedValueOnce({ data: mockEmailResponse });

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ _id: "user123" } as any);
    roleRepository.findByName.mockResolvedValue({ _id: "role123" } as any);

    const result = await service.loginWithLinkedIn("valid_token");

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
  });

  it("should throw UnauthorizedException for invalid token", async () => {
    jest.spyOn(axios, "get").mockRejectedValue(new Error("Invalid token"));

    await expect(service.loginWithLinkedIn("invalid_token")).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

#### Step 7: Update Documentation

**Update**: [README.md](README.md)

````markdown
### LinkedIn OAuth

```typescript
// Mobile app: Exchange LinkedIn access token
const tokens = await fetch("http://localhost:3000/api/auth/linkedin/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ accessToken: "linkedin_access_token" }),
});

// Web app: Redirect to LinkedIn login
window.location.href = "http://localhost:3000/api/auth/linkedin";
```
````

````

**Update**: [CHANGELOG.md](CHANGELOG.md)

```markdown
## [1.6.0] - 2026-03-01

### Added
- LinkedIn OAuth 2.0 support (mobile and web flows)
- New endpoints: `POST /api/auth/linkedin/token`, `POST /api/auth/linkedin/code`
- Passport LinkedIn strategy for web redirect flow
````

---

## 🧪 Testing OAuth Providers

### Unit Tests

```typescript
describe("OAuthService", () => {
  let service: OAuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    // ... setup mocks ...
  });

  describe("findOrCreateOAuthUser", () => {
    it("should create new user if email does not exist", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ _id: "newuser123" } as any);
      roleRepository.findByName.mockResolvedValue({ _id: "role123" } as any);

      const result = await service["findOrCreateOAuthUser"](
        "new@example.com",
        "New User",
      );

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@example.com",
          isVerified: true, // OAuth users are pre-verified
          password: undefined,
        }),
      );
      expect(result).toHaveProperty("accessToken");
    });

    it("should return existing user if email exists", async () => {
      const existingUser = {
        _id: "user123",
        email: "existing@example.com",
        isBanned: false,
      };
      userRepository.findByEmail.mockResolvedValue(existingUser as any);

      const result = await service["findOrCreateOAuthUser"](
        "existing@example.com",
        "Existing User",
      );

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(result).toHaveProperty("accessToken");
    });

    it("should throw ForbiddenException for banned users", async () => {
      const bannedUser = {
        _id: "user123",
        email: "banned@example.com",
        isBanned: true,
      };
      userRepository.findByEmail.mockResolvedValue(bannedUser as any);

      await expect(
        service["findOrCreateOAuthUser"]("banned@example.com", "Banned User"),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
```

### Integration Tests

```typescript
describe("AuthController - OAuth", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OAuthService, useValue: mockOAuthService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  describe("POST /api/auth/google/token", () => {
    it("should return JWT tokens for valid Google ID token", async () => {
      mockOAuthService.loginWithGoogle.mockResolvedValue({
        accessToken: "jwt_access_token",
        refreshToken: "jwt_refresh_token",
      });

      const response = await request(app.getHttpServer())
        .post("/api/auth/google/token")
        .send({ idToken: "valid_google_id_token" })
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return 400 for missing ID token", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/google/token")
        .send({})
        .expect(400);
    });
  });
});
```

---

## 🔒 Security Considerations

### Token Validation

**✅ ALWAYS validate tokens server-side:**

```typescript
// ❌ BAD - Trust client-provided data
async loginWithGoogle(idToken: string) {
  const payload = jwt.decode(idToken); // NO VERIFICATION!
  return this.findOrCreateOAuthUser(payload.email, payload.name);
}

// ✅ GOOD - Verify token signature
async loginWithGoogle(idToken: string) {
  const ticket = await this.googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID, // Verify audience
  });
  const payload = ticket.getPayload();
  return this.findOrCreateOAuthUser(payload.email, payload.name);
}
```

### Rate Limiting

**Protect OAuth endpoints from abuse:**

```typescript
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('google/token')
async googleToken(@Body('idToken') idToken: string) {
  // ...
}
```

### Email Verification

**OAuth users are auto-verified:**

```typescript
// OAuth users bypass email verification
user = await this.users.create({
  email: normalizedEmail,
  isVerified: true, // ✅ No verification needed
  password: undefined, // ✅ No password for OAuth users
});
```

### Error Messages

**Don't leak provider-specific errors:**

```typescript
// ❌ BAD - Leaks implementation details
catch (error) {
  throw new UnauthorizedException(error.message); // "JWKS endpoint timeout"
}

// ✅ GOOD - Generic error
catch (error) {
  this.logger.error(`Microsoft login failed: ${error.message}`, error.stack, 'OAuthService');
  throw new UnauthorizedException('Failed to authenticate with Microsoft');
}
```

---

## 📋 Provider Checklist

When adding/modifying OAuth providers:

- [ ] Token/code validation implemented
- [ ] JWKS/signature verification (if applicable)
- [ ] Email extraction from provider response
- [ ] `findOrCreateOAuthUser()` called correctly
- [ ] Banned user check included
- [ ] Error handling with appropriate exceptions
- [ ] Logging for debugging
- [ ] Environment variables documented
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] README updated with usage examples
- [ ] CHANGELOG updated

---

**Last Updated**: February 2026  
**Supported Providers**: Local, Google, Microsoft, Facebook  
**Future Providers**: LinkedIn, GitHub, Twitter/X (planned)
