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

const app = express();

app.use(express.json());

app.get("/get-balance", getBalance);
app.get("/get-open-orders", getOpenOrders);
app.get("/get-pnl", getPnl);

app.post("/create-order", placeOrder);

app.patch("/edit-order", editOrder);
app.patch("/cancel-order", cancelOrderById);
app.patch("/cancel-all-orders", cancelAllOrders);

module.exports = app;
