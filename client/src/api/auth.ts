import { api } from './client.js';
import type { LoginUser, PublicUser } from '@elitequest/shared';

export type AuthResult = {
  user: PublicUser;
};

export function loginUser(credentials: LoginUser): Promise<AuthResult> {
  return api.post<AuthResult>('/auth/login', credentials);
}

export function logoutUser(): Promise<void> {
  return api.post('/auth/logout', {});
}

export function getCurrentUser(): Promise<PublicUser | null> {
  return api.get<PublicUser | null>('/auth/me').catch(() => null);
}
