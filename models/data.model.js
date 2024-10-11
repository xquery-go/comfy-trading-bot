const { krakenRequest } = require("../utils/helperFunctions");

exports.retrieveBalance = (apiKey, apiSecret) => {
  const path = "/0/private/Balance";
  return krakenRequest(path, undefined, apiKey, apiSecret);
};

exports.retrieveLedgerInfo = (apiKey, apiSecret) => {
  const path = "/0/private/Ledgers";
  return krakenRequest(path, undefined, apiKey, apiSecret);
};

exports.retrieveOpenOrders = (apiKey, apiSecret) => {
  const path = "/0/private/OpenOrders";
  return krakenRequest(path, undefined, apiKey, apiSecret);
};

exports.retrievePnl = async (apiKey, apiSecret) => {
  try {
    const path = "/0/private/TradeBalance";

    const tradeBalance = await krakenRequest(
      path,
      undefined,
      apiKey,
      apiSecret
    );

    return tradeBalance.v;
  } catch (error) {
    throw error;
  }
};

exports.retrieveTradesHistory = async (apiKey, apiSecret) => {
  try {
    const path = "/0/private/TradesHistory";

    const tradesHistory = await krakenRequest(
      path,
      undefined,
      apiKey,
      apiSecret
    );

    return tradesHistory;
  } catch (error) {
    throw error;
  }
};
