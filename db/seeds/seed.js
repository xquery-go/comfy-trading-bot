const format = require("pg-format");
const db = require("../connection");

exports.seed = async (testApiData) => {
  await db.query("DROP TABLE IF EXISTS api_keys;");

  await db.query(`CREATE TABLE api_keys (
        username VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL,
        api_key VARCHAR NOT NULL,
        private_key VARCHAR NOT NULL
        );`);

  const insertApiDataQueryStr = format(
    `INSERT INTO api_keys (username, email, api_key, private_key) VALUES %L;`,
    testApiData.map(({ username, email, api_key, private_key }) => [
      username,
      email,
      api_key,
      private_key,
    ])
  );
  await db.query(insertApiDataQueryStr);
};
