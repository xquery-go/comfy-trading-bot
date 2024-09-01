const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  DeleteUserCommand,
  ChangePasswordCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const {
  awsRegion,
  userPoolId,
  clientId,
  clientSecret,
} = require("./cognitoConfig");
const crypto = require("crypto");
require("dotenv").config();

const cognitoClient = new CognitoIdentityProviderClient({
  region: awsRegion,
});

const verifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  tokenUse: "access",
  clientId: clientId,
});

const generateSecretHash = (username) => {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
};

exports.verifyAccessToken = async (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send({ message: "No token provided" });
  }

  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);

    req.user = payload;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).send({ message: "Unauthorized" });
  }
};

exports.signIn = async (email, password) => {
  const secretHash = generateSecretHash(email);

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    SecretHash: secretHash,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: secretHash,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);
    if (AuthenticationResult) {
      return {
        accessToken: AuthenticationResult.AccessToken,
        idToken: AuthenticationResult.IdToken,
        refreshToken: AuthenticationResult.RefreshToken,
      };
    }
  } catch (error) {
    throw error;
  }
};

exports.signUp = async (email, password) => {
  const secretHash = generateSecretHash(email);

  const params = {
    ClientId: clientId,
    Username: email,
    Password: password,
    SecretHash: secretHash,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.confirmSignUp = async (email, code) => {
  const secretHash = generateSecretHash(email);

  const params = {
    ClientId: clientId,
    Username: email,
    ConfirmationCode: code,
    SecretHash: secretHash,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};

exports.resendConfirmationCode = async (email) => {
  const secretHash = generateSecretHash(email);

  const params = {
    ClientId: clientId,
    SecretHash: secretHash,
    Username: email,
  };
  try {
    const command = new ResendConfirmationCodeCommand(params);
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.deleteUser = async (accessToken) => {
  const params = {
    AccessToken: accessToken,
  };
  try {
    const command = new DeleteUserCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

exports.changePassword = async (accessToken, prevPass, proPass) => {
  const params = {
    PreviousPassword: prevPass,
    ProposedPassword: proPass,
    AccessToken: accessToken,
  };
  try {
    const command = new ChangePasswordCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

exports.sendForgotPasswordCode = (email) => {
  const secretHash = generateSecretHash(email);
  const params = {
    ClientId: clientId,
    SecretHash: secretHash,
    Username: email,
  };
  try {
    const command = new ForgotPasswordCommand(params);
    const response = cognitoClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
};

exports.resetPassword = async (email, password, code) => {
  const secretHash = generateSecretHash(email);
  const params = {
    ClientId: clientId,
    SecretHash: secretHash,
    Username: email,
    Password: password,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmForgotPasswordCommand(params);
    const response = await cognitoClient.send(command);
    return response;
  } catch (error) {
    throw error;
  }
};
