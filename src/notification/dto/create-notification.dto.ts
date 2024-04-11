import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '../enums/noti-type.enum';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  @Length(10, 40)
  title: string;

  @IsString()
  @ApiProperty()
  description?: string = '';

  @ApiProperty()
  @IsEnum(NotificationType)
  type: NotificationType;
}
