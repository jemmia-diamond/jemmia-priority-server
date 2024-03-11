import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';
import { EBlogType } from './enums/blog-type.enum';

@ApiTags("Blog")
@ApiBearerAuth()
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post()
  async create(@Query('blogType') blogType: EBlogType, @Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto, blogType);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('blogType') blogType: EBlogType, @Query() query: HaravanBlogSearchDto) {
    return this.blogService.findAll(query, blogType);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('blogType') blogType: EBlogType) {
    return this.blogService.getOne(+id, blogType);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Patch(':blogType/:id')
  async update(@Param('id') id: string, @Param('blogType') blogType: EBlogType, @Body() updateBlogDto: CreateBlogDto) {
    return this.blogService.update(+id, updateBlogDto, blogType);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('blogType') blogType: EBlogType) {
    return this.blogService.remove(+id, blogType);
  }
}
