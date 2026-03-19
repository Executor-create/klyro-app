import type { User } from "../types/user.type";
import api from "../config/api";

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  userId: string;
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await api.post<SignUpResponse>("/auth/signup", data);

  if (response.status !== 201) {
    throw new Error("Failed to sign up");
  }

  return response.data;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);

  if (response.status !== 200) {
    throw new Error("Failed to log in");
  }

  return response.data;
}

export const verifyOtp = async (otp: string): Promise<{ success: boolean }> => {
  const response = await api.post("/auth/verify-otp", { otp });

  if (response.status !== 200) {
    throw new Error("Failed to verify OTP");
  }

  return response.data;
}