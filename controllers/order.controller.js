const { getAllApiKeys, selectUserApiKeys, getApiKeysByStrategy } = require("../models/apiKeys.model");
const {
  createOrder,
  createTakeProfitOrder,
  trackPositionStatus,
  removeAllOrders,
  removeOrderById,
  updateOrderById,
} = require("../models/order.model");
const { riskManageVolume } = require("../utils/riskManagement");
const { placeOrderForUser, monitorPriceForPositionClose } = require("../utils/orderUtils");

exports.placeOrder = async (req, res) => {
  try {
    const { action, ticker, price, stopLoss, takeProfit, validate, strategy } = req.body;

    const apiKeys = await getApiKeysByStrategy(strategy);

    const results = await Promise.all(
      apiKeys.map(async (user) => {
        return placeOrderForUser(
          user,
          action,
          ticker,
          price,
          stopLoss,
          takeProfit,
          validate
        );
      })
    );

    monitorPriceForPositionClose(takeProfit, stopLoss, apiKeys)

    res.status(201).send({ results });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.cancelOrderById = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  const { txid } = req.body;
  try {
    const user = await selectUserApiKeys(username, token);

    const removalData = await removeOrderById(
      txid,
      user.apiKey,
      user.privateKey
    );

    res.status(200).send({ removalData });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.cancelAllOrders = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await selectUserApiKeys(username, token);

    const removalData = await removeAllOrders(user.apiKey,
      user.privateKey);

    res.status(200).send({ removalData });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.editOrder = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  const { txid, price } = req.body;
  try {
    const user = await selectUserApiKeys(username, token);

    const updatedOrderData = await updateOrderById(txid, price, user.apiKey, user.privateKey);

    res.status(200).send({ updatedOrderData });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};
