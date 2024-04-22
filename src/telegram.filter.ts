import { Catch, ArgumentsHost, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';

@Catch()
export class TelegramFilter extends BaseExceptionFilter {
  private bot: Telegraf<Context<Update>>;

  constructor(
    applicationRef: HttpServer,
    telegramBot: Telegraf<Context<Update>>,
  ) {
    super(applicationRef);

    this.bot = telegramBot;
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    // const response = ctx.getResponse();

    console.log('EXCEPTION FILTER!!!');

    this.bot.telegram.sendMessage(
      process.env.TELEGRAM_BOT_GROUP,
      `
        <b>${request.method}: ${
          request.url
        }</b>\n<b>Body:</b>\n<code>${JSON.stringify(
          request.body,
        )}</code>\n<b>Message:</b>\n<code>${
          exception.message
        }</code>\n<b>Stack:</b>\n<code>${exception.stack}</code>
      `,
      {
        parse_mode: 'HTML',
      },
    );
    super.catch(exception, host);
  }
}
