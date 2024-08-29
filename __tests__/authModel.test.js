const { createUser, validateUser } = require("../models/auth.model");
const { signUp, confirmSignUp } = require("../utils/cognito");
jest.mock("../utils/cognito");

const mockResponse = {
  $metadata: {
    httpStatusCode: 200,
    requestId: "b1dcf983-eba8-4dd8-9b16-0578ce82d6a6",
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0,
  },
  CodeDeliveryDetails: {
    AttributeName: "email",
    DeliveryMedium: "EMAIL",
    Destination: "t***@o***",
  },
  UserConfirmed: false,
  UserSub: "24d804c8-f0b1-7044-53ab-63bacaef1ff9",
};

describe("createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call signUp with the correct arguments", async () => {
    const input = ["test@test.com", "password"];

    signUp.mockImplementationOnce(() => {
      return mockResponse;
    });

    await createUser(...input);

    expect(signUp).toHaveBeenCalled();
    expect(signUp).toHaveBeenCalledWith(...input);
  });
  it("should return the response from signUp", async () => {
    const input = ["test@test.com", "password"];

    signUp.mockImplementationOnce(() => {
      return mockResponse;
    });

    const actual = await createUser(...input);

    expect(actual).toMatchObject({
      requestId: expect.any(String),
      userSub: expect.any(String),
      codeDestination: expect.any(String),
    });
  });
});

describe("validateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call confirmSignUp with the correct arguments", async () => {
    const input = ["test@test.com", "123456"];

    await validateUser(...input);

    expect(confirmSignUp).toHaveBeenCalled();
    expect(confirmSignUp).toHaveBeenCalledWith(...input);
  });
  it("should when successful return true", async () => {
    const input = ["test@test.com", "123456"];

    const actual = await validateUser(...input);

    expect(actual).toBe(true);
  });
  it("should handle errors thrown by confirmSignUp", async () => {
    const input = ["test@test.com", "123456"];
    const mockErrorMessage = "Something went wrong";

    confirmSignUp.mockImplementationOnce(() => {
      return Promise.reject(new Error(mockErrorMessage));
    });

    await expect(validateUser(...input)).rejects.toThrow(mockErrorMessage);
  });
});
