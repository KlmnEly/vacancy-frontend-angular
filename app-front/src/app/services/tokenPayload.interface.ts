export interface MyTokenPayload {
  email: string;
  sub: number;
  role: string;
  iat: number;
  exp: number;
}