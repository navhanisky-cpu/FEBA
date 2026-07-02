// api/agora-token.js
// Generates a secure Agora RTC token for a given channel + user
// Called by the frontend before joining any video call

const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID          = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const TOKEN_EXPIRY    = 3600; // 1 hour in seconds

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { channelName, uid } = req.body;

    if (!channelName || uid === undefined) {
      return res.status(400).json({ error: 'channelName and uid are required' });
    }

    if (!APP_ID || !APP_CERTIFICATE) {
      return res.status(500).json({ error: 'Agora credentials not configured' });
    }

    const currentTime     = Math.floor(Date.now() / 1000);
    const privilegeExpire = currentTime + TOKEN_EXPIRY;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpire,
      privilegeExpire
    );

    return res.status(200).json({
      token,
      appId: APP_ID,
      channel: channelName,
      uid,
      expires: privilegeExpire
    });

  } catch (err) {
    console.error('Token generation error:', err);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
};
