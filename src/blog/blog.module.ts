import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';
import { HaravanModule } from '../haravan/haravan.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User]), HaravanModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
