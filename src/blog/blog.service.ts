import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { EBlogType } from './enums/blog-type.enum';
import { UserService } from '../user/user.service';
import { HaravanService } from '../haravan/haravan.service';
import { HaravanBlogDto, HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly userService: UserService,
    private readonly haravanService: HaravanService,
  ) {}

  async create(createBlogDto: CreateBlogDto) {
    var blogId = this.getBlogId(createBlogDto.blogType);
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
  }

  async findAll(query: HaravanBlogSearchDto, blogType: string) {
    var blogId = this.getBlogId(blogType);
    return this.haravanService.findAllBlog(query, blogId);
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  async update(id: number, updateBlogDto: UpdateBlogDto) {
    var blogId = this.getBlogId(updateBlogDto.blogType);
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
  }

  async remove(id: number, blogType: string) {
    var blogId = this.getBlogId(blogType);
    return this.haravanService.deleteBlog(id, blogId);
  }

  async getOne(id: number, blogType: string) {
    var blogId = this.getBlogId(blogType);
    return this.haravanService.getBlog(id, blogId);
  }

  getBlogId(blogType: string){
    if (blogType === 'promotion') 
      return EBlogType.promotion;
    else if (blogType === 'news') 
      return EBlogType.news;
    else if (blogType === 'product') 
      return EBlogType.product;
    else if (blogType === 'program') 
      return EBlogType.program;
    else 
      throw new NotFoundException('Blog type not found.');
  }
}
