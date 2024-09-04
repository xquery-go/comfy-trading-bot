const db = require("../db/connection");

exports.checkUserExists = async (username) => {
  try {
    const response = await db.query(
      `SELECT * FROM api_keys WHERE username = $1;`,
      [username]
    );

    if (!response.rows.length) {
      throw { status: 404, message: "Not found." };
    }
  } catch (error) {
    throw error;
  }
};
