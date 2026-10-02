// server/src/utils/uuid.js
// UUID v4 generator using Node's built-in crypto

const { randomUUID } = require("crypto");

function generateUuid() {
  return randomUUID();
}

function isValidUuid(value) {
  if (typeof value !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

module.exports = { generateUuid, isValidUuid };
