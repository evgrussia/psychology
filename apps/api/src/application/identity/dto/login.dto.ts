export class AdminLoginDto {
  email!: string;
  password!: string;
  userAgent?: string;
  ipAddress?: string;
}

export class ClientLoginDto {
  email!: string;
  password!: string;
  userAgent?: string;
  ipAddress?: string;
}

export class LoginResponseDto {
  sessionId!: string;
  user!: {
    id: string;
    email: string | null;
    displayName: string | null;
    roles: string[];
  };
}
