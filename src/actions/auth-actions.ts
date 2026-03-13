"use server";

import { api } from "@/lib/api";
import type {
  AuthTokens,
  UserProfile,
  SignUpRequest,
  SignInRequest,
} from "@/lib/api";

export async function signInAction(
  data: SignInRequest
): Promise<AuthTokens> {
  return api.auth.signIn(data);
}

export async function signUpAction(
  data: SignUpRequest
): Promise<{ message: string }> {
  return api.auth.signUp(data);
}

export async function refreshTokenAction(
  refreshToken: string
): Promise<AuthTokens> {
  return api.auth.refreshToken(refreshToken);
}

export async function getMeAction(
  accessToken: string
): Promise<UserProfile> {
  return api.auth.meWithToken(accessToken);
}

export async function verifyEmailAction(
  token: string
): Promise<{ message: string }> {
  return api.auth.verifyEmail(token);
}

export async function resendVerificationAction(
  accessToken: string
): Promise<{ message: string }> {
  return api.auth.resendVerificationWithToken(accessToken);
}

export async function changePasswordAction(
  data: { currentPassword: string; newPassword: string },
  accessToken: string
): Promise<{ message: string }> {
  return api.auth.changePasswordWithToken(data, accessToken);
}

export async function uploadAvatarAction(
  formData: FormData,
  accessToken: string
): Promise<{ avatarUrl: string }> {
  return api.auth.uploadAvatarWithToken(formData, accessToken);
}

export async function deleteAvatarAction(
  accessToken: string
): Promise<void> {
  return api.auth.deleteAvatarWithToken(accessToken);
}
