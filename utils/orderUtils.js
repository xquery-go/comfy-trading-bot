const { riskManageVolume } = require("./riskManagement");
const WebSocket = require("ws");
const {
  createOrder,
  createTakeProfitOrder,
  trackPositionStatus,
  removeAllOrders,
  removeOrderById,
  updateOrderById,
} = require("../models/order.model");

exports.placeOrderForUser = async (
  user,
  action,
  ticker,
  price,
  stopLoss,
  takeProfit,
  validate
) => {
  try {
    const orderVolume = await riskManageVolume(
      price,
      stopLoss,
      0.03,
      "USDT",
      user.api_key,
      user.private_key
    );

    const orderData = await createOrder(
      action,
      orderVolume,
      ticker,
      price,
      stopLoss,
      validate,
      user.api_key,
      user.private_key
    );

    const takeProfitOrderData = await createTakeProfitOrder(
      action,
      orderVolume,
      takeProfit,
      validate,
      user.api_key,
      user.private_key
    );

    return { user: user.username, orderData, takeProfitOrderData };
  } catch (error) {
    return { user: user.username, error: error.message };
  }
};

exports.monitorPriceForPositionClose = async (
  profitPrice,
  stopPrice,
  apiKeys
) => {
  const ws = new WebSocket("wss://ws.kraken.com/v2");

  const restingOrders = [profitPrice, stopPrice].sort((a, b) => a - b);

  ws.on("open", () => {
    ws.send(
      JSON.stringify({
        method: "subscribe",
        params: {
          channel: "ticker",
          symbol: ["BTC/USDT"],
        },
      })
    );
  });

  ws.on("message", async (data) => {
    let response = JSON.parse(data);
    let currentPrice;

    if (response.data) {
      currentPrice = response.data[0].last;
    }
    
    if (currentPrice > restingOrders[1] || currentPrice < restingOrders[0]) {
      for (let i = 0; i < apiKeys.length; i++) {
        await removeAllOrders(apiKeys[i].api_key, apiKeys[i].private_key);
      }
      ws.close();
    }
  });
};
