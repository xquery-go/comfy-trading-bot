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
  getTradesHistory,
  getLedgerInfo,
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
  userAccessVerification,
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
  patchUserSettingsByUsername,
  deleteUserSettingsByUsername,
} = require("./controllers/userSettings.controller");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(testRoute);

// Kraken
app.get("/get-balance", verifyAccessToken, getBalance);
app.get("/api/kraken/ledger-info", verifyAccessToken, getLedgerInfo);
app.get("/get-open-orders", verifyAccessToken, getOpenOrders);
app.get("/get-pnl", verifyAccessToken, getPnl);
app.get("/get-trades-history", verifyAccessToken, getTradesHistory);
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
app.post("/api/auth/verify-access", verifyAccessToken, userAccessVerification);

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
app.patch(
  "/user-settings/:username",
  verifyAccessToken,
  patchUserSettingsByUsername
);
app.delete(
  "/user-settings/:username",
  verifyAccessToken,
  deleteUserSettingsByUsername
);

app.use(handlePsqlErrors);

module.exports = app;
