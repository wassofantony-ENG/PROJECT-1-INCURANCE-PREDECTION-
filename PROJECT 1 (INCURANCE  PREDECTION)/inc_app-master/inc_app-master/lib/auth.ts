import { LoginForm , TokenBody} from "@/types/auth"
import { RegisterForm } from "@/types/auth";

async function getErrorMessage(res: Response) {
  try {
    const body = await res.json();
    return body.detail ?? body.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function logIn(form: LoginForm): Promise<TokenBody> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email, password: form.password }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  const data: TokenBody = await res.json();
  window.localStorage.setItem("authToken", data.access_token);
  return data;
}

export async function register(form: RegisterForm): Promise<TokenBody> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: form.username,
      email: form.email,
      password: form.password,
    }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res));
  }
  const data: TokenBody = await res.json();
  window.localStorage.setItem("authToken", data.access_token);
  return data;
}