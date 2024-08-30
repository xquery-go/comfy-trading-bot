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
const { userSignUp, confirmUser, userSignIn, deleteUserByToken } = require("./controllers/auth.controller");
const { verifyAccessToken } = require("./utils/cognito");

const app = express();

app.use(express.json());

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
app.post("/sign-in", userSignIn)
app.delete("/delete-user", verifyAccessToken, deleteUserByToken)

module.exports = app;
