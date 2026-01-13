import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('BOT_TOKEN is not defined in environment variables');
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => ctx.reply('Добро пожаловать в бот «Эмоциональный баланс»!'));
bot.help((ctx) => ctx.reply('Отправьте мне сообщение, и я отвечу.'));

bot.on('text', (ctx) => {
  ctx.reply(`Вы сказали: ${ctx.message.text}`);
});

bot.launch().then(() => {
  console.log('Bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
