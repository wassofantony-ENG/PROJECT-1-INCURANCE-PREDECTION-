// import { jwtDecode } from "jwt-decode";
import { UserInfo } from "@/types/auth";

// export function getUserIdFromToken(): string {
//   const token = window.localStorage.getItem("authToken");
//   if (!token) throw new Error("Not authenticated");

//   const payload = jwtDecode<Record<string, unknown>>(token);
//   const id = payload.sub ?? payload.id ?? payload.user_id;
//   if (!id) throw new Error("Could not extract user ID from token");
// console.log(JSON.stringify(payload, null, 2));

//   return String(id);
// }

export async function getUserInfo(): Promise<UserInfo> {
  const token = window.localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Failed to fetch user info");
  }

  return res.json();
}
