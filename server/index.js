// Load environment variables into process.env
require("dotenv").config();

// Immediately validates the environment variables
const validateEnv = require("./config/validateEnv");
validateEnv();

// Load config and HTTP server setup after validation succeeds
const env = require("./config/env");
const { server } = require("./app");
const connectDB = require("./config/db");

const startServer = async () => {
  await connectDB();

  // Must listen using `server`, not `app`
  server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
};

startServer();

