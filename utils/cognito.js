const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const {
  awsRegion,
  userPoolId,
  clientId,
  clientSecret,
} = require("./cognitoConfig");
const crypto = require("crypto");

const cognitoClient = new CognitoIdentityProviderClient({
  region: awsRegion,
});

const generateSecretHash = (username) => {
  return crypto
    .createHmac("SHA256", clientSecret)
    .update(username + clientId)
    .digest("base64");
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
