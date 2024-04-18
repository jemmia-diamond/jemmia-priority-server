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
import { CrmService } from '../../crm/crm.service';

@EventSubscriber()
export class UserEntitySubscriber implements EntitySubscriberInterface<User> {
  constructor(
    dataSource: DataSource,
    private haravanService: HaravanService,
    private crmService: CrmService,
    private userRedis: UserRedis,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async updateRedis(user: User) {
    const crmCusData = (
      await this.crmService.findAllCustomer({
        limit: 1,
        query: {
          id: user.crmId,
        },
      })
    ).data?.[0];

    await this.userRedis.set(user.id, {
      ...crmCusData,
      ...user,
      cumulativeTovRecorded: crmCusData.cumulativeTovRecorded,
    });
  }

  async afterInsert(event: InsertEvent<User>) {
    await this.updateRedis(event.entity);
  }

  async afterUpdate(event: UpdateEvent<any>) {
    await this.updateRedis(event.entity as User);
  }
}
