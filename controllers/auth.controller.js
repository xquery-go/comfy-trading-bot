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
