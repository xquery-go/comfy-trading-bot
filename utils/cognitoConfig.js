require("dotenv").config();

const enviroment = process.env.NODE_ENV || "production";

if (enviroment === "test") {
  exports.awsRegion = process.env.TEST_REGION;
  exports.userPoolId = process.env.TEST_POOL_ID;
  exports.clientId = process.env.TEST_CLIENT_ID;
  exports.clientSecret = process.env.TEST_CLIENT_SECRET;
} else {
  exports.awsRegion = process.env.AWS_REGION;
  exports.userPoolId = process.env.USER_POOL_ID;
  exports.clientId = process.env.CLIENT_ID;
  exports.clientSecret = process.env.CLIENT_SECRET;
}
