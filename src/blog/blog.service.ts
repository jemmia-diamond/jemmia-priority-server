import { Injectable } from '@nestjs/common';
import { HaravanService } from '../haravan/haravan.service';
import { validate } from 'class-validator';
import { BlogDto } from './dto/blog.dto';
import { HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, IsNull, Like, Not, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { EUserRole } from '../user/enums/user-role.enum';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    private readonly haravanService: HaravanService,
  ) {}

  async create(createBlogDto: BlogDto) {
    try {
      await validate(createBlogDto, { whitelist: true });
      const post = await this.postRepository.save(createBlogDto.post);
      delete createBlogDto.post;
      const createdBlog = await this.blogRepository.save({
        ...createBlogDto,
        post,
      });

      return createdBlog;
    } catch (error) {
      return error;
    }
  }

  async findAll(query: HaravanBlogSearchDto) {
    try {
      const limit = query.limit || 999999999;
      const offset = ((query.page || 1) - 1) * limit;
      const data = await this.blogRepository.find({
        where: {
          id: query.excludeIds ? Not(In(query.excludeIds)) : null,
          blogId: query.blogId,
          published:
            query.published == null || query.published == undefined
              ? true
              : query.published,
          post: [
            {
              userRole: query.userRole
                ? (Like(`%${query.userRole}%`) as unknown as EUserRole)
                : (Like(`%[]%`) as unknown as EUserRole),
            },
            {
              userRole: IsNull(),
            },
            {
              userRole: null,
            },
          ],
        },
        relations: ['post'],
        take: limit,
        skip: offset,
        order: { createdAt: 'DESC' },
      });

      return data;
    } catch (error) {
      return error;
    }
  }

  async update(id: number, updateBlogDto: BlogDto) {
    try {
      updateBlogDto.id = id;
      await validate(updateBlogDto, { whitelist: true });

      // const updatedBlog = await this.haravanService.updateBlog(updateBlogDto);

      const blog = await this.blogRepository.findOne({
        where: { id: id },
        relations: ['post'],
      });
      await this.postRepository.save({
        ...blog.post,
        ...updateBlogDto.post,
      });
      delete updateBlogDto.post;
      await this.blogRepository.save({ ...blog, ...updateBlogDto });

      return blog;
    } catch (error) {
      return error;
    }
  }

  async remove(id: number) {
    try {
      return this.blogRepository.delete(id);
    } catch (error) {
      return error;
    }
  }

  async getOne(id: number) {
    try {
      // return {
      //   // ...(await this.haravanService.getBlog(id, blogType)),
      //   // post: await this.postRepository.findOneBy({ haravanId: id }),
      // };

      return await this.blogRepository.findOne({
        where: { id },
        relations: ['post'],
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
