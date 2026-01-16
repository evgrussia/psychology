export interface TelegramUserDto {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChatDto {
  id: number;
  type: string;
}

export interface TelegramMessageDto {
  message_id: number;
  from?: TelegramUserDto;
  chat: TelegramChatDto;
  text?: string;
  date: number;
}

export interface TelegramCallbackQueryDto {
  id: string;
  from: TelegramUserDto;
  message?: TelegramMessageDto;
  data?: string;
}

export interface TelegramUpdateDto {
  update_id: number;
  message?: TelegramMessageDto;
  callback_query?: TelegramCallbackQueryDto;
}
