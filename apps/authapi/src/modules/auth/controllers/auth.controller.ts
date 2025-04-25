import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { OAuthLoginDto, TokenResponseDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/token')
  async googleLogin(@Body() oauthLoginDto: OAuthLoginDto): Promise<TokenResponseDto> {
    return this.authService.googleLogin(oauthLoginDto);
  }

  @Post('github/token')
  async githubLogin(@Body() oauthLoginDto: OAuthLoginDto): Promise<TokenResponseDto> {
    return this.authService.githubLogin(oauthLoginDto);
  }
}