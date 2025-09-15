/**
 * Authentication SDK for handling Google and Apple OAuth
 */

const googleAuth = require('./lib/googleAuth');
const appleAuth = require('./lib/appleAuth');

module.exports = {
  /**
   * Google OAuth authentication methods
   */
  google: {
    /**
     * Get Google OAuth token from code
     * @param {Object} options - Options for Google OAuth
     * @param {string} options.code - The authorization code received from Google
     * @param {string} options.clientId - Google OAuth client ID
     * @param {string} options.clientSecret - Google OAuth client secret
     * @param {string} options.redirectUri - Redirect URI registered with Google
     * @param {string} options.platform - Platform (android or ios)
     * @returns {Promise<Object>} The Google OAuth token
     */
    getToken: googleAuth.getGoogleOAuthToken,

    /**
     * Get Google user information from tokens
     * @param {string} idToken - The ID token from Google
     * @param {string} accessToken - The access token from Google
     * @returns {Promise<Object>} The Google user information
     */
    getUserInfo: googleAuth.getGoogleUser,

    /**
     * Authenticate user with Google and get user data
     * @param {Object} options - Options for Google authentication
     * @param {Object} options.tokens - Tokens from Google OAuth
     * @param {Object} options.userInfo - User information from Google
     * @param {Object} options.clientInfo - Client information (IP, country, etc.)
     * @param {string} options.adsId - Advertising ID (optional)
     * @param {Function} options.formatUserData - Function to format user data (optional)
     * @returns {Promise<Object>} The authenticated user data
     */
    authenticate: googleAuth.authenticateWithGoogle
  },

  /**
   * Apple OAuth authentication methods
   */
  apple: {
    /**
     * Verify Apple identity token
     * @param {string} identityToken - The identity token from Apple
     * @returns {Promise<Object>} The verified payload from the token
     */
    verifyIdentityToken: appleAuth.verifyAppleIdentityToken,

    /**
     * Authenticate user with Apple and get user data
     * @param {Object} options - Options for Apple authentication
     * @param {string} options.identityToken - Identity token from Apple
     * @param {string} options.fullName - User's full name (optional)
     * @param {Object} options.clientInfo - Client information (IP, country, etc.)
     * @param {string} options.adsId - Advertising ID (optional)
     * @param {Function} options.formatUserData - Function to format user data (optional)
     * @returns {Promise<Object>} The authenticated user data
     */
    authenticate: appleAuth.authenticateWithApple
  }
};