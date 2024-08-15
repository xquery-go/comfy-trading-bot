const { krakenRequest } = require("../utils/helperFunctions");

exports.createOrder = (type, volume, pair, price, stopLoss, validate = false) => {
  if (type !== "buy" && type !== "sell") {
    return Promise.reject(new Error("Invalid order type"));
  }
  if (isNaN(volume) || volume <= 0) {
    return Promise.reject(new Error("Invalid volume specified"));
  }
  if (isNaN(price) || price <= 0) {
    return Promise.reject(new Error("Invalid price specified"));
  }
  if (isNaN(stopLoss) || stopLoss <= 0) {
    return Promise.reject(new Error("Invalid stop loss specified"));
  }

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

  console.log(request);

  return krakenRequest(path, request);
};

exports.createTakeProfitOrder = (type, volume, price, validate = false) => {
  if (type !== "buy" && type !== "sell") {
    return Promise.reject(new Error("Invalid order type"));
  }
  if (isNaN(volume) || volume < 0) {
    return Promise.reject(new Error("Invalid volume specified"));
  }
  if (isNaN(price) || price < 0) {
    return Promise.reject(new Error("Invalid price specified"));
  }

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

  return krakenRequest(path, request);
};

exports.checkOpenPositions = async () => {
  const path = "/0/private/OpenPositions";
  return krakenRequest(path);
};

exports.trackPositionStatus = async (initialOrderId, takeProfitOrderId) => {
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

exports.removeOrderById = async (orderId) => {
  const path = "/0/private/CancelOrder";

  const request = {
    txid: orderId,
  };

  return krakenRequest(path, request);
};

exports.removeAllOrders = async () => {
  const path = "/0/private/CancelAll";
  return krakenRequest(path);
};

exports.updateOrderById = async (orderId, price) => {
  if (isNaN(price) || price < 0) {
    return Promise.reject(new Error("Invalid price specified"));
  }

  const path = "/0/private/EditOrder";

  const request = {
    txid: orderId,
    pair: "XBTUSDT",
    price,
  };

  return krakenRequest(path, request);
};
