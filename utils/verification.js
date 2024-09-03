const jwt = require("jsonwebtoken");

exports.verifyUsernameByToken = (username, token) => {
  const tokenData = jwt.decode(token);
  if (tokenData.username !== username) {
    throw { status: 401, message: "Unauthorized access." };
  }
};
