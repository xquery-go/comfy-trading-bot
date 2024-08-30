const request = require("supertest");
const app = require("../app");
const {
  createOrder,
  createTakeProfitOrder,
  trackPositionStatus,
  removeAllOrders,
  removeOrderById,
  updateOrderById,
} = require("../models/order.model");
const {
  retrieveBalance,
  retrieveOpenOrders,
  retrievePnl,
} = require("../models/data.model");
const { riskManageVolume } = require("../utils/riskManagement");
const {
  createUser,
  validateUser,
  authenticateUser,
  removeUser,
} = require("../models/auth.model");

jest.mock("../models/order.model", () => ({
  createOrder: jest.fn(),
  createTakeProfitOrder: jest.fn(),
  trackPositionStatus: jest.fn(),
  removeAllOrders: jest.fn(),
  removeOrderById: jest.fn(),
  updateOrderById: jest.fn(),
}));

jest.mock("../models/data.model", () => ({
  retrieveBalance: jest.fn(),
  retrieveOpenOrders: jest.fn(),
  retrievePnl: jest.fn(),
}));

jest.mock("../utils/helperFunctions");
jest.mock("../utils/riskManagement");
jest.mock("../models/auth.model");

describe("POST /create-order", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should respond with a 201 status code and order data on successful order placement", async () => {
    const mockOrderDetails = {
      ticker: "BTCUSDT",
      action: "buy",
      price: 64513.9,
      quantity: 0.1956,
      takeProfit: 64616.1,
      stopLoss: 64462.8,
      validate: false,
    };

    const mockOrderData = { txid: ["order123"] };

    riskManageVolume.mockResolvedValue(0.001);

    createOrder.mockResolvedValue(mockOrderData);

    return request(app)
      .post("/create-order")
      .expect(201)
      .send(mockOrderDetails)
      .then(({ body }) => {
        expect(body.orderData).toEqual(mockOrderData);
        expect(createOrder).toHaveBeenCalled();
        expect(createOrder).toHaveBeenCalledWith(
          mockOrderDetails.action,
          0.001,
          mockOrderDetails.ticker,
          mockOrderDetails.price,
          mockOrderDetails.stopLoss,
          mockOrderDetails.validate
        );
      });
  });
  it("should also respond with a 201 status code and take profit order data on a successful order placement", async () => {
    const mockOrderDetails = {
      ticker: "BTCUSDT",
      action: "buy",
      price: 64513.9,
      quantity: 0.1956,
      takeProfit: 64616.1,
      stopLoss: 64462.8,
      validate: false,
    };

    const mockTakeProftOrderData = { txid: ["order123"] };

    riskManageVolume.mockResolvedValue(0.001);

    createTakeProfitOrder.mockResolvedValue(mockTakeProftOrderData);

    return request(app)
      .post("/create-order")
      .expect(201)
      .send(mockOrderDetails)
      .then(({ body }) => {
        expect(body.takeProfitOrderData).toEqual(mockTakeProftOrderData);
        expect(createTakeProfitOrder).toHaveBeenCalled();
        expect(createTakeProfitOrder).toHaveBeenCalledWith(
          mockOrderDetails.action,
          0.001,
          mockOrderDetails.takeProfit,
          mockOrderDetails.validate
        );
      });
  });
  it("should call the trackPositionStatus function, with the txid of the placed order", async () => {
    const mockOrderDetails = {
      ticker: "BTCUSDT",
      action: "buy",
      price: 64513.9,
      quantity: 0.1956,
      takeProfit: 64616.1,
      stopLoss: 64462.8,
    };

    const mockOrderData = { txid: ["order123"] };

    createOrder.mockResolvedValue(mockOrderData);

    return request(app)
      .post("/create-order")
      .expect(201)
      .send(mockOrderDetails)
      .then(({ body }) => {
        expect(trackPositionStatus).toHaveBeenCalled();
        expect(trackPositionStatus).toHaveBeenCalledWith(mockOrderData.txid[0]);
      });
  });
});

describe("GET /get-balance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should respond with 200 status code, and a balance data object", async () => {
    const mockBalanceData = { BTC: 1 };

    retrieveBalance.mockResolvedValue(mockBalanceData);

    return request(app)
      .get("/get-balance")
      .expect(200)
      .then(({ body }) => {
        expect(retrieveBalance).toHaveBeenCalled();
        expect(body.balanceData).toEqual(mockBalanceData);
      });
  });
  it("should handle errors thrown by retrieveBalance", async () => {
    const errorMessage = "Something went wrong";

    retrieveBalance.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .get("/get-balance")
      .expect(500)
      .then(({ body }) => {
        expect(body.error).toBe("Internal Server Error");
        expect(body.details).toBe(errorMessage);
      });
  });
});

describe("PATCH /cancel-order", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should respond with a 200 status code when successful, and confirmation of removed order", async () => {
    const mockRemovalData = { removeCount: 1 };

    removeOrderById.mockResolvedValue(mockRemovalData);

    return request(app)
      .patch("/cancel-order")
      .expect(200)
      .then(({ body }) => {
        expect(removeOrderById).toHaveBeenCalled();
        expect(body.removalData).toEqual(mockRemovalData);
      });
  });
  it("should call removeOrderById with the correct parameters", async () => {
    const input = {
      txid: "order123",
    };

    return request(app)
      .patch("/cancel-order")
      .expect(200)
      .send(input)
      .then(({ body }) => {
        expect(removeOrderById).toHaveBeenCalledWith(input.txid);
      });
  });
  it("should handle errors thrown by removeOrderById", async () => {
    const input = {
      txid: "order123",
    };

    const errorMessage = "Something went wrong";

    removeOrderById.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .patch("/cancel-order")
      .expect(500)
      .send(input)
      .then(({ body }) => {
        expect(body.error).toBe("Internal Server Error");
        expect(body.details).toBe(errorMessage);
      });
  });
});

describe("PATCH /cancel-all-orders", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should respond with a 200 status code, and confirmation of removed orders", async () => {
    const mockRemovalData = { removeCount: 2 };

    removeAllOrders.mockResolvedValue(mockRemovalData);

    return request(app)
      .patch("/cancel-all-orders")
      .expect(200)
      .then(({ body }) => {
        expect(removeAllOrders).toHaveBeenCalled();
        expect(body.removalData).toEqual(mockRemovalData);
      });
  });
  it("should handle errors thrown by removeAllOrders", async () => {
    const errorMessage = "Something went wrong";
    removeAllOrders.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .patch("/cancel-all-orders")
      .expect(500)
      .then(({ body }) => {
        expect(body.error).toBe("Internal Server Error");
        expect(body.details).toBe(errorMessage);
      });
  });
});

describe("GET /get-open-orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code, and an openOrdersData object", async () => {
    const mockOpenOrdersData = { orderOne: "123" };

    retrieveOpenOrders.mockResolvedValue(mockOpenOrdersData);

    return request(app)
      .get("/get-open-orders")
      .expect(200)
      .then(({ body }) => {
        expect(retrieveOpenOrders).toHaveBeenCalled();
        expect(body.openOrdersData).toEqual(mockOpenOrdersData);
      });
  });
  it("should handle errors thrown by retrieveOpenOrders", async () => {
    const errorMessage = "Something went wrong";

    retrieveOpenOrders.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .get("/get-open-orders")
      .expect(500)
      .then(({ body }) => {
        expect(body.error).toBe("Internal Server Error");
        expect(body.details).toBe(errorMessage);
      });
  });
});

describe("PATCH /edit-order", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should respond with a 200 status code and a updatedOrderData object", async () => {
    const input = { txid: "123", price: 50000 };

    const mockUpdatedOrderData = { orderOne: "123" };

    updateOrderById.mockResolvedValue(mockUpdatedOrderData);

    return request(app)
      .patch("/edit-order")
      .expect(200)
      .send(input)
      .then(({ body }) => {
        expect(updateOrderById).toHaveBeenCalledWith(input.txid, input.price);
        expect(body.updatedOrderData).toEqual(mockUpdatedOrderData);
      });
  });
  it("should handle errors thrown by updateOrderById", async () => {
    const input = { txid: "123", price: 50000 };

    const errorMessage = "Something went wrong";

    updateOrderById.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .patch("/edit-order")
      .expect(500)
      .send(input)
      .then(({ body }) => {
        expect(body.error).toBe("Internal Server Error");
        expect(body.details).toBe(errorMessage);
      });
  });
});

describe("GET /get-pnl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should respond with a 200 status code, a unrealisedPnl object and call retrievePnl", async () => {
    const mockUnrealisedPnl = 100;

    retrievePnl.mockResolvedValue(mockUnrealisedPnl);

    return request(app)
      .get("/get-pnl")
      .expect(200)
      .then(({ body }) => {
        expect(retrievePnl).toHaveBeenCalled();
        expect(body.unrealisedPnl).toBe(mockUnrealisedPnl);
      });
  });
  it("should handle errors thrown by retrievePnl", async () => {
    const errorMessage = "Something went wrong";

    retrievePnl.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .get("/get-pnl")
      .expect(500)
      .then(({ body }) => {
        expect(body.error).toBe("Internal Server Error");
        expect(body.details).toBe(errorMessage);
      });
  });
});

describe("POST /register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 201 status code", async () => {
    const input = { email: "test1@outlook.com", password: "TesT123!" };

    return request(app).post("/register").send(input).expect(201);
  });
  it("should call createUser with the correct arguments", () => {
    const input = { email: "test1@outlook.com", password: "TesT123!" };

    return request(app)
      .post("/register")
      .send(input)
      .expect(201)
      .then(() => {
        expect(createUser).toHaveBeenCalled();
        expect(createUser).toHaveBeenCalledWith(input.email, input.password);
      });
  });
  it("should when successful, respond with a signUpData object", () => {
    const input = { email: "test1@outlook.com", password: "TesT123!" };

    const mockSignUpData = {
      requestId: "test",
      userSub: "test",
      codeDestination: "test",
    };

    createUser.mockImplementationOnce(() => {
      return mockSignUpData;
    });

    return request(app)
      .post("/register")
      .send(input)
      .expect(201)
      .then(({ body }) => {
        expect(body.signUpData).toEqual(mockSignUpData);
      });
  });
  it("should respond with 400 status code, and appropriate message when password does not conform with policy", async () => {
    const authModel = require("../models/auth.model");
    const originalCreateUser = jest.requireActual(
      "../models/auth.model"
    ).createUser;

    jest.spyOn(authModel, "createUser").mockImplementation(originalCreateUser);

    const input = { email: "test1@outlook.com", password: "Test" };

    return request(app)
      .post("/register")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "Password did not conform with policy: Password not long enough"
        );
      });
  });
  it("should respond with 400 status code, and appropriate message when email is not in the correct format", async () => {
    const authModel = require("../models/auth.model");
    const originalCreateUser = jest.requireActual(
      "../models/auth.model"
    ).createUser;

    jest.spyOn(authModel, "createUser").mockImplementation(originalCreateUser);

    const input = { email: "test1outlook.com", password: "TesT123!" };

    return request(app)
      .post("/register")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid email address format.");
      });
  });
});

describe("POST /confirm-sign-up", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful return with a 200 status code", () => {
    const input = { email: "test@test.com", code: "123456" };

    return request(app).post("/confirm-sign-up").send(input).expect(200);
  });
  it("should call validateUser with the correct arguments", async () => {
    const input = { email: "test@test.com", code: "123456" };

    return request(app)
      .post("/confirm-sign-up")
      .send(input)
      .expect(200)
      .then(() => {
        expect(validateUser).toHaveBeenCalled();
        expect(validateUser).toHaveBeenCalledWith(input.email, input.code);
      });
  });
  it("should handle errors thrown by validateUser", async () => {
    const input = { email: "test@test.com", code: "123456" };
    const mockErrorMessage = { status: 400, msg: "mock error" };

    validateUser.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .post("/confirm-sign-up")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("POST /sign-in", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code", () => {
    return request(app).post("/sign-in").expect(200);
  });
  it("should call authenticateUser with the correct arguments", () => {
    const input = { email: "test@test.com", password: "password" };

    return request(app)
      .post("/sign-in")
      .send(input)
      .then(() => {
        expect(authenticateUser).toHaveBeenCalled();
        expect(authenticateUser).toHaveBeenCalledWith(
          input.email,
          input.password
        );
      });
  });
  it("should when successful respond with an authenticationResult", () => {
    const input = { email: "test@test.com", password: "password" };
    const mockResponse = "Sign in successful";

    authenticateUser.mockImplementationOnce(() => {
      return mockResponse;
    });

    return request(app)
      .post("/sign-in")
      .send(input)
      .then(({ body }) => {
        expect(body.authenticationResult).toBe(mockResponse);
      });
  });
  it("should handle errors thrown by authenticateUser", () => {
    const input = { email: "test@test.com", password: "password" };

    const mockErrorMessage = { status: 400, msg: "mock error" };

    authenticateUser.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .post("/sign-in")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("DELETE /delete-user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 202 status code", async () => {
    return request(app).delete("/delete-user").expect(202);
  });
  it("should call removeUser with the correct arguments", async () => {
    const accessToken = "token";

    return request(app)
      .delete("/delete-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(202)
      .then(() => {
        expect(removeUser).toHaveBeenCalled();
        expect(removeUser).toHaveBeenCalledWith(accessToken);
      });
  });
  it("should handle erros thrown by removeUser", () => {
    const accessToken = "token";

    const mockErrorMessage = { status: 400, msg: "mock error" };

    removeUser.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .delete("/delete-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});
