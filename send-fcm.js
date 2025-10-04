#!/usr/bin/env node
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Load service account key
const keyFile = path.join(__dirname, "service-account.json");
const serviceAccount = require(keyFile);

// Setup Google Auth client
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];
const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: SCOPES,
});

// Get args
const messageFile = process.argv[2];
if (!messageFile) {
  console.error("❌ Usage: node send-fcm.js <json-file>");
  process.exit(1);
}
const message = JSON.parse(fs.readFileSync(messageFile, "utf8"));

// Send push
(async () => {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const projectId = serviceAccount.project_id;
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
body: JSON.stringify(message),

    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    console.log("✅ FCM Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error sending FCM:", err.message || err);
  }
})();
