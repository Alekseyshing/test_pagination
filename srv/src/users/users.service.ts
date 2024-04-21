import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UsersEntity)
    private usersRepo: Repository<UsersEntity>,
  ) {}

  // Получение списка пользователей с учетом пагинации
  async findWithPagination(page: number, limit: number): Promise<[UsersEntity[], number]> {
    const offset = (page - 1) * limit;
    this.logger.log(`Fetching users skip ${offset} with limit ${limit}`);
    return await this.usersRepo.findAndCount({
      skip: offset,
      take: limit,
    });
  }

  // Получение общего количества пользователей
  async getTotalUsersCount(): Promise<number> {
    this.logger.log('Fetching total users count');
    return await this.usersRepo.count();
  }
}
