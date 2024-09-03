const {
  selectUserApiKeys,
  addUserApiKeys,
  updateApiKeysByUser,
} = require("../models/apiKeys.model");
const { verifyUsernameByToken } = require("../utils/verification");

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

exports.postUserApiKeys = async (req, res, next) => {
  const { username } = req.params;
  const { email, apiKey, privateKey } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const apiKeysData = await addUserApiKeys(
      username,
      email,
      apiKey,
      privateKey,
      token
    );
    res.status(201).send({ apiKeysData });
  } catch (error) {
    if (!error.status) {
      next(error);
    } else {
      res.status(error.status).send({ message: error.message });
    }
  }
};

exports.patchUserApiKeys = async (req, res, next) => {
  const { username } = req.params;
  const { apiKey, privateKey } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const updatedData = await updateApiKeysByUser(
      username,
      apiKey,
      privateKey,
      token
    );
    res.status(200).send({ updatedData });
  } catch (error) {
    if (!error.status) {
      next(error);
    }
    res.status(error.status).send({ message: error.message });
  }
};
