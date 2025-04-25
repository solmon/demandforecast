import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { OAuthLoginDto, TokenResponseDto, UserDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async googleLogin(oauthLoginDto: OAuthLoginDto): Promise<TokenResponseDto> {
    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code: oauthLoginDto.code,
        client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: oauthLoginDto.redirectUri || this.configService.get<string>('GOOGLE_CALLBACK_URL'),
        grant_type: 'authorization_code',
      });

      const { access_token, id_token, expires_in, refresh_token } = tokenResponse.data;

      // Get user info
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const userData = userInfoResponse.data;
      
      // Create user object
      const user: UserDto = {
        id: userData.sub,
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        displayName: userData.name,
        picture: userData.picture,
        provider: 'google',
        providerId: userData.sub,
      };

      // Generate JWT
      const jwtToken = this.generateJwt(user);

      return {
        accessToken: jwtToken,
        expiresIn: parseInt(this.configService.get<string>('JWT_EXPIRES_IN', '86400')), // Default to 1 day in seconds
        tokenType: 'Bearer',
        idToken: id_token,
        refreshToken: refresh_token,
        user,
      };
    } catch (error) {
      console.error('Google login error:', error.response?.data || error.message);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async githubLogin(oauthLoginDto: OAuthLoginDto): Promise<TokenResponseDto> {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.configService.get<string>('GITHUB_CLIENT_ID'),
        client_secret: this.configService.get<string>('GITHUB_CLIENT_SECRET'),
        code: oauthLoginDto.code,
        redirect_uri: oauthLoginDto.redirectUri || this.configService.get<string>('GITHUB_CALLBACK_URL'),
      }, {
        headers: { Accept: 'application/json' },
      });

      const { access_token } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${access_token}` },
      });

      const userData = userResponse.data;

      // Get email (GitHub may not provide email in the user endpoint)
      let email = userData.email;
      if (!email) {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `token ${access_token}` },
        });
        const primaryEmail = emailsResponse.data.find(e => e.primary) || emailsResponse.data[0];
        email = primaryEmail?.email;
      }

      // Create user object
      const user: UserDto = {
        id: userData.id.toString(),
        email,
        displayName: userData.name || userData.login,
        picture: userData.avatar_url,
        provider: 'github',
        providerId: userData.id.toString(),
      };

      // Generate JWT
      const jwtToken = this.generateJwt(user);

      return {
        accessToken: jwtToken,
        expiresIn: parseInt(this.configService.get<string>('JWT_EXPIRES_IN', '86400')), // Default to 1 day in seconds
        tokenType: 'Bearer',
        user,
      };
    } catch (error) {
      console.error('GitHub login error:', error.response?.data || error.message);
      throw new UnauthorizedException('Failed to authenticate with GitHub');
    }
  }

  private generateJwt(user: UserDto): string {
    const payload = {
      sub: user.id,
      email: user.email,
      provider: user.provider,
      providerId: user.providerId,
    };
    
    return this.jwtService.sign(payload);
  }
}