require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./connection");
const index = require("./routes/routes");
const https = require("https");
const fs = require("fs");
const config = require("./config"); // Import config.js

const app = express();

// ================== CORS Configuration ================== //
// Use origins from config.js
const allowedOrigins = [
  // Origins from config file (for environment based control)
  ...config.corsOrigins,

  // Additional origins not in config.js but you had previously (kept them)
  "https://nabnee-backend.onrender.com",
  "https://admin.nabnee.com",

  // Network/IP access
  "http://45.63.20.179",
  "https://45.63.20.179",

  // Ngrok tunnels (for testing)
  /https?:\/\/.*\.ngrok\.io$/,
  /https?:\/\/.*\.ngrok-free\.app$/
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests
    
    const isAllowed = allowedOrigins.some(allowed => {
      return typeof allowed === "string" ? origin === allowed : allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "x-api-key",
    "_id"
  ],
  exposedHeaders: ["x-auth-token"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight OPTIONS

// ================== Middleware ================== //
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Static files
app.use("/img_directory", express.static("img_directory"));
app.use("/assets", express.static("assets"));
app.use("/images", express.static(path.join(__dirname, "public")));

// ================== Routes ================== //
app.use("/", index);

// ================== Error Handling ================== //
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ================== Server Start ================== //
const PORT = config.port || process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  Server running in ${process.env.NODE_ENV || "development"} mode
  Backend URL: http://localhost:${PORT}
  API Docs: http://localhost:${PORT}/api-docs
  `);
});

module.exports = app;
