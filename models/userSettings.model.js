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
    throw error;
  }
};

exports.updateUserSettings = async (username, strategy, bot_on, token) => {
  try {
    verifyUsernameByToken(username, token);
    const queryValues = [username];

    let sqlQuery = "UPDATE user_settings SET";

    if (strategy && bot_on !== undefined) {
      queryValues.push(strategy);
      sqlQuery += ` strategy = $2,`;
    } else if (strategy) {
      queryValues.push(strategy);
      sqlQuery += ` strategy = $2`;
    }

    if (bot_on !== undefined && strategy) {
      queryValues.push(bot_on);
      sqlQuery += ` bot_on = $3`;
    } else if (bot_on !== undefined) {
      queryValues.push(bot_on);
      sqlQuery += ` bot_on = $2`;
    }

    sqlQuery += ` WHERE username = $1`;

    sqlQuery += ` RETURNING *`;

    const response = await db.query(sqlQuery, queryValues);

    return response.rows[0];
  } catch (error) {
    throw error;
  }
};

exports.removeUserSettings = async (username, token) => {
  try {
    verifyUsernameByToken(username, token);
    
    const response = await db.query(
      `DELETE FROM user_settings WHERE username = $1`,
      [username]
    );

    if (response.rowCount === 0) {
      throw { status: 404, message: "User does not exist." };
    }
  } catch (error) {
    throw error;
  }
};
