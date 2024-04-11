import { NotificationType } from '../enums/noti-type.enum';

export class PaginFindNotificationDto {
  page: number = 1;

  size?: number = 10;

  type: NotificationType;
}
