import { Module, Global, forwardRef } from '@nestjs/common';
import { BcryptHasher } from '../../infrastructure/auth/bcrypt-hasher';
import { PrismaUserRepository } from '../../infrastructure/persistence/prisma/identity/prisma-user.repository';
import { PrismaSessionRepository } from '../../infrastructure/persistence/prisma/identity/prisma-session.repository';
import { PrismaAdminInviteRepository } from '../../infrastructure/persistence/prisma/identity/prisma-admin-invite.repository';
import { AdminLoginUseCase } from '../../application/identity/use-cases/AdminLoginUseCase';
import { ClientLoginUseCase } from '../../application/identity/use-cases/ClientLoginUseCase';
import { CreateAdminUserInviteUseCase } from '../../application/identity/use-cases/CreateAdminUserInviteUseCase';
import { LogoutUseCase } from '../../application/identity/use-cases/LogoutUseCase';
import { GetCurrentUserUseCase } from '../../application/identity/use-cases/GetCurrentUserUseCase';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { AuthGuard } from '../../presentation/guards/auth.guard';
import { RolesGuard } from '../../presentation/guards/roles.guard';
import { AuditModule } from '../audit/audit.module';

@Global()
@Module({
  imports: [forwardRef(() => AuditModule)],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },
    {
      provide: 'IAdminInviteRepository',
      useClass: PrismaAdminInviteRepository,
    },
    {
      provide: 'IPasswordHasher',
      useClass: BcryptHasher,
    },
    // We also provide them as classes for injection in Use Cases if they don't use string tokens
    // But since I used interfaces in constructors, I should use tokens or just inject classes
    PrismaUserRepository,
    PrismaSessionRepository,
    PrismaAdminInviteRepository,
    BcryptHasher,
    AdminLoginUseCase,
    ClientLoginUseCase,
    CreateAdminUserInviteUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    AuthGuard,
    RolesGuard,
    // Provide aliases for interfaces
    { provide: 'IUserRepository', useExisting: PrismaUserRepository },
    { provide: 'ISessionRepository', useExisting: PrismaSessionRepository },
    { provide: 'IAdminInviteRepository', useExisting: PrismaAdminInviteRepository },
    { provide: 'IPasswordHasher', useExisting: BcryptHasher },
  ],
  exports: [
    AdminLoginUseCase,
    ClientLoginUseCase,
    CreateAdminUserInviteUseCase,
    LogoutUseCase,
    GetCurrentUserUseCase,
    AuthGuard,
    RolesGuard,
    'IUserRepository',
    'ISessionRepository',
    'IAdminInviteRepository',
    'IPasswordHasher',
  ],
})
export class IdentityModule {}
