import { TokenType } from '../enum/token_type';
export interface TokenResponse {
  access: {
    token: string;
    expires: Date;
  };
  refresh: {
    token: string;
    expires: Date;
  };
}

export interface TokenPayload {
  sub: string;
  role_id: string;
  type: TokenType;
  iat: number;
  exp: number;
}
