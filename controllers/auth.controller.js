const { authenticateUser, removeUser } = require("../models/auth.model");
const { createUser, validateUser } = require("../models/auth.model");

exports.userSignUp = async (req, res) => {
  const { email, password } = req.body;
  try {
    const signUpData = await createUser(email, password);

    res.status(201).send({ signUpData });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.confirmUser = async (req, res) => {
  const { email, code } = req.body;
  try {
    await validateUser(email, code);
    res.status(200).send();
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const authenticationResult = await authenticateUser(email, password);
    res.status(200).send({ authenticationResult });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.deleteUserByToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    await removeUser(token);
    res.status(202).send();
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};
