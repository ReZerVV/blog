// Common
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
// Services
import { UsersService } from './services/users.service';
// Controllers
import { UsersController } from './controllers/users.controller';
import { ProfileController } from './controllers/profile.controller';

@Module({
    imports: [PrismaModule],
    providers: [UsersService, PrismaService],
    controllers: [UsersController, ProfileController],
    exports: [UsersService],
})
export class UsersModule {}
