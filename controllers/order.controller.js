const {
  createOrder,
  createTakeProfitOrder,
  trackPositionStatus,
  removeAllOrders,
  removeOrderById,
  updateOrderById,
} = require("../models/order.model");

exports.placeOrder = async (req, res) => {
  try {
    const { action, quantity, ticker, price, stopLoss, takeProfit, validate } =
      req.body;
    const orderData = await createOrder(
      action,
      quantity,
      ticker,
      price,
      stopLoss,
      validate
    );

    const takeProfitOrderData = await createTakeProfitOrder(
      action,
      quantity,
      takeProfit,
      validate
    );

    if (!validate) {
      const orderId = orderData.txid[0];
      trackPositionStatus(orderId);
    }

    res.status(201).send({ orderData, takeProfitOrderData });
  } catch (error) {
    console.error("Error placing order:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.cancelOrderById = async (req, res) => {
  try {
    const { txid } = req.body;
    const removalData = await removeOrderById(txid);

    res.status(200).send({ removalData });
  } catch (error) {
    console.error("Error removing order:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.cancelAllOrders = async (req, res) => {
  try {
    const removalData = await removeAllOrders();

    res.status(200).send({ removalData });
  } catch (error) {
    console.error("Error removing orders:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};

exports.editOrder = async (req, res) => {
  try {
    const { txid, price } = req.body;

    const updatedOrderData = await updateOrderById(txid, price);

    res.status(200).send({ updatedOrderData });
  } catch (error) {
    console.error("Error editing order:", error);
    res
      .status(500)
      .send({ error: "Internal Server Error", details: error.message });
  }
};
