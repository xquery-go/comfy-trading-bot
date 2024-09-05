const {
  krakenRequest,
  validateOrderInputs,
} = require("../utils/helperFunctions");

exports.createOrder = async (
  type,
  volume,
  pair,
  price,
  stopLoss,
  validate = false,
  apiKey,
  apiSecret
) => {
  try {
    validateOrderInputs(type, volume, price, stopLoss);

    const path = "/0/private/AddOrder";
    const request = {
      ordertype: "limit",
      type,
      volume,
      pair,
      price,
      "close[ordertype]": "stop-loss",
      "close[price]": stopLoss,
      leverage: "3:1",
      validate,
    };

    return krakenRequest(path, request, apiKey, apiSecret);
  } catch (error) {
    throw error;
  }
};

exports.createTakeProfitOrder = async (
  type,
  volume,
  price,
  validate = false,
  apiKey,
  apiSecret
) => {
  try {
    validateOrderInputs(type, volume, price);

    const path = "/0/private/AddOrder";

    const request = {
      ordertype: "take-profit-limit",
      type: type === "buy" ? "sell" : "buy",
      volume,
      pair: "XBTUSDT",
      price,
      price2: "#5.0",
      leverage: "3:1",
      reduce_only: true,
      validate,
    };

    return krakenRequest(path, request, apiKey, apiSecret);
  } catch (error) {
    throw error;
  }
};

exports.checkOpenPositions = async () => {
  const path = "/0/private/OpenPositions";
  return krakenRequest(path);
};

exports.trackPositionStatus = async (initialOrderId) => {
  let positionFound = false;
  const interval = setInterval(async () => {
    try {
      const positions = await this.checkOpenPositions();
      console.log("Checking open positions...", positions);

      for (const positionId in positions) {
        const position = positions[positionId];
        if (position.ordertxid === initialOrderId) {
          positionFound = true;
          console.log("Position still open:", position);
        }
      }

      if (!Object.keys(positions).length && positionFound) {
        await this.removeAllOrders();
        console.log("Position Closed.");

        clearInterval(interval); // Stop polling once the action is taken
      }
    } catch (error) {
      console.error("Error in trackPositionStatus:", error);
    }
  }, 60000); // Check every minute
};

exports.removeOrderById = async (orderId, apiKey, privateKey) => {
  const path = "/0/private/CancelOrder";
  try {
    const request = {
      txid: orderId,
    };

    return krakenRequest(path, request, apiKey, privateKey);
  } catch (error) {
    throw error;
  }
};

exports.removeAllOrders = async (apiKey, privateKey) => {
  const path = "/0/private/CancelAll";
  return krakenRequest(path, undefined, apiKey, privateKey);
};

exports.updateOrderById = async (orderId, price, apiKey, privateKey) => {
  try {
    validateOrderInputs(undefined, undefined, price);

    const path = "/0/private/EditOrder";

    const request = {
      txid: orderId,
      pair: "XBTUSDT",
      price,
    };

    return krakenRequest(path, request, apiKey, privateKey);
  } catch (error) {
    throw error;
  }
};
