import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordResponse, LoginResponse, RegisterInput, RegisterResponse } from "@/types";
import { LoginInput } from "@/actions/login";
import { ForgotPasswordInput } from "@/actions/forgetPassword";
import { ResetPasswordInput } from "@/actions/resetPassword";

const registerUser = async (data: RegisterInput) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    // Extract the exact error message from the response
    const errorMessage = responseData.error || responseData.message || "Registration failed";
    throw new Error(errorMessage);
  }

  return responseData;
};

const loginUser = async (data: LoginInput) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    if (responseData.requiresVerification) {
      return responseData
      // throw new Error(responseData.error);
    }

    const errorMessage = responseData.error || responseData.message || "Login failed";
    // throw new Error(errorMessage);
    return responseData
  }

  return responseData;
};

const forgotPasswordRequest = async (data: ForgotPasswordInput) => {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage = responseData.error || responseData.message || "Failed to send reset email";
    throw new Error(errorMessage);
  }

  return responseData;
};

type ResetPasswordResponse = {
  success?: boolean;
  message?: string;
}

const resetPasswordRequest = async (data: ResetPasswordInput) => {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMessage = responseData.error || responseData.message || "Failed to reset password";
    return responseData
    // throw new Error(errorMessage);
  }

  return responseData;
};


export const useRegister = () => {
  return useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: registerUser,
    onError: (error) => {
      // Log the exact error for debugging
      console.error('Registration error:', error.message);
    },
  });
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: loginUser,
    onError: (error) => {
      console.error('Login error:', error.message);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, Error, ForgotPasswordInput>({
    mutationFn: forgotPasswordRequest,
    onError: (error) => {
      console.error('Forgot password error:', error.message);
    },
  });
};

export const useResetPassword = () => {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordInput>({
    mutationFn: resetPasswordRequest,
    onError: (error) => {
      console.error('Reset password error:', error.message);
    },
  });
};