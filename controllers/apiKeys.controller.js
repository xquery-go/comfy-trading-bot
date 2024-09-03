const { selectUserApiKeys } = require("../models/apiKeys.model");

exports.getUserApiKeys = async (req, res) => {
  const { username } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const apiKeysData = await selectUserApiKeys(username, token);
    res.status(200).send({ apiKeysData });
  } catch (error) {
    res.status(error.status).send({ message: error.message });
  }
};
