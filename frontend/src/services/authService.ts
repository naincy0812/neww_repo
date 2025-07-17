const API_BASE = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/auth`;

export async function logout(): Promise<void> {
  // Hit backend to clear auth cookie
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
}
