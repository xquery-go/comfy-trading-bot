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
const {
  signUp,
  confirmSignUp,
  signIn,
  deleteUser,
  changePassword,
  resendConfirmationCode,
  sendForgotPasswordCode,
  resetPassword,
  signOut,
} = require("../utils/cognito");
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
    // const mockErrorMessage = "Something went wrong";
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    confirmSignUp.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(validateUser(...input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("authenticateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call signIn with the correct arguments", async () => {
    const input = ["test@test.com", "password"];

    await authenticateUser(...input);

    expect(signIn).toHaveBeenCalled();
    expect(signIn).toHaveBeenCalledWith(...input);
  });
  it("should when successful return the ouput of signIn", async () => {
    const input = ["test@test.com", "password"];
    const mockResponse = "Sign in successful";

    signIn.mockImplementationOnce(() => {
      return mockResponse;
    });

    const actual = await authenticateUser(...input);

    expect(actual).toBe(mockResponse);
  });
  it("should handle errors thrown by signIn", async () => {
    const input = ["test@test.com", "password"];
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    signIn.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(authenticateUser(...input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("removeUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call deleteUser with the correct arugment", async () => {
    const input = "token";

    await removeUser(input);
    expect(deleteUser).toHaveBeenCalled();
    expect(deleteUser).toHaveBeenCalledWith(input);
  });
  it("should handle errors thrown by deleteUser", async () => {
    const input = "token";
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    deleteUser.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(removeUser(input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("changeUserPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call changePassword with the correct arguments", async () => {
    const input = ["token", "password", "newPassword"];

    await changeUserPassword(...input);

    expect(changePassword).toHaveBeenCalled();
    expect(changePassword).toHaveBeenCalledWith(...input);
  });
  it("should when successful return the output of changePassword", async () => {
    const input = ["token", "password", "newPassword"];
    const mockResponse = "Password change successful.";

    changePassword.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    const actual = await changeUserPassword(...input);

    expect(actual).toBe(mockResponse);
  });
  it("should handle errors thrown by changePassword", async () => {
    const input = ["token", "password", "newPassword"];
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    changePassword.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(changeUserPassword(...input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("triggerConfirmationCodeResend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call resendConfirmationCode with the correct argument", async () => {
    const input = "test@test.com";

    await triggerConfirmationCodeResend(input);

    expect(resendConfirmationCode).toHaveBeenCalled();
    expect(resendConfirmationCode).toHaveBeenCalledWith(input);
  });
  it("should when successful return the output of resendConfirmationCode", async () => {
    const input = "test@test.com";
    const mockResponse = "Success.";

    resendConfirmationCode.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    const actual = await triggerConfirmationCodeResend(input);

    expect(actual).toBe(mockResponse);
  });
  it("should handle errors thrown by resendConfirmationCode", async () => {
    const input = "test@test.com";
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    resendConfirmationCode.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(triggerConfirmationCodeResend(input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("resetUserPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call sendForgotPasswordCode with the correct argument", async () => {
    const input = "test@test.com";

    await resetUserPassword(input);

    expect(sendForgotPasswordCode).toHaveBeenCalled();
    expect(sendForgotPasswordCode).toHaveBeenCalledWith(input);
  });
  it("should return the output of sendForgotPasswordCode", async () => {
    const input = "test@test.com";
    const mockResponse = "Success.";

    sendForgotPasswordCode.mockImplementationOnce(() => {
      return Promise.resolve(mockResponse);
    });

    const actual = await resetUserPassword(input);

    expect(actual).toBe(mockResponse);
  });
  it("should handle errors thrown by sendForgotPasswordCode", async () => {
    const input = "test@test.com";
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    sendForgotPasswordCode.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(resetUserPassword(input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("confirmResetUserPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call resetPassword with the correct arguments", async () => {
    const input = ["test@test.com", "password", "12345"];

    await confirmResetUserPassword(...input);

    expect(resetPassword).toHaveBeenCalled();
    expect(resetPassword).toHaveBeenCalledWith(...input);
  });
  it("should when successful return a confirmation message", async () => {
    const input = ["test@test.com", "password", "12345"];
    const mockResponse = "Password reset successful.";

    const actual = await confirmResetUserPassword(...input);

    expect(actual).toBe(mockResponse);
  });
  it("should handle errors thrown by resetPassword", async () => {
    const input = ["test@test.com", "password", "12345"];
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    resetPassword.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(confirmResetUserPassword(...input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});

describe("signOutUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call signOut with the correct argument", async () => {
    const input = "token";

    await signOutUser(input);

    expect(signOut).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledWith(input);
  });
  it("should when successful return a confirmation message", async () => {
    const input = "token";
    const expected = "Sign out successful.";

    const actual = await signOutUser(input);

    expect(actual).toBe(expected);
  });
  it("should handle errors thrown by signOut", async () => {
    const input = "token";
    const mockErrorMessage = {
      $metadata: {
        httpStatusCode: 400,
      },
      message: "Something went wrong",
    };

    signOut.mockImplementationOnce(() => {
      return Promise.reject(mockErrorMessage);
    });

    await expect(signOutUser(input)).rejects.toEqual({
      status: 400,
      msg: "Something went wrong",
    });
  });
});
