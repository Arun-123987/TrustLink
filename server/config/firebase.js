const path = require("path");

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccountPath =
  process.env.NODE_ENV === "production"
    ? "/etc/secrets/firebase-service-account.json"
    : path.join(__dirname, "firebase-service-account.json");

const serviceAccount = require(serviceAccountPath);

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

module.exports = {
  app,
  auth,
};