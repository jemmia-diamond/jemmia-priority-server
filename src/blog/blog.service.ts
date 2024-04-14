import { Injectable } from '@nestjs/common';
import { EBlogType } from './enums/blog-type.enum';
import { HaravanService } from '../haravan/haravan.service';
import { validate } from 'class-validator';
import { BlogDto } from './dto/blog.dto';
import { HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private readonly haravanService: HaravanService,
  ) {}

  async create(createBlogDto: BlogDto) {
    try {
      await validate(createBlogDto, { whitelist: true });

      const createdBlog = await this.haravanService.createBlog(createBlogDto);
      createBlogDto.post.haravanId = createdBlog.id;
      const post = await this.postRepository.save(createBlogDto.post);

      return {
        createdBlog,
        post: post,
      };
    } catch (error) {
      return error;
    }
  }

  async findAll(query: HaravanBlogSearchDto) {
    try {
      let data = await this.haravanService.findAllBlog(query);
      const posts = await this.postRepository.find({
        where: {
          haravanId: In(data.map((d) => d.id)),
        },
      });

      data = data.map((d) => ({
        ...d,
        post: posts.find((p) => (p.haravanId = d.id)),
      }));

      return data;
    } catch (error) {
      return error;
    }
  }

  async update(id: number, updateBlogDto: BlogDto) {
    try {
      updateBlogDto.id = id;
      await validate(updateBlogDto, { whitelist: true });
      const post = await this.postRepository.findOneBy({ haravanId: id });

      const updatedBlog = await this.haravanService.updateBlog(updateBlogDto);
      await this.postRepository.save({ ...post, ...updateBlogDto.post });

      return {
        updatedBlog,
        post: post,
      };
    } catch (error) {
      return error;
    }
  }

  async remove(id: number, blogType: EBlogType) {
    try {
      return this.haravanService.deleteBlog(id, blogType);
    } catch (error) {
      return error;
    }
  }

  async getOne(id: number, blogType: EBlogType) {
    try {
      return {
        ...(await this.haravanService.getBlog(id, blogType)),
        post: await this.postRepository.findOneBy({ haravanId: id }),
      };
    } catch (error) {
      return error;
    }
  }
}
