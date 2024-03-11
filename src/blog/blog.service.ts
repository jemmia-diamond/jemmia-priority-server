import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { EBlogType } from './enums/blog-type.enum';
import { HaravanService } from '../haravan/haravan.service';
import { HaravanBlogDto, HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';
import { validate } from 'class-validator';

@Injectable()
export class BlogService {
  constructor(
    private readonly haravanService: HaravanService,
  ) {}

  async create(createBlogDto: CreateBlogDto, blogType: EBlogType) {
    try {
      await validate(createBlogDto, { whitelist: true });

      var blogId = blogType;
      const data = new HaravanBlogDto();
      
      data.title = createBlogDto.title;
      data.author = createBlogDto.author;
      data.tags = createBlogDto.tags;
      data.bodyHtml = createBlogDto.bodyHtml;
      data.publishedAt = createBlogDto.publishedAt;
      data.image = {
        src: createBlogDto.image
      };
      return this.haravanService.createBlog(data, blogId);
    } catch (error) {
      return error;
    }
  }

  async findAll(query: HaravanBlogSearchDto, blogType: EBlogType) {
    try {
      var blogId = blogType;
      return this.haravanService.findAllBlog(query, blogId);
    } catch (error) {
      return error;
    }
  }

  async update(id: number, updateBlogDto: UpdateBlogDto, blogType: EBlogType) {
    try {
      await validate(updateBlogDto, { whitelist: true });

      var blogId = blogType;
      const data = new HaravanBlogDto();
      
      data.id = id;
      data.title = updateBlogDto.title;
      data.author = updateBlogDto.author;
      data.tags = updateBlogDto.tags;
      data.bodyHtml = updateBlogDto.bodyHtml;
      data.publishedAt = updateBlogDto.publishedAt;
      data.image = {
        src: updateBlogDto.image
      };
      return this.haravanService.updateBlog(data, blogId);
    } catch (error) {
      return error;
    }
  }

  async remove(id: number, blogType: EBlogType) {
    try {
      var blogId = blogType;
      return this.haravanService.deleteBlog(id, blogId);
    } catch (error) {
      return error;
    }
  }

  async getOne(id: number, blogType: EBlogType) {
    try {
      var blogId = blogType;
      return this.haravanService.getBlog(id, blogId);
    } catch (error) {
      return error;
    }
  }
}
