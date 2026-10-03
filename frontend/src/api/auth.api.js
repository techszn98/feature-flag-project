import { api } from "./client.js";

export async function register(credentials) {
  return (await api.post("/auth/register", credentials)).data;
}

export async function login(credentials) {
  return (await api.post("/auth/login", credentials)).data;
}

export async function verifyEmail(credentials) {
  return (await api.post("/auth/verify-email", credentials)).data;
}

export async function resendOtp(email) {
  const response = await api.post("/auth/resend-otp", { email });
  return response.message;
}

export async function loginWithGoogle(idToken) {
  return (await api.post("/auth/google", { idToken })).data;
}

export async function getCurrentUser() {
  return (await api.get("/auth/me")).data.user;
}

export async function logout(refreshToken) {
  return api.post("/auth/logout", { refreshToken });
}
