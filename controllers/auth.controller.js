const {
  authenticateUser,
  removeUser,
  changeUserPassword,
  triggerConfirmationCodeResend,
  resetUserPassword,
  confirmResetUserPassword,
  signOutUser,
} = require("../models/auth.model");
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

exports.changeUserPasswordByToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { previousPassword, proposedPassword } = req.body;
  try {
    const confirmationData = await changeUserPassword(
      token,
      previousPassword,
      proposedPassword
    );
    res.status(200).send({ confirmationData });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.resendAccountConfirmation = async (req, res) => {
  const { email } = req.body;
  try {
    const codeDeliveryData = await triggerConfirmationCodeResend(email);
    res.status(200).send({ codeDeliveryData });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.userForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const codeDeliveryData = await resetUserPassword(email);
    res.status(200).send({ codeDeliveryData });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.userConfirmForgotPassword = async (req, res) => {
  const { email, password, code } = req.body;
  try {
    const confirmationMessage = await confirmResetUserPassword(
      email,
      password,
      code
    );
    res.status(200).send({ confirmationMessage });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};

exports.userSignOut = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const confirmationMessage = await signOutUser(token);
    res.status(200).send({ confirmationMessage });
  } catch (error) {
    res.status(error.status).send({ message: error.msg });
  }
};
