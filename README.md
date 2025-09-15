# PlayAd OAuth SDK

A Node.js SDK providing core utilities for Google and Apple OAuth authentication in PlayAd games and applications. This SDK offers essential functions for token retrieval, verification, and user information fetching to help implement OAuth flows.

## Installation

```bash
npm install playad-oauth-sdk
```

### Requirements

- Node.js >=14.0.0
- peer dependency: moment ^2.29.4

### Development Scripts

The SDK comes with several npm scripts to help with development and releases:

```bash
# Run tests
npm test

# Release a new version (patch, minor, or major)
npm run release        # Shorthand for release:patch
npm run release:patch  # Increment patch version (1.0.0 -> 1.0.1)
npm run release:minor  # Increment minor version (1.0.0 -> 1.1.0)
npm run release:major  # Increment major version (1.0.0 -> 2.0.0)
```

## Usage

### Google OAuth Functions

```javascript
const oauthSdk = require('playad-oauth-sdk');

try {
  // Get Google OAuth token from authorization code
  const tokens = await oauthSdk.google.getGoogleOAuthToken({
    code: 'authorization_code_from_google',
    clientId: 'your_google_client_id',
    clientSecret: 'your_google_client_secret',
    redirectUri: 'your_redirect_uri',
    platform: 'android' // or 'ios'
    // Optional: custom token URL (defaults to 'https://oauth2.googleapis.com/token')
    // tokenUrl: 'https://your-custom-token-url'
  });

  // tokens object contains:
  // - access_token: Token to access Google APIs
  // - id_token: JWT containing user information
  // - refresh_token: Token to get a new access token when it expires
  // - expires_in: Validity period in seconds
  // - token_type: Usually "Bearer"

  // Get Google user information using the tokens
  const userInfo = await oauthSdk.google.getGoogleUser({
    idToken: tokens.id_token,
    accessToken: tokens.access_token
    // Optional: custom user info URL (defaults to 'https://www.googleapis.com/oauth2/v3/userinfo')
    // userInfoUrl: 'https://your-custom-userinfo-url'
  });

  // userInfo object contains:
  // - sub: Unique user identifier
  // - name: User's full name
  // - given_name: User's first name
  // - family_name: User's last name
  // - picture: Profile picture URL
  // - email: User's email address
  // - email_verified: Boolean indicating if email is verified
  // - locale: User's locale

  // Now you can implement your own authentication logic using these tokens and user info
  // For example, find or create a user in your database and generate your own auth tokens

} catch (error) {
  console.error('Google OAuth error:', error.message);
  // Handle specific error cases
}
```

### Apple OAuth Functions

```javascript
const oauthSdk = require('playad-oauth-sdk');

try {
  // Verify Apple identity token
  // You can pass the token directly as a string
  let payload = await oauthSdk.apple.verifyAppleIdentityToken('identity_token_from_apple');

  // Or you can pass an options object with more configuration
  // payload = await oauthSdk.apple.verifyAppleIdentityToken({
  //   identityToken: 'identity_token_from_apple',
  //   // Optional: custom JWKS client if you need custom configuration
  //   // jwksClient: yourCustomJwksClient
  // });

  // payload contains the decoded Apple identity token with user information:
  // - sub: Unique user identifier (Apple user ID)
  // - email: User's email (may be private relay email)
  // - email_verified: Boolean indicating if email is verified
  // - is_private_email: Boolean indicating if it's a private relay email
  // - auth_time: Time of authentication
  // - iat: Token issue time
  // - exp: Token expiration time
  // - aud: Client ID (your app's identifier)
  // - iss: Token issuer (Apple)

  // Get Apple public key if needed for manual verification
  // const kid = 'key_id_from_apple_token_header';
  // const publicKey = await oauthSdk.apple.getApplePublicKey(kid);

  // Generate a random string for state management or other purposes
  const state = oauthSdk.apple.randomString(32);

  // Now you can implement your own authentication logic using the verified token payload
  // For example, find or create a user in your database and generate your own auth tokens

} catch (error) {
  console.error('Apple OAuth error:', error.message);
  // Handle specific error cases
}
```

## Integration Examples

### Example Code

For more detailed examples, see the [example](./example) directory in this repository.

### Integration with Express.js

```javascript
const express = require('express');
const oauthSdk = require('playad-oauth-sdk');
const User = require('./models/user');
const JWTService = require('./services/jwt.service');

const app = express();
app.use(express.json());

// Google OAuth login endpoint
app.post('/auth/google', async (req, res) => {
  const { code, platform, adsId } = req.body;
  const clientInfo = {
    lastIP: req.ip,
    country: req.headers['cf-ipcountry'] || 'Unknown'
  };

  try {
    // Get Google OAuth token
    const tokens = await oauthSdk.google.getToken({
      code,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT,
      platform
    });

    // Get Google user info
    const userInfo = await oauthSdk.google.getUserInfo({
      idToken: tokens.id_token,
      accessToken: tokens.access_token
    });

    // Authenticate user
    const authResult = await oauthSdk.google.authenticate({
      tokens,
      userInfo,
      clientInfo,
      adsId,
      findOrCreateUser: async (userData) => {
        // Your implementation to find or create user
        // ...
      },
      generateAuthTokens: JWTService.generateAuthTokens,
      formatUserData: (user) => user.formatResponse(),
      getAdsConfig: async () => {
        // Your implementation to get ads config
        // ...
      },
      getIronSourceKey: async () => {
        // Your implementation to get IronSource key
        // ...
      }
    });

    return res.status(authResult.statusCode).json(authResult);
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(400).json({
      isSuccess: false,
      message: 'AUTHENTICATION_FAILED'
    });
  }
});

// Apple OAuth login endpoint
app.post('/auth/apple', async (req, res) => {
  const { identityToken, fullName, adsId } = req.body;
  const clientInfo = {
    lastIP: req.ip,
    country: req.headers['cf-ipcountry'] || 'Unknown'
  };

  try {
    // Authenticate with Apple
    const authResult = await oauthSdk.apple.authenticate({
      identityToken,
      fullName,
      clientInfo,
      adsId,
      findOrCreateUser: async (userData) => {
        // Your implementation to find or create user
        // ...
      },
      generateAuthTokens: JWTService.generateAuthTokens,
      formatUserData: (user) => user.formatResponse(),
      getAdsConfig: async () => {
        // Your implementation to get ads config
        // ...
      },
      getIronSourceKey: async () => {
        // Your implementation to get IronSource key
        // ...
      }
    });

    return res.status(authResult.statusCode).json(authResult);
  } catch (error) {
    console.error('Apple auth error:', error);
    return res.status(400).json({
      isSuccess: false,
      message: 'AUTHENTICATION_FAILED'
    });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## API Reference

### Google OAuth

#### `google.getGoogleOAuthToken(options)`

Get Google OAuth token from authorization code. This function exchanges an authorization code for access and ID tokens from Google's OAuth 2.0 server.

**Parameters:**
- `options` (Object): Options for Google OAuth
  - `code` (string): The authorization code received from Google
  - `clientId` (string): Google OAuth client ID
  - `clientSecret` (string): Google OAuth client secret
  - `redirectUri` (string): Redirect URI registered with Google
  - `platform` (string): Platform (android or ios)
  - `tokenUrl` (string, optional): URL to get tokens (default: 'https://oauth2.googleapis.com/token')

**Default Scopes:**
- https://www.googleapis.com/auth/userinfo.email
- https://www.googleapis.com/auth/userinfo.profile

**Returns:** Promise that resolves to the token response from Google, which includes:
- `access_token`: The access token for API calls
- `id_token`: The ID token containing user information
- `refresh_token`: Token to refresh the access token when it expires
- `expires_in`: Validity period of the access token in seconds
- `token_type`: Type of token (usually "Bearer")

#### `google.getGoogleUser(options)`

Get Google user information from tokens. This function retrieves detailed user information using the provided tokens.

**Parameters:**
- `options` (Object): Options for getting user info
  - `idToken` (string): The ID token from Google
  - `accessToken` (string): The access token from Google
  - `userInfoUrl` (string, optional): URL to get user info (default: 'https://www.googleapis.com/oauth2/v3/userinfo')

**Returns:** Promise that resolves to the user information from Google, which typically includes:
- `sub`: The unique user identifier
- `name`: The user's full name
- `given_name`: The user's first name
- `family_name`: The user's last name
- `picture`: URL to the user's profile picture
- `email`: The user's email address
- `email_verified`: Boolean indicating if the email is verified
- `locale`: The user's locale

### Apple OAuth

#### `apple.verifyAppleIdentityToken(options)`

Verify Apple identity token. This function validates the identity token issued by Apple by verifying its signature using Apple's public keys.

**Parameters:**
- `options` (Object or string): Options for verification
  - If string: The identity token from Apple
  - If object:
    - `identityToken` (string): The identity token from Apple
    - `jwksClient` (Object, optional): JWKS client

**Returns:** Promise that resolves to the decoded token payload

#### `apple.getApplePublicKey(kid, client)`

Get Apple public key for token verification.

**Parameters:**
- `kid` (string): Key ID from Apple token header
- `client` (Object, optional): JWKS client instance

**Returns:** Promise that resolves to the public key string

#### `apple.randomString(length)`

Generate a random string, useful for state parameters in OAuth flows.

**Parameters:**
- `length` (number): The length of the random string to generate

**Returns:** A random string of the specified length

## Security

This SDK uses industry-standard security practices:

- JWT verification for Apple identity tokens
- HTTPS connections for all API requests
- No storing of credentials or tokens

## Error Handling

The SDK implements comprehensive error handling:

### Google OAuth Errors

- Missing required parameters will throw errors with descriptive messages
- Network errors during token exchange are caught and logged
- API errors from Google are properly propagated with details

Example:
```javascript
try {
  const tokens = await oauthSdk.google.getToken({
    // ... options
  });
} catch (error) {
  console.error('Error details:', error.response?.data || error.message);
  // Handle the error appropriately
}
```

### Apple OAuth Errors

- Invalid or malformed identity tokens will throw descriptive errors
- JWT verification failures are properly handled
- Detailed error messages help with debugging

Example:
```javascript
try {
  const payload = await oauthSdk.apple.verifyIdentityToken(identityToken);
} catch (error) {
  console.error('Apple verification error:', error.message);
  // Handle the error appropriately
}
```

## Version History

Please see [CHANGELOG.md](./CHANGELOG.md) for details on version history and changes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT