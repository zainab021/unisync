const API = "http://localhost:5000/api";

export type UserRole = "student" | "teacher" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string;
  profileId: string;
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser; profile: AuthUser }> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Login failed");

  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.user.role);
  localStorage.setItem("profileId", String(data.user.id));
  localStorage.setItem("userName", data.user.name);

  const user: AuthUser = {
    id: String(data.user.id),
    email: data.user.email,
    name: data.user.name,
    role: data.user.role as UserRole,
    avatar: data.user.avatar ?? data.user.name.slice(0, 2).toUpperCase(),
    profileId: String(data.user.id),
  };
  return { user, profile: user };
}

export function signOut() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("profileId");
  localStorage.removeItem("userName");
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: String(data.id),
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      avatar: data.avatar ?? data.name.slice(0, 2).toUpperCase(),
      profileId: String(data.id),
    };
  } catch {
    return null;
  }
}

export function getSession() {
  const token = getToken();
  return token ? { token } : null;
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  getCurrentUser().then(callback);
  return { data: { subscription: { unsubscribe: () => {} } } };
}

export async function getProfile(userId: string): Promise<AuthUser | null> {
  return getCurrentUser();
}
