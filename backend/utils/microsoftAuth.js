// 📁 backend/utils/microsoftAuth.js

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 24 * 60 * 60 * 1000,
});

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

/**
 * ✅ ЗАСВАР: ID token-ийг шалгана (access token биш).
 * ID token-ийн audience (aud) нь манай Client ID байдаг —
 * учир нь Microsoft "энэ token яг л танай апп-д зориулагдсан" гэж
 * лавлаж өгдөг стандарт OpenID Connect загвар.
 */
function verifyMicrosoftToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getSigningKey,
      {
        audience: CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

module.exports = { verifyMicrosoftToken };
