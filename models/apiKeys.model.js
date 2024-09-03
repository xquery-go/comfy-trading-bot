const db = require("../db/connection");
const { verifyUsernameByToken } = require("../utils/verification");

exports.selectUserApiKeys = async (username, token) => {
  try {
    verifyUsernameByToken(username, token);

    const userData = {};

    const response = await db.query(
      `SELECT * FROM api_keys WHERE username = $1;`,
      [username]
    );

    if(!response.rows.length) {
        throw { status: 404, message: "Not found." };
    }

    userData.username = response.rows[0].username;
    userData.apiKey = response.rows[0].api_key;
    userData.privateKey = response.rows[0].private_key;

    return userData;
  } catch (error) {
    throw error;
  }
};
