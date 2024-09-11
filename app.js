const express = require("express");
const {
  placeOrder,
  cancelAllOrders,
  cancelOrderById,
  editOrder,
} = require("./controllers/order.controller");
const {
  getBalance,
  getOpenOrders,
  getPnl,
} = require("./controllers/data.controller");
const {
  userSignUp,
  confirmUser,
  userSignIn,
  deleteUserByToken,
  changeUserPasswordByToken,
  resendAccountConfirmation,
  userForgotPassword,
  userConfirmForgotPassword,
  userSignOut,
} = require("./controllers/auth.controller");
const { verifyAccessToken } = require("./utils/cognito");
const {
  getUserApiKeys,
  postUserApiKeys,
  patchUserApiKeys,
  deleteUserApiKeys,
} = require("./controllers/apiKeys.controller");
const { handlePsqlErrors } = require("./errors/errorHandlers");
const { testRoute } = require("./utils/verification");
const {
  getUserSettingsByUsername,
  postUserSettingsByUsername,
} = require("./controllers/userSettings.controller");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(testRoute);

// Kraken
app.get("/get-balance", verifyAccessToken, getBalance);
app.get("/get-open-orders", verifyAccessToken, getOpenOrders);
app.get("/get-pnl", verifyAccessToken, getPnl);
app.post("/create-order", placeOrder);
app.patch("/edit-order", verifyAccessToken, editOrder);
app.patch("/cancel-order", verifyAccessToken, cancelOrderById);
app.patch("/cancel-all-orders", verifyAccessToken, cancelAllOrders);

// Auth
app.post("/register", userSignUp);
app.post("/confirm-sign-up", confirmUser);
app.post("/resend-confirmation-code", resendAccountConfirmation);
app.post("/sign-in", userSignIn);
app.post("/sign-out", verifyAccessToken, userSignOut);
app.post("/forgot-password", userForgotPassword);
app.post("/confirm-forgot-password", userConfirmForgotPassword);
app.patch("/change-password", verifyAccessToken, changeUserPasswordByToken);
app.delete("/delete-user", verifyAccessToken, deleteUserByToken);

// Database
app.get("/api-keys/:username", verifyAccessToken, getUserApiKeys);
app.post("/api-keys/:username", verifyAccessToken, postUserApiKeys);
app.patch("/api-keys/:username", verifyAccessToken, patchUserApiKeys);
app.delete("/api-keys/:username", verifyAccessToken, deleteUserApiKeys);

app.get(
  "/user-settings/:username",
  verifyAccessToken,
  getUserSettingsByUsername
);
app.post(
  "/user-settings/:username",
  verifyAccessToken,
  postUserSettingsByUsername
);
app.use(handlePsqlErrors);

module.exports = app;
