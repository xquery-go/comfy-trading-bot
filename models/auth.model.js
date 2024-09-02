const {
  signUp,
  confirmSignUp,
  signIn,
  deleteUser,
  changePassword,
  resendConfirmationCode,
  sendForgotPasswordCode,
  resetPassword,
  signOut,
} = require("../utils/cognito");

exports.createUser = async (email, password) => {
  try {
    const signUpDetails = await signUp(email, password);

    const response = {
      requestId: signUpDetails.$metadata.requestId,
      userSub: signUpDetails.UserSub,
      codeDestination: signUpDetails.CodeDeliveryDetails.Destination,
    };

    return response;
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.validateUser = async (email, code) => {
  try {
    await confirmSignUp(email, code);
    return true;
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.authenticateUser = async (email, password) => {
  try {
    const authenticationDetails = await signIn(email, password);
    return authenticationDetails;
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.removeUser = async (token) => {
  try {
    await deleteUser(token);
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.changeUserPassword = async (token, prevPass, proPass) => {
  try {
    const response = await changePassword(token, prevPass, proPass);
    return response;
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.triggerConfirmationCodeResend = async (email) => {
  try {
    const response = await resendConfirmationCode(email);
    return response;
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.resetUserPassword = async (email) => {
  try {
    const response = await sendForgotPasswordCode(email);
    return response;
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.confirmResetUserPassword = async (email, password, code) => {
  try {
    await resetPassword(email, password, code);
    return "Password reset successful.";
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};

exports.signOutUser = async (token) => {
  try {
    await signOut(token);
    return "Sign out successful.";
  } catch (error) {
    const errorMessage = {
      status: error.$metadata.httpStatusCode,
      msg: error.message,
    };
    throw errorMessage;
  }
};
