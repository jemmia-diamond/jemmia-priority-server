import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { HaravanService } from '../../haravan/haravan.service';
import { UserRedis } from '../user.redis';

@EventSubscriber()
export class UserEntitySubscriber implements EntitySubscriberInterface<User> {
  constructor(
    dataSource: DataSource,
    private haravanService: HaravanService,
    private userRedis: UserRedis,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async updateRedis(user: User) {
    const haravanCusData = await this.haravanService.findCustomer(
      user.haravanId,
    );

    await this.userRedis.set(user.id, {
      ...haravanCusData,
      ...user,
    });
  }

  async afterInsert(event: InsertEvent<User>) {
    await this.updateRedis(event.entity);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    await this.updateRedis(event.entity as User);
  }
}
