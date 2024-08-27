const { riskManageVolume } = require("../utils/riskManagement");
const { retrieveBalance } = require("../models/data.model");

jest.mock("../models/data.model");

describe("riskManageVolume", () => {
  it("it should take an entry price, a stopLoss price, risk percentage and baseCurrency. Then return a number", async () => {
    const input = [30000, 29000, 0.01, "USDT"];
    const mockBalanceData = {
      ATOM: "0.00000085",
      ETHW: "0.1459970",
      LINK: "0.0000000000",
      MATIC: "0.0000009700",
      USDC: "0.00003000",
      USDT: "124.11134543",
      XETH: "0.0000000000",
      XLTC: "0.0000078200",
      XXBT: "0.0000000008",
      ZGBP: "0.0000",
    };
    retrieveBalance.mockImplementationOnce(() => {
      return mockBalanceData;
    });
    const actual = await riskManageVolume(...input);
    expect(typeof actual).toBe("number");
  });
  it("should call the retrieveBalance function once", async () => {
    const input = [30000, 29000, 0.01, "USDT"];
    const mockBalanceData = {
      ATOM: "0.00000085",
      ETHW: "0.1459970",
      LINK: "0.0000000000",
      MATIC: "0.0000009700",
      USDC: "0.00003000",
      USDT: "124.11134543",
      XETH: "0.0000000000",
      XLTC: "0.0000078200",
      XXBT: "0.0000000008",
      ZGBP: "0.0000",
    };
    retrieveBalance.mockImplementationOnce(() => {
      return mockBalanceData;
    });
    const actual = await riskManageVolume(...input);
    expect(retrieveBalance).toHaveBeenCalled();
  });
  it("should return a the correct volume for the trade based off the provide arguments", async () => {
    const input = [30000, 29000, 0.05, "USDT"];
    const mockBalanceData = {
      ATOM: "0.00000085",
      ETHW: "0.1459970",
      LINK: "0.0000000000",
      MATIC: "0.0000009700",
      USDC: "0.00003000",
      USDT: "124.11134543",
      XETH: "0.0000000000",
      XLTC: "0.0000078200",
      XXBT: "0.0000000008",
      ZGBP: "0.0000",
    };
    retrieveBalance.mockImplementationOnce(() => {
      return mockBalanceData;
    });
    const actual = await riskManageVolume(...input);
    expect(actual).toBe(0.0069);
  });
  it("should account for if the position direction is short", async () => {
    const input = [29000, 30000, 0.05, "USDT"];
    const mockBalanceData = {
      ATOM: "0.00000085",
      ETHW: "0.1459970",
      LINK: "0.0000000000",
      MATIC: "0.0000009700",
      USDC: "0.00003000",
      USDT: "124.11134543",
      XETH: "0.0000000000",
      XLTC: "0.0000078200",
      XXBT: "0.0000000008",
      ZGBP: "0.0000",
    };
    retrieveBalance.mockImplementationOnce(() => {
      return mockBalanceData;
    });
    const actual = await riskManageVolume(...input);
    expect(actual).toBe(0.007137931034482759);
  });
});
