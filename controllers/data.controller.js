const {
  retrieveBalance,
  retrieveOpenOrders,
  retrievePnl,
} = require("../models/data.model");

exports.getBalance = async (req, res) => {
  try {
    const balanceData = await retrieveBalance();

    res.status(200).send({ balanceData });
  } catch (error) {
    console.error("Error retrieving balance:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.getOpenOrders = async (req, res) => {
  try {
    const openOrdersData = await retrieveOpenOrders();

    res.status(200).send({ openOrdersData });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.getPnl = async (req, res) => {
  try {
    const unrealisedPnl = await retrievePnl();

    res.status(200).send({ unrealisedPnl });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};
