const db = require("../db/connection");
const apiKeys = require("../db/test-data/apiKeys");
const { checkUserExists } = require("../utils/dbUtils");
const { verifyUsernameByToken } = require("../utils/verification");

exports.selectUserApiKeys = async (username, token) => {
  try {
    verifyUsernameByToken(username, token);

    const userData = {};

    const response = await db.query(
      `SELECT * FROM api_keys WHERE username = $1;`,
      [username]
    );

    if (!response.rows.length) {
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

exports.addUserApiKeys = async (username, email, apiKey, privateKey, token) => {
  try {
    verifyUsernameByToken(username, token);

    const queryValues = [username, email, apiKey, privateKey];
    const response = await db.query(
      `
        INSERT INTO api_keys 
        (username, email, api_key, private_key) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
        `,
      queryValues
    );
    return response.rows[0];
  } catch (error) {
    throw error;
  }
};

exports.updateApiKeysByUser = async (username, apiKey, privateKey, token) => {
  try {
    verifyUsernameByToken(username, token);
    await checkUserExists(username)

    if (!apiKey || !privateKey) {
      throw { status: 400, message: "Missing required field." };
    }

    const queryValues = [username, apiKey, privateKey];

    const response = await db.query(
      `
        UPDATE api_keys
        SET api_key = $2,
        private_key = $3
        WHERE username = $1
        RETURNING *
        `,
      queryValues
    );
    return response.rows[0];
  } catch (error) {
    throw error;
  }
};

exports.removeUserApiKeys = async (username, token) => {
  try {
    verifyUsernameByToken(username, token);
    await checkUserExists(username);

    await db.query(
      `
            DELETE FROM api_keys
            WHERE username = $1
            `,
      [username]
    );
  } catch (error) {
    throw error;
  }
};
