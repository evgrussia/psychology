import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AdminLoginUseCase } from '../../application/identity/use-cases/AdminLoginUseCase';
import { ClientLoginUseCase } from '../../application/identity/use-cases/ClientLoginUseCase';
import { ClientRegisterUseCase } from '../../application/identity/use-cases/ClientRegisterUseCase';
import { LogoutUseCase } from '../../application/identity/use-cases/LogoutUseCase';
import { GetCurrentUserUseCase } from '../../application/identity/use-cases/GetCurrentUserUseCase';
import { AdminLoginDto, ClientLoginDto, ClientRegisterDto } from '../../application/identity/dto/login.dto';
import { AuthGuard } from '../guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly adminLoginUseCase: AdminLoginUseCase,
    private readonly clientLoginUseCase: ClientLoginUseCase,
    private readonly clientRegisterUseCase: ClientRegisterUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Post('admin/login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminLoginUseCase.execute({
      ...dto,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return result.user;
  }

  @Post('client/login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Client login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async clientLogin(
    @Body() dto: ClientLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.clientLoginUseCase.execute({
      ...dto,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return result.user;
  }

  @Post('client/register')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Client registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async clientRegister(
    @Body() dto: ClientRegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.clientRegisterUseCase.execute({
      ...dto,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return result.user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout' })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.logoutUseCase.execute(req.session.id);
    res.clearCookie('sessionId');
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current user' })
  async me(@Req() req: any) {
    return req.user;
  }
}
