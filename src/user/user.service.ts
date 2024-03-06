import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserUpdateProfileDto } from './dto/user-update-profile.dto';
import { AccessTokenPayload } from '../auth/types/jwt.types';
import { validate } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getProfile(id: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });

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
}
