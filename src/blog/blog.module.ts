import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { HaravanModule } from 'src/haravan/haravan.module';
import { UserService } from 'src/user/user.service';
import { HaravanService } from 'src/haravan/haravan.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User])],
  controllers: [BlogController],
  providers: [BlogService, UserService, HaravanService],
})
export class BlogModule {}
