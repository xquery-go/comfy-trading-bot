const format = require("pg-format");
const db = require("../connection");

exports.seed = async (testApiData, userSettingsData) => {
  await db.query("DROP TABLE IF EXISTS user_settings;");
  await db.query("DROP TABLE IF EXISTS api_keys;");

  await db.query(`CREATE TABLE api_keys (
        username VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL,
        api_key VARCHAR NOT NULL,
        private_key VARCHAR NOT NULL
        );`);

  await db.query(`CREATE TABLE user_settings ( 
        username VARCHAR PRIMARY KEY,
        strategy VARCHAR NOT NULL,
        bot_on BOOLEAN NOT NULL,
        FOREIGN KEY (username) REFERENCES api_keys(username) ON DELETE CASCADE)`);

  const insertApiDataQueryStr = format(
    `INSERT INTO api_keys (username, email, api_key, private_key) VALUES %L;`,
    testApiData.map(({ username, email, api_key, private_key }) => [
      username,
      email,
      api_key,
      private_key,
    ])
  );
  const insertUserSettingsDataQueryStr = format(
    `INSERT INTO user_settings (username, strategy, bot_on) VALUES %L;`,
    userSettingsData.map(({ username, strategy, bot_on }) => [
      username,
      strategy,
      bot_on,
    ])
  );
  await db.query(insertApiDataQueryStr);
  await db.query(insertUserSettingsDataQueryStr);
};
