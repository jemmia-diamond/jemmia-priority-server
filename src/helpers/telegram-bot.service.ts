import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramBotService {
  private readonly bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  async sendMessage(content: string) {
    return this.bot.telegram.sendMessage(
      process.env.TELEGRAM_BOT_GROUP,
      content,
      {
        parse_mode: 'MarkdownV2',
      },
    );
  }

  async sendException(
    title: string,
    message: string,
    stack: string,
    body?: object,
  ) {
    return this.sendMessage(`
      **${title}**\n**Message**\n\`\`\`javascript\n${message}\`\`\`\n**Stack**\n\`\`\`javascript\n${stack}\`\`\`\n**Payload**\n\`\`\`javascript\n${JSON.stringify(
        body || {},
      )}\`\`\`
    `);
  }
}
