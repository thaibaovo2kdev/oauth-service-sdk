const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

/**
 * Create Apple JWKS client
 * @param {string} jwksUri - Apple JWKS URI
 * @returns {Object} JWKS client
 */
function createAppleJwksClient(jwksUri = 'https://appleid.apple.com/auth/keys') {
  return jwksClient({
    jwksUri
  });
}

/**
 * Get Apple public key
 * @param {string} kid - Key ID from Apple
 * @param {Object} client - JWKS client
 * @returns {Promise<string>} Public key
 */
async function getApplePublicKey(kid, client) {
  if (!client) {
    client = createAppleJwksClient();
  }

  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
}

/**
 * Verify Apple identity token
 * @param {Object} options - Options for verification
 * @param {string} options.identityToken - Identity token from Apple
 * @param {Object} options.jwksClient - JWKS client (optional)
 * @returns {Promise<Object>} Decoded token payload
 */
async function verifyAppleIdentityToken(options) {
  const { identityToken, jwksClient } = typeof options === 'string'
    ? { identityToken: options }
    : options;

  if (!identityToken) {
    throw new Error('Invalid identity token');
  }

  // Decode token header
  const decodedHeader = jwt.decode(identityToken, { complete: true });
  if (!decodedHeader) {
    throw new Error('Invalid identity token');
  }

  // Get the public key
  const client = jwksClient || createAppleJwksClient();
  const publicKey = await getApplePublicKey(decodedHeader.header.kid, client);

  // Verify token
  const payload = jwt.verify(identityToken, publicKey, {
    algorithms: ['RS256'],
  });

  return payload;
}

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
function randomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}



module.exports = {
  verifyAppleIdentityToken,
  getApplePublicKey,
  randomString
};