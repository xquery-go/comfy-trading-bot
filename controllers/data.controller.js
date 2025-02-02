const { selectUserApiKeys } = require("../models/apiKeys.model");
const {
  retrieveBalance,
  retrieveOpenOrders,
  retrievePnl,
  retrieveTradesHistory,
  retrieveLedgerInfo,
} = require("../models/data.model");

exports.getBalance = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await selectUserApiKeys(username, token);
    const balanceData = await retrieveBalance(user.apiKey, user.privateKey);

    res.status(200).send({ balanceData });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.getLedgerInfo = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await selectUserApiKeys(username, token);
    const ledgerInfo = await retrieveLedgerInfo(user.apiKey, user.privateKey);

    res.status(200).send({ ledgerInfo });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.getOpenOrders = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await selectUserApiKeys(username, token);
    const openOrdersData = await retrieveOpenOrders(
      user.apiKey,
      user.privateKey
    );

    res.status(200).send({ openOrdersData });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.getPnl = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await selectUserApiKeys(username, token);
    const unrealisedPnl = await retrievePnl(user.apiKey, user.privateKey);

    res.status(200).send({ unrealisedPnl });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.getTradesHistory = async (req, res) => {
  const username = req.user.username;
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const user = await selectUserApiKeys(username, token);
    const tradesHistory = await retrieveTradesHistory(
      user.apiKey,
      user.privateKey
    );

    res.status(200).send({ tradesHistory });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};
