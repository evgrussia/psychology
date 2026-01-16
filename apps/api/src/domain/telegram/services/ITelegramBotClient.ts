export interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramSendMessageOptions {
  replyMarkup?: {
    inline_keyboard: TelegramInlineKeyboardButton[][];
  };
  disableWebPagePreview?: boolean;
}

export interface TelegramWebhookConfig {
  url: string;
  secretToken?: string | null;
}

export interface TelegramUpdate {
  update_id: number;
  message?: any;
  callback_query?: any;
}

export interface ITelegramBotClient {
  sendMessage(chatId: string, text: string, options?: TelegramSendMessageOptions): Promise<void>;
  answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void>;
  setWebhook(config: TelegramWebhookConfig): Promise<boolean>;
  deleteWebhook(): Promise<boolean>;
  getUpdates(offset?: number, timeoutSeconds?: number): Promise<TelegramUpdate[]>;
}
