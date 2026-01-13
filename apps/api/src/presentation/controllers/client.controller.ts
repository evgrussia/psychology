import { Controller, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@ApiTags('client')
@Controller('lk')
@UseGuards(AuthGuard, RolesGuard)
export class ClientController {
  @Get('profile')
  @Roles('client', 'owner') // Owner can also see their profile if they have client role or for testing
  @ApiOperation({ summary: 'Get client profile' })
  @ApiResponse({ status: 200, description: 'Return client profile' })
  async getProfile() {
    return {
      message: 'Client profile data',
    };
  }

  @Get('dashboard')
  @Roles('client')
  @ApiOperation({ summary: 'Get client dashboard' })
  async getDashboard() {
    return {
      upcomingAppointments: [],
      recentDiaryEntries: [],
    };
  }
}
