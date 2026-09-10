import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('rol')
export class RolController {
  constructor(private readonly rolesService: RoleService) {}
}
