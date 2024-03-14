import { Injectable } from '@nestjs/common';
import { EBlogType } from './enums/blog-type.enum';
import { HaravanService } from '../haravan/haravan.service';
import { validate } from 'class-validator';
import { BlogDto } from './dto/blog.dto';
import { HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';

@Injectable()
export class BlogService {
  constructor(private readonly haravanService: HaravanService) {}

  async create(createBlogDto: BlogDto) {
    try {
      await validate(createBlogDto, { whitelist: true });
      return this.haravanService.createBlog(createBlogDto);
    } catch (error) {
      return error;
    }
  }

  async findAll(query: HaravanBlogSearchDto) {
    try {
      return {
        blogs: await this.haravanService.findAllBlog(query),
      };
    } catch (error) {
      return error;
    }
  }

  async update(id: number, updateBlogDto: BlogDto) {
    try {
      updateBlogDto.id = id;
      await validate(updateBlogDto, { whitelist: true });
      return this.haravanService.updateBlog(updateBlogDto);
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
      return this.haravanService.getBlog(id, blogType);
    } catch (error) {
      return error;
    }
  }
}
