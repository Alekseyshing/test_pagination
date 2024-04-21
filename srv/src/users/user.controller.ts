/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Logger } from '@nestjs/common';
import { UserService } from './users.service';
import { UsersResponseDto } from './users.response.dto';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    this.logger.log(`Fetching users for page ${page} with ${limit} per page`);

    const [users, totalUsers] = await this.userService.findWithPagination(page, limit);

    const usersDto = users.map(user => UsersResponseDto.fromUsersEntity(user));

    return {
      users: usersDto,
      totalUsers: totalUsers,
    };
  }
}

