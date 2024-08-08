const { krakenRequest } = require("../utils/helperFunctions");

exports.retrieveBalance = () => {
  const path = "/0/private/Balance";
  return krakenRequest(path);
};

exports.retrieveOpenOrders = () => {
  const path = "/0/private/OpenOrders";
  return krakenRequest(path);
};

exports.retrievePnl = async () => {
  try {
    const path = "/0/private/TradeBalance";

    const tradeBalance = await krakenRequest(path);

    return tradeBalance.v
  } catch (error) {
    throw error;
  }
};
