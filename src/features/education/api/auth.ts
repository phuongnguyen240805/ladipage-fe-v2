import { request } from "@/features/education/utils/request";

export async function authLogin(body: {
  username?: string;
  email?: string;
  password: string;
  remember?: boolean;
}) {
  return request.post('/api/education-auth/login', body);
}

export async function authMe() {
  return request.get('/api/education-auth/session');
}

export default request;
