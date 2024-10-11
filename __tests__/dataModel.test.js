const {
  retrieveBalance,
  retrieveOpenOrders,
  retrievePnl,
  retrieveTradesHistory,
  retrieveLedgerInfo,
} = require("../models/data.model");
const { krakenRequest } = require("../utils/helperFunctions");

jest.mock("../utils/helperFunctions");

describe("retrieveBalance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path", async () => {
    const expectedPath = "/0/private/Balance";

    const input = ["api_key", "private_key"];

    await retrieveBalance(...input);
    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(
      expectedPath,
      undefined,
      ...input
    );
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    await expect(retrieveBalance()).rejects.toThrow(errorMessage);
  });
  it("should return the output of krakenRequest", async () => {
    const mockBalance = { BTC: 1 };

    krakenRequest.mockImplementationOnce(() => mockBalance);

    const balance = await retrieveBalance();

    expect(balance).toEqual(mockBalance);
  });
});

describe("retrieveLedgerInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path", async () => {
    const expectedPath = "/0/private/Ledgers";

    const input = ["api_key", "private_key"];

    await retrieveLedgerInfo(...input);
    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(
      expectedPath,
      undefined,
      ...input
    );
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    await expect(retrieveBalance()).rejects.toThrow(errorMessage);
  });
  it("should return the output of krakenRequest", async () => {
    const mockLedger = { BTC: 1 };

    krakenRequest.mockImplementationOnce(() => mockLedger);

    const ledgerInfo = await retrieveLedgerInfo();

    expect(ledgerInfo).toEqual(mockLedger);
  });
});

describe("retrieveOpenOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path", async () => {
    const expectedPath = "/0/private/OpenOrders";

    const input = ["api_key", "private_key"];

    await retrieveOpenOrders(...input);

    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(
      expectedPath,
      undefined,
      ...input
    );
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    await expect(retrieveOpenOrders()).rejects.toThrow(errorMessage);
  });
  it("should return the output of krakenRequest", async () => {
    const mockOpenOrdersData = { orderOne: "123" };

    krakenRequest.mockImplementationOnce(() => {
      return mockOpenOrdersData;
    });

    const openOrdersData = retrieveOpenOrders();

    expect(openOrdersData).toEqual(mockOpenOrdersData);
  });
});

describe("retrievePnl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path", async () => {
    const expectedPath = "/0/private/TradeBalance";

    const input = ["api_key", "private_key"];

    const mockTradeBalanceData = { v: 100.0 };

    krakenRequest.mockResolvedValueOnce(mockTradeBalanceData);

    await retrievePnl(...input);

    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(
      expectedPath,
      undefined,
      ...input
    );
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    await expect(retrievePnl()).rejects.toThrow(errorMessage);
  });
  it("should return a floating point valuation of the current open positions", async () => {
    const mockTradeBalanceData = { v: 100.0 };

    krakenRequest.mockResolvedValueOnce(mockTradeBalanceData);

    const actual = await retrievePnl();
    expect(typeof actual).toBe("number");
    expect(actual).toEqual(mockTradeBalanceData.v);
  });
});

describe("retrieveTradesHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call krakenRequest with the correct path", async () => {
    const expectedPath = "/0/private/TradesHistory";

    const input = ["api_key", "private_key"];

    await retrieveTradesHistory(...input);

    expect(krakenRequest).toHaveBeenCalled();
    expect(krakenRequest).toHaveBeenCalledWith(
      expectedPath,
      undefined,
      ...input
    );
  });
  it("should handle errors thrown by krakenRequest", async () => {
    const errorMessage = "Something went wrong";

    krakenRequest.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    await expect(retrieveTradesHistory()).rejects.toThrow(errorMessage);
  });
  it("should return the output of krakenRequest", async () => {
    const mockTradesHistory = { txid: "123" };

    krakenRequest.mockImplementationOnce(() => {
      return mockTradesHistory;
    });

    const openOrdersData = await retrieveTradesHistory();

    expect(openOrdersData).toEqual(mockTradesHistory);
  });
});
