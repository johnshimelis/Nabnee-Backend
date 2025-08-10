require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./connection");
const index = require("./routes/routes");
const https = require("https");
const fs = require("fs");

const app = express();

// ================== CORS Configuration ================== //
const allowedOrigins = [
  // Development
  "http://localhost:5173",  // Vite frontend
  "http://127.0.0.1:5173",
  
  // Production (your live frontends)
  "https://nabnee.com",
  "https://www.nabnee.com",
  "http://nabnee.com",
  "http://www.nabnee.com",
  
  // Backend/Admin
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
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins or matches a regex pattern
    const isAllowed = allowedOrigins.some(allowed => {
      return typeof allowed === 'string' 
        ? origin === allowed
        : allowed.test(origin);
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
  exposedHeaders: ["x-auth-token"] // Optional: Expose custom headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for all routes
app.options("*", cors(corsOptions));

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
// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ================== Server Start ================== //
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
  Server running in ${process.env.NODE_ENV || "development"} mode
  Backend URL: http://localhost:${PORT}
  API Docs: http://localhost:${PORT}/api-docs
  `);
});

module.exports = app;