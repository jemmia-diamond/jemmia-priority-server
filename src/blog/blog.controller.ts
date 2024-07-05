import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EUserRole } from '../user/enums/user-role.enum';
import { HaravanBlogSearchDto } from '../haravan/dto/haravan-blog.dto';
import { BlogDto } from './dto/blog.dto';
import { RequestPayload } from '../shared/types/controller.type';

@ApiTags('Blog')
@ApiBearerAuth()
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Post()
  async create(@Body() createBlogDto: BlogDto) {
    return this.blogService.create(createBlogDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Request() req: RequestPayload,
    @Query() query: HaravanBlogSearchDto,
  ) {
    if (req.user.role != EUserRole.admin) {
      query.excludeIds = process.env.EXCLUDE_BLOG_IDS?.split(','); //Filter system posts, keep banner posts
    }

    return this.blogService.findAll(
      query,
      req.user.role == EUserRole.admin,
      req.user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.blogService.getOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBlogDto: BlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
