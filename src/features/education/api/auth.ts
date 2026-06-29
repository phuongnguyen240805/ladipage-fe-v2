import { request } from "@/features/education/utils/request";

export async function authLogin(body: {
  username?: string;
  email?: string;
  password: string;
}) {
  return request.post('/api/auth/login', body);
}

export async function authMe() {
  return request.get('/api/auth/me');
}

export default request;
