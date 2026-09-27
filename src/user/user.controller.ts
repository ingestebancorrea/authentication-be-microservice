import { Controller, Get, Post, Body, Param, Delete, UseGuards, NotFoundException, Put, HttpCode } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUpdateUser } from './dto/createUpdateUser.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async index() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async show(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    if (user) return user;
    throw new NotFoundException('User not found');
  }

  @Post()
  @ApiCreatedResponse({ description: 'Created Succesfully' })
  @UseGuards(JwtAuthGuard)
  async store(@Body() data: CreateUserDto) {
    return await this.userService.store(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: number, @Body() data: CreateUpdateUser) {
    return await this.userService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async destroy(@Param('id') id: number) {
    await this.userService.destroy(id);
    return;
  }
}
