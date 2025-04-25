export class OAuthLoginDto {
  code: string;
  redirectUri?: string;
}

export class TokenResponseDto {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  refreshToken?: string;
  idToken?: string;
  user: UserDto;
}

export class UserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  picture?: string;
  provider: string;
  providerId: string;
}