import { Injectable, NotFoundException, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserUpdateProfileDto } from './dto/user-update-profile.dto';
import { AccessTokenPayload } from '../auth/types/jwt.types';
import { validate } from 'class-validator';
import { RedisStore } from 'cache-manager-redis-store';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache
  ) {}

  async getProfile(id?: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });

    return await this.userRepository.save(user);
  }

  async getProfileMine(id?: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });

    const isDayActive = await this.checkAndUpdateLastTimeLogin(id);
    if(isDayActive == 1)
      user.dayActive = user.dayActive + 1;

    user.lastTimeOnline = new Date();

    return await this.userRepository.save(user);
  }

  async updateProfile(
    payload: UserUpdateProfileDto,
    jwtPayload: AccessTokenPayload,
  ) {
    await validate(payload);

    let user = await this.userRepository.findOne({
      where: {
        id: jwtPayload.id,
      },
      relations: ['invitedBy'],
    });

    if (
      payload.invitedByCode &&
      !user.invitedBy &&
      payload.invitedByCode != user.inviteCode
    ) {
      user.invitedBy = await this.userRepository.findOneBy({
        inviteCode: payload.invitedByCode,
      });
    }

    delete payload.invitedByCode;

    user = await this.userRepository.save({
      ...user,
      ...payload,
    });

    return user;
  }

  async deleteById(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    await this.userRepository.delete(id);
  }

  async getReferral(userId: string) {
    const userDetails = await this.userRepository.query(
      `CALL GetUserDetails('${userId}')`,
    );
    console.log(userDetails);
    const dataMapF1 = new Map<string, any>();
    const dataMapF2 = new Map<string, any>();
    const dataMapF3 = new Map<string, any>();
    const dataMapF4 = new Map<string, any>();
    const dataMapF5 = new Map<string, any>();
    const totalF1 = new Map<string, any>();
    const totalF2 = new Map<string, any>();
    const totalF3 = new Map<string, any>();
    const totalF4 = new Map<string, any>();
    const totalF5 = new Map<string, any>();
    const dataReturn = new Map<string, any>();

    var node = 0;

    userDetails[0].forEach((row) => {
      const type = row.type;
      var value = {
        email: row.authId,
      };

      let valueTotal = {};

      if (row.type && row.type.includes('Total'))
      {
        valueTotal = {
          count: row.total,
        };
        node += parseInt(row.total);
      }

      switch (type) {
        case 'F1':
          dataMapF1.set('F1'+value.email, value);
          break;
        case 'F2':
          dataMapF2.set('F2'+value.email, value);
          break;
        case 'F3':
          dataMapF3.set('F3'+value.email, value);
          break;
        case 'F4':
          dataMapF4.set('F4'+value.email, value);
          break;
        case 'F5':
          dataMapF5.set('F5'+value.email, value);
          break;
        case 'Total_f1':
          totalF1.set('Total_f1', valueTotal);
          break;
        case 'Total_f2':
          totalF2.set('Total_f2', valueTotal);
          break;
        case 'Total_f3':
          totalF3.set('Total_f3', valueTotal);
          break;
        case 'Total_f4':
          totalF4.set('Total_f4', valueTotal);
          break;
        default:
          totalF5.set('Total_f5', valueTotal);
          break;
      }
    });

    dataReturn.set('node',node);
    if(dataMapF1.size>0){
      var dataF1 = {
        count: totalF1.get('Total_f1').count,
        users: [],
      };

      dataMapF1.forEach((value) => {
        const dataDetail = {
          email : value.email
        }
        dataF1.users.push(dataDetail);
      });

      dataReturn.set('f1',dataF1);
    }
    if(dataMapF2.size>0){
      var dataF2 = {
        count: totalF2.get('Total_f2').count,
        users: [],
      };

      dataMapF2.forEach((value) => {
        const dataDetail = {
          email : value.email
        }
        dataF2.users.push(dataDetail);
      });

      dataReturn.set('f2',dataF2);
    }
    if(dataMapF3.size>0){
      var dataF3 = {
        count: totalF3.get('Total_f3').count,
        users: [],
      };

      dataMapF3.forEach((value) => {
        const dataDetail = {
          email : value.email
        }
        dataF3.users.push(dataDetail);
      });

      dataReturn.set('f3',dataF3);
    }
    if(dataMapF4.size>0){
      var dataF4 = {
        count: totalF4.get('Total_f4').count,
        users: [],
      };

      dataMapF4.forEach((value) => {
        const dataDetail = {
          email : value.email
        }
        dataF4.users.push(dataDetail);
      });

      dataReturn.set('f4',dataF4);
    }
    if(dataMapF5.size>0){
      var dataF5 = {
        count: totalF5.get('Total_f5').count,
        users: [],
      };

      dataMapF5.forEach((value) => {
        const dataDetail = {
          email : value.email
        }
        dataF5.users.push(dataDetail);
      });

      dataReturn.set('f5',dataF5);
    }
    var jsonData = JSON.stringify(Array.from(dataReturn.entries()).reduce((obj, [key, value]) => (obj[key] = value, obj), {}));
    console.log(jsonData);

    return jsonData;
  }

  async checkAndUpdateLastTimeLogin(userId): Promise<number> {
    const lastTimeLogin = await this.getData('lastTimeLogin_'+userId);
    var x = 1;
    if(lastTimeLogin == null)
      x = 0;
    else {
      if(lastTimeLogin <= 24)
        x = 0;
    }
    await this.hset('lastTimeLogin_'+userId,'lastTimeLogin',Date.now().toString());
    return x;
  }

  async hset(key: string, field: string, value: string) {
    const stringObject = await this.cache.get<string>(key);
    const object = stringObject != null ? JSON.parse(stringObject) : {};
    object[field] = value;
    await this.cache.set(key, JSON.stringify(object));
  }

  async getData(key: string): Promise<number | null> {
    const data = await this.cache.get<number>(key);
    if (data != null) {
      const currentTime = Date.now();
      return data - currentTime;
    }
    return null;
  }
}
