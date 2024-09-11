const { verifyUsernameByToken } = require("../utils/verification");
const db = require("../db/connection");

exports.selectUserSettings = async (username, token) => {
  try {
    verifyUsernameByToken(username, token);

    const response = await db.query(
      `
        SELECT * FROM user_settings
        WHERE username = $1
        `,
      [username]
    );

    if (!response.rows.length) {
      throw { status: 404, message: "Not found." };
    }

    return response.rows[0];
  } catch (error) {
    throw error;
  }
};

exports.createUserSettings = async (username, strategy, bot_on, token) => {
  try {
    verifyUsernameByToken(username, token);

    const queryValues = [username, strategy, bot_on];
    
    const response = await db.query(
      `
        INSERT INTO user_settings 
        (username, strategy, bot_on)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
      queryValues
    );
    return response.rows[0];
  } catch (error) {
    throw error
  }
};
