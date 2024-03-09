import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { HaravanService } from 'src/haravan/haravan.service';
import { HaravanBlogDto } from 'src/haravan/dto/haravan-blog.dto';
import { UserService } from 'src/user/user.service';
import { EUserRole } from 'src/user/enums/user-role.enum';
import { EBlogType } from './enums/blog-type.enum';

@Injectable()
export class BlogService {
  constructor(
    private readonly userService: UserService,
    private readonly haravanService: HaravanService,
  ) {}

  async create(role: string, createBlogDto: CreateBlogDto) {
    console.log(role);
    if(role != EUserRole.admin){
      throw new UnauthorizedException('User does not have permission to perform this action.');
    }
    const data = new HaravanBlogDto();
    if (createBlogDto.blogType === 'promotion') 
      data.blogId = EBlogType.promotion;
    else if (createBlogDto.blogType === 'news') 
      data.blogId = EBlogType.news;
    else if (createBlogDto.blogType === 'product') 
      data.blogId = EBlogType.product;
    else if (createBlogDto.blogType === 'program') 
      data.blogId = EBlogType.program;
    else 
      throw new NotFoundException('Blog type not found.');
    
    data.title = createBlogDto.title;
    data.author = createBlogDto.author;
    data.tags = createBlogDto.tags;
    data.bodyHtml = createBlogDto.bodyHtml;
    data.publishedAt = createBlogDto.publishedAt;
    data.image.src = createBlogDto.image;
    return this.haravanService.createBlog(data);
  }

  findAll() {
    return `This action returns all blog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
