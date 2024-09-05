const jwt = require("jsonwebtoken");

exports.verifyUsernameByToken = (username, token) => {
  const tokenData = jwt.decode(token);
  if (tokenData.username !== username) {
    throw { status: 401, message: "Unauthorized access." };
  }
};

exports.testRoute = (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    req.user = { username: "john_doe" };
  }
  next();
};
