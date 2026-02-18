import type { User } from "../types/user.type";

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const signUp = async (req: SignUpRequest): Promise<User> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/"}auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error('Failed to sign up');
    }

    return await response.json();
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}