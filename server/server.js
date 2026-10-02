// server/server.js
// Entry point — starts the HTTP server

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`   Environment:  ${process.env.NODE_ENV || "development"}`);
});
