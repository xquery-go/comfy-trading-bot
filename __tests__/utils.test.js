const { riskManageVolume } = require("../utils/riskManagement");
const { retrieveBalance } = require("../models/data.model");
const { getAllApiKeys } = require("../models/apiKeys.model");
const { seed } = require("../db/seeds/seed");
const testApiData = require("../db/test-data/apiKeys");
const testUserSettingsData = require("../db/test-data/userSettings");
const db = require("../db/connection");

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
    expect(actual).toBe(0.0061065);
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
    expect(actual).toBe(0.006317068965517241);
  });
});

beforeEach(async () => {
  await seed(testApiData, testUserSettingsData);
});

afterAll(async () => {
  await db.end();
});

describe("getAllApiKeys", () => {
  it("should when successful return an array of objects containing user api keys", async () => {
    const expected = [
      {
        username: "john_doe",
        api_key: "123abc456def",
        private_key: "private_key_john_doe",
      },
      {
        username: "jane_smith",
        api_key: "789ghi012jkl",
        private_key: "private_key_jane_smith",
      },
      {
        username: "michael_brown",
        api_key: "345mno678pqr",
        private_key: "private_key_michael_brown",
      },
      {
        username: "lisa_jones",
        api_key: "901stu234vwx",
        private_key: "private_key_lisa_jones",
      },
      {
        username: "emma_davis",
        api_key: "567yzx890abc",
        private_key: "private_key_emma_davis",
      },
      {
        username: "william_miller",
        api_key: "123cde456fgh",
        private_key: "private_key_william_miller",
      },
      {
        username: "sophia_wilson",
        api_key: "789ijk012lmn",
        private_key: "private_key_sophia_wilson",
      },
      {
        username: "liam_moore",
        api_key: "345opq678rst",
        private_key: "private_key_liam_moore",
      },
      {
        username: "olivia_taylor",
        api_key: "901uvw234xyz",
        private_key: "private_key_olivia_taylor",
      },
      {
        username: "noah_anderson",
        api_key: "567bcd890efg",
        private_key: "private_key_noah_anderson",
      },
    ];

    const actual = await getAllApiKeys();

    expect(actual).toEqual(expected);
  });
});
