const {
  createOrder,
  createTakeProfitOrder,
  checkOpenPositions,
  removeAllOrders,
  trackPositionStatus,
  removeOrderById,
  updateOrderById,
} = require("../models/order.model");
const {
  krakenRequest,
  validateOrderInputs,
} = require("../utils/helperFunctions");
const { riskManageVolume } = require("../utils/riskManagement");

jest.mock("../utils/helperFunctions", () => {
  const originalModule = jest.requireActual('../utils/helperFunctions')
  return {
    ...originalModule,
    krakenRequest: jest.fn(() => {}),
  };
});
jest.mock("../utils/riskManagement");

describe("createOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {}); // Optional: Mock console.log to avoid clutter
    jest.spyOn(console, "error").mockImplementation(() => {}); // Optional: Mock console.error
  });

  it("should call krakenRequest with correct arguments", async () => {
    const input = {
      type: "buy",
      volume: 0.001,
      pair: "XBTUSD",
      price: 50000,
      stopLoss: 49000,
      validate: false,
    };

    riskManageVolume.mockImplementationOnce(() => {
      return 0.001;
    });

    const expectedPath = "/0/private/AddOrder";
    const expectedRequest = {
      ordertype: "limit",
      type: "buy",
      volume: 0.001,
      pair: "XBTUSD",
      price: 50000,
      "close[ordertype]": "stop-loss",
      "close[price]": 49000,
      leverage: "3:1",
      validate: false,
    };

    await createOrder(...Object.values(input));

    expect(krakenRequest).toHaveBeenCalledWith(expectedPath, expectedRequest);
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const input = {
      type: "buy",
      volume: 0.001,
      pair: "XBTUSD",
      price: 50000,
      stopLoss: 49000,
      validate: false,
    };

    const expectedPath = "/0/private/AddOrder";
    const expectedRequest = {
      ordertype: "limit",
      type: "buy",
      volume: 0.001,
      pair: "XBTUSD",
      price: 50000,
      "close[ordertype]": "stop-loss",
      "close[price]": 49000,
      leverage: "3:1",
      validate: false,
    };

    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    await expect(createOrder(...Object.values(input))).rejects.toThrow(
      errorMessage
    );
  });
  it("should throw an error if invalid an invalid order type is given", async () => {
    const input = ["banana", 0.001, "XBTUSD", 50000, false];

    await expect(createOrder(...input)).rejects.toThrow("Invalid order type");
  });
  it("should throw an error if volume is either NaN, or volume is 0 or below", async () => {
    const input = ["buy", -1, "XBTUSD", 50000, false];
    const inputTwo = ["buy", "banana", "XBTUSD", 50000, false];
    const inputThree = ["buy", 0, "XBTUSD", 50000, false];

    await expect(createOrder(...input)).rejects.toThrow(
      "Invalid volume specified"
    );
    await expect(createOrder(...inputTwo)).rejects.toThrow(
      "Invalid volume specified"
    );
    await expect(createOrder(...inputThree)).rejects.toThrow(
      "Invalid volume specified"
    );
  });
  it("should throw an error if price is NaN, or if price is 0 or below", async () => {
    const input = ["buy", 0.001, "XBTUSD", -50000, false];
    const inputTwo = ["buy", 0.001, "XBTUSD", "banana", false];
    const inputThree = ["buy", 0.001, "XBTUSD", 0, false];

    await expect(createOrder(...input)).rejects.toThrow(
      "Invalid price specified"
    );
    await expect(createOrder(...inputTwo)).rejects.toThrow(
      "Invalid price specified"
    );
    await expect(createOrder(...inputThree)).rejects.toThrow(
      "Invalid price specified"
    );
  });
  it("should throw an error if stopLoss is NaN, or if stopLoss is 0 or below", async () => {
    const input = ["buy", 0.001, "XBTUSD", 50000, 0, false];
    const inputTwo = ["buy", 0.001, "XBTUSD", 50000, "banana", false];
    const inputThree = ["buy", 0.001, "XBTUSD", 50000, -4, false];

    await expect(createOrder(...input)).rejects.toThrow(
      "Invalid stop loss specified"
    );
    await expect(createOrder(...inputTwo)).rejects.toThrow(
      "Invalid stop loss specified"
    );
    await expect(createOrder(...inputThree)).rejects.toThrow(
      "Invalid stop loss specified"
    );
  });
});

describe("createTakeProfit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path and request", async () => {
    const input = ["buy", 0.001, 50000, false];

    const expectedPath = "/0/private/AddOrder";

    const expectedRequest = {
      ordertype: "take-profit-limit",
      type: "sell",
      volume: 0.001,
      pair: "XBTUSDT",
      price: 50000,
      price2: "#5.0",
      leverage: "3:1",
      reduce_only: true,
      validate: false,
    };

    await createTakeProfitOrder(...input);

    expect(krakenRequest).toHaveBeenCalledWith(expectedPath, expectedRequest);
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const input = ["buy", 0.001, 50000, false];

    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    await expect(createTakeProfitOrder(...input)).rejects.toThrow(errorMessage);
  });
  it("should throw an error if an invalid order type is provided", async () => {
    const input = ["invalidType", 0.001, 50000, false];

    await expect(createTakeProfitOrder(...input)).rejects.toThrow(
      "Invalid order type"
    );
  });
  it("should throw an error if pass a volome that is NaN or is less than 0", async () => {
    const input = ["buy", -1, 50000, true];
    const inputTwo = ["buy", "banana", 50000, true];

    await expect(createTakeProfitOrder(...input)).rejects.toThrow(
      "Invalid volume specified"
    );
    await expect(createTakeProfitOrder(...inputTwo)).rejects.toThrow(
      "Invalid volume specified"
    );
  });
  it("should throw an error if passed a price that is NaN or less than 0", async () => {
    const input = ["buy", 1, -50000, true];
    const inputTwo = ["buy", 1, "banana", true];

    await expect(createTakeProfitOrder(...input)).rejects.toThrow(
      "Invalid price specified"
    );
    await expect(createTakeProfitOrder(...inputTwo)).rejects.toThrow(
      "Invalid price specified"
    );
  });
});

describe("checkOpenPositions", () => {
  it("should call krakenRequest with the correct arguments", async () => {
    const expectedPath = "/0/private/OpenPositions";

    await checkOpenPositions();

    expect(krakenRequest).toHaveBeenCalledWith(expectedPath);
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    const actual = checkOpenPositions();

    await expect(actual).rejects.toThrow(errorMessage);
  });
});

describe("removeOrderById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path and request", async () => {
    const input = "order123";

    const expectedRequest = {
      txid: "order123",
    };
    const expectedPath = "/0/private/CancelOrder";

    await removeOrderById(input);

    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(expectedPath, expectedRequest);
  });
  it("should return removed order data when successful", async () => {
    const input = "order123";
    const mockRemovalData = { count: 1 };

    krakenRequest.mockImplementationOnce(() => {
      return mockRemovalData;
    });
    const removalData = await removeOrderById(input);

    expect(removalData).toEqual(mockRemovalData);
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const input = "order123";
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    const actual = removeOrderById(input);

    await expect(actual).rejects.toThrow(errorMessage);
  });
});

describe("removeAllOrders", () => {
  it("should call krakenRequest with the correct path", async () => {
    const expectedPath = "/0/private/CancelAll";

    await removeAllOrders();

    expect(krakenRequest).toHaveBeenCalledWith(expectedPath);
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    const actual = removeAllOrders();

    await expect(actual).rejects.toThrow(errorMessage);
  });
});

describe("updateOrderById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path and request", async () => {
    const input = ["123", 50000];

    const expectedPath = "/0/private/EditOrder";

    const expectedRequest = {
      txid: "123",
      pair: "XBTUSDT",
      price: 50000,
    };

    await updateOrderById(...input);

    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(expectedPath, expectedRequest);
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const input = ["123", 50000];
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    await expect(updateOrderById(...input)).rejects.toThrow(errorMessage);
  });
  it("should throw an error if price is NaN, or below 0", async () => {
    const input = ["123", "NaN"];
    const inputTwo = ["123", -50000];

    await expect(updateOrderById(...input)).rejects.toThrow(
      "Invalid price specified"
    );
    await expect(updateOrderById(...inputTwo)).rejects.toThrow(
      "Invalid price specified"
    );
  });
  it("should return the output of krakenRequest", async () => {
    const input = ["123", 50000];

    const mockUpdatedOrderData = { orderOne: "updated data" };

    krakenRequest.mockImplementationOnce(() => {
      return mockUpdatedOrderData;
    });

    const updatedOrderData = await updateOrderById(...input);
    expect(updatedOrderData).toEqual(mockUpdatedOrderData);
  });
});
