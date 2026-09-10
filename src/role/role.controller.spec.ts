import { Test, TestingModule } from '@nestjs/testing';
import { RolController } from './role.controller';
import { RoleService } from './role.service';

describe('RolController', () => {
  let controller: RolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolController],
      providers: [RoleService],
    }).compile();

    controller = module.get<RolController>(RolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
