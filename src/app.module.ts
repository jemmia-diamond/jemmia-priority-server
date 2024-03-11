import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { HaravanModule } from './haravan/haravan.module';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InformationModule } from './information/information.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      username: process.env.DB_UNAME,
      entities: [User],
      database: process.env.DB,
      synchronize: true,
      logging: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    UserModule,
    HaravanModule,
    InformationModule,
  ],
  providers: [],
})
export class AppModule {}
