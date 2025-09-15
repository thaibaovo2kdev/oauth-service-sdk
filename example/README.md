# PlayAd OAuth SDK Example

This is an example implementation of the PlayAd OAuth SDK in an Express.js application.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your Google and Apple OAuth credentials:

```
GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT=your_redirect_uri
```

3. Start the server:

```bash
npm start
```

## API Endpoints

### Google OAuth

```
POST /auth/google
```

Request body:
```json
{
  "code": "authorization_code_from_google",
  "platform": "android",
  "adsId": "advertising_id"
}
```

### Apple OAuth

```
POST /auth/apple
```

Request body:
```json
{
  "identityToken": "identity_token_from_apple",
  "fullName": "User Name",
  "adsId": "advertising_id"
}
```

## Implementation Details

This example demonstrates:

1. How to integrate the PlayAd OAuth SDK with Express.js
2. How to implement the required callback functions
3. How to structure the authentication flow for both Google and Apple

The example uses mock implementations for database operations and token generation. In a real application, you would replace these with actual implementations.