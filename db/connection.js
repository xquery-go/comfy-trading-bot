const { Pool } = require("pg");
require("dotenv").config();

const ENV = process.env.NODE_ENV || "development";

const config = {};

if (ENV !== "test") {
  config.user = process.env.RDS_USER;
  config.password = process.env.RDS_PASSWORD;
  config.host = process.env.RDS_HOST;
  config.port = process.env.RDS_PORT;
  config.database = process.env.RDS_DB;
  config.ssl = {
    rejectUnauthorized: false, // For development, adjust as needed
  };
}

module.exports = new Pool(config);
