# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-15

### Added

- Initial release of the PlayAd OAuth SDK
- Google OAuth authentication functionality
  - `getGoogleOAuthToken`: Get Google OAuth token from authorization code
  - `getGoogleUser`: Get Google user information from tokens
  - `authenticateWithGoogle`: Authenticate user with Google
- Apple OAuth authentication functionality
  - `verifyAppleIdentityToken`: Verify Apple identity token
  - `authenticateWithApple`: Authenticate user with Apple
- Comprehensive documentation and examples