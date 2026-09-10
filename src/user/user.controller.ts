import { Controller, Get, Post, Body, Param, Delete, UseGuards, NotFoundException, Put, HttpCode } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUpdateUser } from './dto/createUpdateUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  // @UseGuards(AuthGuard('jwt'))
  async index() {
    return this.userService.findAll();
  }

  @Get(':id')
  // @UseGuards(AuthGuard('jwt'))
  async show(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    if (user) return user;
    throw new NotFoundException('User not found');
  }

  @Post()
  @ApiCreatedResponse({ description: 'Created Succesfully' })
  // @UseGuards(AuthGuard('jwt'))
  async store(@Body() data: CreateUserDto) {
    return await this.userService.store(data);
  }

  @Put(':id')
  // @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: number, @Body() data: CreateUpdateUser) {
    return await this.userService.update(id, data);
  }

  @Delete(':id')
  // @UseGuards(AuthGuard('jwt'))
  @HttpCode(204)
  async destroy(@Param('id') id: number) {
    await this.userService.destroy(id);
    return;
  }
}
