import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as admin from 'firebase-admin';
import { TelegramFilter } from './telegram.filter';
import { Telegraf } from 'telegraf';

const telegramBot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
process.on('uncaughtException', (error) => {
  telegramBot.telegram.sendMessage(
    process.env.TELEGRAM_BOT_GROUP,
    `<b>UNCAUGHT EXCEPTION</b>\n<b>Message</b>\n<code>${error.message}</code>\n<b>Stack</b>\n<code>${error.stack}</code>`,
    {
      parse_mode: 'HTML',
    },
  );
});

//!SET DEFAULT TIMEZONE
process.env.TZ = 'Asia/Ho_Chi_Minh';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS.split(',') || [],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  //FIREBASE ADMIN
  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  //SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Jemmia Priority Server')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_GROUP) {
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new TelegramFilter(httpAdapter, telegramBot));

    telegramBot.telegram.sendMessage(
      process.env.TELEGRAM_BOT_GROUP,
      '<b>STARTED JEMMIA LOGS SERVICE</b>',
      {
        parse_mode: 'HTML',
      },
    );
  }

  telegramBot.launch();

  await app.listen(process.env.PORT);
}
bootstrap();
