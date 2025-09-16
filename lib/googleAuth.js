const axios = require('axios');
const qs = require('qs');

/**
 * Get Google OAuth token from authorization code
 *
 * @param {Object} options - Options for Google OAuth
 * @param {string} options.code - The authorization code received from Google
 * @param {string} options.clientId - Google OAuth client ID
 * @param {string} options.clientSecret - Google OAuth client secret
 * @param {string} options.redirectUri - Redirect URI registered with Google
 * @param {string} options.platform - Platform (android or ios)
 * @returns {Promise<Object>} The Google OAuth token
 */
async function getGoogleOAuthToken(options) {
  const {
    code,
    clientId,
    clientSecret,
    redirectUri,
    platform = 'android',
    tokenUrl = 'https://oauth2.googleapis.com/token'
  } = options;

  if (!code || !clientId || !clientSecret) {
    throw new Error('Missing required parameters: code, clientId, clientSecret');
  }

  const requestOptions = {
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    include_granted_scopes: true,
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(requestOptions), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error getting Google OAuth token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Google user information from tokens
 *
 * @param {Object} options - Options for getting user info
 * @param {string} options.idToken - The ID token from Google
 * @param {string} options.accessToken - The access token from Google
 * @param {string} options.userInfoUrl - URL to get user info (optional)
 * @returns {Promise<Object>} The Google user information
 */
async function getGoogleUser(options) {
  const {
    idToken,
    accessToken,
    userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo'
  } = options;

  if (!idToken || !accessToken) {
    throw new Error('Missing required parameters: idToken, accessToken');
  }

  const url = `${userInfoUrl}?alt=json&access_token=${accessToken}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return data;
  } catch (error) {
    console.error('Error getting Google user info:', error.response?.data || error.message);
    throw error;
  }
}


module.exports = {
  getGoogleOAuthToken,
  getGoogleUser,
};