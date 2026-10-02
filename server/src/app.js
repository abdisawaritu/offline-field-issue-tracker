const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Offline Field Issue Tracker API is running",
  });
});

module.exports = app;
