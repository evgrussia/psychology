export class CreateAdminInviteDto {
  email!: string;
  roleCode!: string;
}

export class AdminInviteResponseDto {
  id!: string;
  email!: string;
  roleCode!: string;
  token!: string;
  expiresAt!: Date;
}
