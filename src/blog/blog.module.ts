import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { HaravanService } from '../haravan/haravan.service';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User])],
  controllers: [BlogController],
  providers: [BlogService, UserService, HaravanService],
})
export class BlogModule {}
