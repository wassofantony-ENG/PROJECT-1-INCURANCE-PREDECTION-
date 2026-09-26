export type LoginForm = {
    email: string;
    password: string;
};

export type TokenBody = {
    access_token: string;
    token_type: string;
}

export type RegisterForm = {
    username: string;
    email: string;
    password: string;
}

export type UserInfo = {
  id?: string;
  username: string;
  email: string;
  avatar_url?: string;
}
