import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RolController } from './role.controller';

@Module({
  controllers: [RolController],
  providers: [RoleService]
})
export class RolesModule {}
