const crypto = require("crypto");

const CLOUD_NAME = "gzo69clf";
const API_KEY = "444915729817112";
const UPLOAD_PRESET = "hujaifa_chat_uploads";
const FIREBASE_API_KEY = "AIzaSyC9NOkSRUpz7v_5Mzz0DdFCCobde_Ln1nY";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (!secret) throw new Error("Secret missing");

    const token = (event.headers.authorization || "")
      .replace(/^Bearer\s+/i, "");

    if (!token) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Login required" })
      };
    }

    const verify = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token })
      }
    );

    if (!verify.ok) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid login" })
      };
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const params = {
      timestamp,
      upload_preset: UPLOAD_PRESET
    };

    const signatureString =
      Object.keys(params).sort()
        .map(key => `${key}=${params[key]}`)
        .join("&") + secret;

    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        timestamp,
        signature,
        apiKey: API_KEY,
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Signature তৈরি করা যায়নি"
      })
    };
  }
};
