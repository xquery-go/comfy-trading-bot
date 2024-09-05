const { riskManageVolume } = require("./riskManagement");
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
      0.01,
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

    if (!validate) {
      const orderId = orderData.txid[0];
      trackPositionStatus(orderId);
    }

    return { user: user.username, orderData, takeProfitOrderData };
  } catch (error) {
    return { user: user.username, error: error.message };
  }
};
