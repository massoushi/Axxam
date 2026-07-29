import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "../lib/api";

const TOKEN_KEY = "axxam_token";
const USER_KEY = "axxam_user";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function setSession(token: string, user: AuthUser) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearSession() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

