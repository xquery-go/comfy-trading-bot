const request = require("supertest");
const app = require("../app");
const testData = require("../db/test-data/apiKeys");
const db = require("../db/connection");
const jwt = require("jsonwebtoken");
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
  changeUserPassword,
  triggerConfirmationCodeResend,
  resetUserPassword,
  confirmResetUserPassword,
  signOutUser,
} = require("../models/auth.model");
const { seed } = require("../db/seeds/seed");

beforeEach(async () => {
  await seed(testData);
});

afterAll(async () => {
  await db.end();
});

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
  it("should respond with a 201 status code and an array of user order data objects", async () => {
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
        expect(Array.isArray(body.results)).toBe(true);
        expect(body.results[0]).toMatchObject({
          user: expect.any(String),
          orderData: expect.any(Object),
        });
        expect(body.results[0].orderData).toEqual(mockOrderData);
        expect(createOrder).toHaveBeenCalled();
        expect(createOrder).toHaveBeenCalledWith(
          mockOrderDetails.action,
          0.001,
          mockOrderDetails.ticker,
          mockOrderDetails.price,
          mockOrderDetails.stopLoss,
          mockOrderDetails.validate,
          expect.any(String),
          expect.any(String)
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
        expect(body.results[0]).toMatchObject({
          user: expect.any(String),
          takeProfitOrderData: expect.any(Object),
        });
        expect(body.results[0].takeProfitOrderData).toEqual(
          mockTakeProftOrderData
        );
        expect(createTakeProfitOrder).toHaveBeenCalled();
        expect(createTakeProfitOrder).toHaveBeenCalledWith(
          mockOrderDetails.action,
          0.001,
          mockOrderDetails.takeProfit,
          mockOrderDetails.validate,
          expect.any(String),
          expect.any(String)
        );
      });
  });
  // it("should call the trackPositionStatus function, with the txid of the placed order", async () => {
  //   const mockOrderDetails = {
  //     ticker: "BTCUSDT",
  //     action: "buy",
  //     price: 64513.9,
  //     quantity: 0.1956,
  //     takeProfit: 64616.1,
  //     stopLoss: 64462.8,
  //   };

  //   const mockOrderData = { txid: ["order123"] };

  //   createOrder.mockResolvedValue(mockOrderData);

  //   return request(app)
  //     .post("/create-order")
  //     .expect(201)
  //     .send(mockOrderDetails)
  //     .then(({ body }) => {
  //       expect(trackPositionStatus).toHaveBeenCalled();
  //       expect(trackPositionStatus).toHaveBeenCalledWith(mockOrderData.txid[0]);
  //     });
  // });
});

describe("GET /get-balance", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should respond with 200 status code, and a balance data object", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const mockBalanceData = { BTC: 1 };

    retrieveBalance.mockResolvedValue(mockBalanceData);

    return request(app)
      .get("/get-balance")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(retrieveBalance).toHaveBeenCalled();
        expect(body.balanceData).toEqual(mockBalanceData);
      });
  });
  it("should handle errors thrown by retrieveBalance", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const errorMessage = "Something went wrong";

    retrieveBalance.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .get("/get-balance")
      .set("Authorization", `Bearer ${accessToken}`)
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
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const mockRemovalData = { removeCount: 1 };

    removeOrderById.mockResolvedValue(mockRemovalData);

    return request(app)
      .patch("/cancel-order")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(removeOrderById).toHaveBeenCalled();
        expect(body.removalData).toEqual(mockRemovalData);
      });
  });
  it("should call removeOrderById with the correct parameters", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const input = {
      txid: "order123",
    };

    return request(app)
      .patch("/cancel-order")
      .expect(200)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .then(({ body }) => {
        expect(removeOrderById).toHaveBeenCalledWith(
          input.txid,
          expect.any(String),
          expect.any(String)
        );
      });
  });
  it("should handle errors thrown by removeOrderById", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const input = {
      txid: "order123",
    };

    const errorMessage = "Something went wrong";

    removeOrderById.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .patch("/cancel-order")
      .set("Authorization", `Bearer ${accessToken}`)
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
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const mockRemovalData = { removeCount: 2 };

    removeAllOrders.mockResolvedValue(mockRemovalData);

    return request(app)
      .patch("/cancel-all-orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(removeAllOrders).toHaveBeenCalled();
        expect(body.removalData).toEqual(mockRemovalData);
      });
  });
  it("should handle errors thrown by removeAllOrders", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const errorMessage = "Something went wrong";

    removeAllOrders.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .patch("/cancel-all-orders")
      .set("Authorization", `Bearer ${accessToken}`)
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
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const mockOpenOrdersData = { orderOne: "123" };

    retrieveOpenOrders.mockResolvedValue(mockOpenOrdersData);

    return request(app)
      .get("/get-open-orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(retrieveOpenOrders).toHaveBeenCalled();
        expect(body.openOrdersData).toEqual(mockOpenOrdersData);
      });
  });
  it("should handle errors thrown by retrieveOpenOrders", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const errorMessage = "Something went wrong";

    retrieveOpenOrders.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .get("/get-open-orders")
      .expect(500)
      .set("Authorization", `Bearer ${accessToken}`)
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
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const input = { txid: "123", price: 50000 };

    const mockUpdatedOrderData = { orderOne: "123" };

    updateOrderById.mockResolvedValue(mockUpdatedOrderData);

    return request(app)
      .patch("/edit-order")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .send(input)
      .then(({ body }) => {
        expect(updateOrderById).toHaveBeenCalledWith(
          input.txid,
          input.price,
          expect.any(String),
          expect.any(String)
        );
        expect(body.updatedOrderData).toEqual(mockUpdatedOrderData);
      });
  });
  it("should handle errors thrown by updateOrderById", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const input = { txid: "123", price: 50000 };

    const errorMessage = "Something went wrong";

    updateOrderById.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .patch("/edit-order")
      .set("Authorization", `Bearer ${accessToken}`)
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
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );
    const mockUnrealisedPnl = 100;

    retrievePnl.mockResolvedValue(mockUnrealisedPnl);

    return request(app)
      .get("/get-pnl")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(retrievePnl).toHaveBeenCalled();
        expect(body.unrealisedPnl).toBe(mockUnrealisedPnl);
      });
  });
  it("should handle errors thrown by retrievePnl", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    const errorMessage = "Something went wrong";

    retrievePnl.mockImplementationOnce(() => {
      return Promise.reject(new Error(errorMessage));
    });

    return request(app)
      .get("/get-pnl")
      .set("Authorization", `Bearer ${accessToken}`)
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
  it("should handle errors thrown by removeUser", () => {
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

describe("PATCH /change-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code", async () => {
    return request(app).patch("/change-password").expect(200);
  });
  it("should call changeUserPassword with the correct arguments", async () => {
    const input = {
      previousPassword: "password",
      proposedPassword: "newPassword",
    };
    const accessToken = "token";

    return request(app)
      .patch("/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .expect(200)
      .then(() => {
        expect(changeUserPassword).toHaveBeenCalled();
        expect(changeUserPassword).toHaveBeenCalledWith(
          accessToken,
          input.previousPassword,
          input.proposedPassword
        );
      });
  });
  it("should when successful respond with a confirmationData object", async () => {
    const input = {
      previousPassword: "password",
      proposedPassword: "newPassword",
    };
    const accessToken = "token";
    const mockResponse = "Password change successful.";

    changeUserPassword.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    return request(app)
      .patch("/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.confirmationData).toBe(mockResponse);
      });
  });
  it("should handle errors thrown by changeUserPassword", async () => {
    const input = {
      previousPassword: "password",
      proposedPassword: "newPassword",
    };
    const accessToken = "token";
    const mockErrorMessage = { status: 400, msg: "mock error" };

    changeUserPassword.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .patch("/change-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("POST /resend-confirmation-code", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code", async () => {
    const input = {
      email: "test@test.com",
    };

    return request(app)
      .post("/resend-confirmation-code")
      .send(input)
      .expect(200);
  });
  it("should call triggerConfirmationCodeResend with eh correct argument", async () => {
    const input = {
      email: "test@test.com",
    };

    return request(app)
      .post("/resend-confirmation-code")
      .send(input)
      .expect(200)
      .then(() => {
        expect(triggerConfirmationCodeResend).toHaveBeenCalled();
        expect(triggerConfirmationCodeResend).toHaveBeenCalledWith(input.email);
      });
  });
  it("should when successful respond with a codeDeliveryData object", async () => {
    const input = {
      email: "test@test.com",
    };
    const mockResponse = "Success.";

    triggerConfirmationCodeResend.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    return request(app)
      .post("/resend-confirmation-code")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.codeDeliveryData).toBe(mockResponse);
      });
  });
  it("should handle errors thrown by triggerConfirmationCodeResend", async () => {
    const input = {
      email: "test@test.com",
    };
    const mockErrorMessage = { status: 400, msg: "mock error" };

    triggerConfirmationCodeResend.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .post("/resend-confirmation-code")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("POST /forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code", async () => {
    const input = {
      email: "test@test.com",
    };

    return request(app).post("/forgot-password").expect(200).send(input);
  });
  it("should call resetUserPassword with the correct argument", async () => {
    const input = {
      email: "test@test.com",
    };

    return request(app)
      .post("/forgot-password")
      .expect(200)
      .send(input)
      .then(() => {
        expect(resetUserPassword).toHaveBeenCalled();
        expect(resetUserPassword).toHaveBeenCalledWith(input.email);
      });
  });
  it("should when successful respond with a codeDeliveryData object", async () => {
    const input = {
      email: "test@test.com",
    };
    const mockResponse = "Success.";

    resetUserPassword.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    return request(app)
      .post("/forgot-password")
      .expect(200)
      .send(input)
      .then(({ body }) => {
        expect(body.codeDeliveryData).toBe(mockResponse);
      });
  });
  it("should handle errors thrown by resetUserPassword", async () => {
    const input = {
      email: "test@test.com",
    };
    const mockErrorMessage = { status: 400, msg: "mock error" };

    resetUserPassword.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .post("/forgot-password")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("POST /confirm-forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code", async () => {
    const input = {
      email: "test@test.com",
      password: "password",
      code: "code",
    };

    return request(app).post("/confirm-forgot-password").expect(200);
  });
  it("should call confirmResetUserPassword", async () => {
    const input = {
      email: "test@test.com",
      password: "password",
      code: "code",
    };

    return request(app)
      .post("/confirm-forgot-password")
      .send(input)
      .expect(200)
      .then(() => {
        expect(confirmResetUserPassword).toHaveBeenCalled();
        expect(confirmResetUserPassword).toHaveBeenCalledWith(
          input.email,
          input.password,
          input.code
        );
      });
  });
  it("should when successful respond with a confirmationMessage", async () => {
    const input = {
      email: "test@test.com",
      password: "password",
      code: "code",
    };
    const mockResponse = "Success.";

    confirmResetUserPassword.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    return request(app)
      .post("/confirm-forgot-password")
      .send(input)
      .expect(200)
      .then(({ body }) => {
        expect(body.confirmationMessage).toBe(mockResponse);
      });
  });
  it("should handle errors thrown by confirmResetUserPassword", async () => {
    const input = {
      email: "test@test.com",
      password: "password",
      code: "code",
    };
    const mockErrorMessage = { status: 400, msg: "mock error" };

    confirmResetUserPassword.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .post("/confirm-forgot-password")
      .send(input)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("POST /sign-out", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should when successful respond with a 200 status code", async () => {
    const accessToken = "token";

    return request(app)
      .post("/sign-out")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });
  it("should call signOutUser with the correct argument", async () => {
    const accessToken = "token";

    return request(app)
      .post("/sign-out")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(() => {
        expect(signOutUser).toHaveBeenCalled();
        expect(signOutUser).toHaveBeenCalledWith(accessToken);
      });
  });
  it("should when successful respond with a confirmation message", async () => {
    const accessToken = "token";
    const mockResponse = "success";

    signOutUser.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    return request(app)
      .post("/sign-out")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.confirmationMessage).toBe(mockResponse);
      });
  });
  it("should handle errors thrown by signOutUser", async () => {
    const accessToken = "token";
    const mockErrorMessage = { status: 400, msg: "mock error" };

    signOutUser.mockImplementationOnce(() => {
      throw mockErrorMessage;
    });

    return request(app)
      .post("/sign-out")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage.msg);
      });
  });
});

describe("GET /api-keys/:username", () => {
  it("should when successful respond with a 200 status code", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    return request(app)
      .get("/api-keys/john_doe")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });
  it("should when successful respond with an apiKeysData object", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    return request(app)
      .get("/api-keys/john_doe")
      .expect(200)
      .set("Authorization", `Bearer ${accessToken}`)
      .then(({ body }) => {
        expect(body.apiKeysData).toMatchObject({
          username: "john_doe",
          apiKey: expect.any(String),
          privateKey: expect.any(String),
        });
      });
  });
  it("should respond with a 401 status code and unauthorized when token username and params dont match", async () => {
    const accessToken = jwt.sign(
      {
        username: "james_bond",
      },
      "secret"
    );
    const mockErrorMessage = "Unauthorized access.";

    return request(app)
      .get("/api-keys/john_doe")
      .expect(401)
      .set("Authorization", `Bearer ${accessToken}`)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage);
      });
  });
  it("should respond with status code 404 and Not found if the user does not exist in database", async () => {
    const accessToken = jwt.sign(
      {
        username: "james_bond",
      },
      "secret"
    );
    const mockErrorMessage = "Not found.";

    return request(app)
      .get("/api-keys/james_bond")
      .expect(404)
      .set("Authorization", `Bearer ${accessToken}`)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage);
      });
  });
});

describe("POST /api-keys/:username", () => {
  it("should when successful respond with a 201 status code, and an object of the newly added entry", async () => {
    const accessToken = jwt.sign(
      {
        username: "test_user",
      },
      "secret"
    );
    const input = {
      username: "test_user",
      email: "test@test.com",
      apiKey: "test_api_key",
      privateKey: "test_private_key",
    };

    return request(app)
      .post("/api-keys/test_user")
      .expect(201)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .then(({ body }) => {
        expect(body.apiKeysData).toEqual({
          username: "test_user",
          email: "test@test.com",
          api_key: "test_api_key",
          private_key: "test_private_key",
        });
      });
  });
  it("should respond with a 401 status code and unauthorized when token username and params dont match", async () => {
    const accessToken = jwt.sign(
      {
        username: "james_bond",
      },
      "secret"
    );
    const input = {
      username: "test_user",
      email: "test@test.com",
      apiKey: "test_api_key",
      privateKey: "test_private_key",
    };
    const mockErrorMessage = "Unauthorized access.";

    return request(app)
      .post("/api-keys/test_user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage);
      });
  });
  it("should respond with 400 and Bad request, if the user entry already exists", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );
    const input = {
      username: "john_doe",
      email: "john.doe@example.com",
      apiKey: "123abc456def",
      privateKey: "private_key_john_doe",
    };

    return request(app)
      .post("/api-keys/john_doe")
      .expect(400)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request: Already Exists");
      });
  });
  it("should respond with 400 and Bad request if missing required field", async () => {
    const accessToken = jwt.sign(
      {
        username: "test_user",
      },
      "secret"
    );
    const input = {
      username: "test_user",
      email: "test@test.com",
      privateKey: "private_key_john_doe",
    };

    return request(app)
      .post("/api-keys/test_user")
      .expect(400)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .then(({ body }) => {
        expect(body.message).toBe("Bad Request: Missing Required Field");
      });
  });
});

describe("PATCH /api-keys/:username", () => {
  it("should when successful respond with a 200 status code, and an object containing the updated entry", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );
    const input = {
      apiKey: "new_key",
      privateKey: "new_private_key_john_doe",
    };

    const expected = {
      username: "john_doe",
      email: "john.doe@example.com",
      api_key: "new_key",
      private_key: "new_private_key_john_doe",
    };
    return request(app)
      .patch("/api-keys/john_doe")
      .expect(200)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .then(({ body }) => {
        expect(body.updatedData).toEqual(expected);
      });
  });
  it("should respond with a 401 status code and unauthorized when token username and params dont match", async () => {
    const accessToken = jwt.sign(
      {
        username: "james_bond",
      },
      "secret"
    );
    const input = {
      apiKey: "test_api_key",
      privateKey: "test_private_key",
    };
    const mockErrorMessage = "Unauthorized access.";

    return request(app)
      .patch("/api-keys/john_doe")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage);
      });
  });
  it("should respond with 400 and Missing required field, when not given either api key ir private key", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );
    const input = {
      privateKey: "new_private_key_john_doe",
    };

    return request(app)
      .patch("/api-keys/john_doe")
      .expect(400)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(input)
      .then(({ body }) => {
        expect(body.message).toBe("Missing required field.");
      });
  });
});

describe("DELETE /api-keys/:username", () => {
  it("should when successful respond with a 204 status code, and have deleted the selected database entry", async () => {
    const accessToken = jwt.sign(
      {
        username: "john_doe",
      },
      "secret"
    );

    return request(app)
      .delete("/api-keys/john_doe")
      .expect(204)
      .set("Authorization", `Bearer ${accessToken}`)
      .then(async () => {
        const entry = await db.query(
          `SELECT * FROM api_keys WHERE username = 'john_doe'`
        );

        expect(entry.rows.length).toBe(0);
      });
  });
  it("should respond with a 401 status code and unauthorized when token username and params dont match", async () => {
    const accessToken = jwt.sign(
      {
        username: "james_bond",
      },
      "secret"
    );
    const mockErrorMessage = "Unauthorized access.";

    return request(app)
      .delete("/api-keys/john_doe")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage);
      });
  });
  it("should respond with status code 404 and Not found, if the username does not exist in the database", async () => {
    const accessToken = jwt.sign(
      {
        username: "james_bond",
      },
      "secret"
    );
    const mockErrorMessage = "Not found.";

    return request(app)
      .delete("/api-keys/james_bond")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe(mockErrorMessage);
      });
  });
});
