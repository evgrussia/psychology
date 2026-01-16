export enum TelegramFlow {
  plan_7d = 'plan_7d',
  save_resource = 'save_resource',
  challenge_7d = 'challenge_7d',
  concierge = 'concierge',
  question = 'question',
  prep = 'prep',
  ritual = 'ritual',
  boundaries = 'boundaries',
  favorites = 'favorites',
}

export enum TelegramSessionState {
  idle = 'idle',
  channel_confirmation = 'channel_confirmation',
  onboarding_topic = 'onboarding_topic',
  onboarding_frequency = 'onboarding_frequency',
  concierge_format = 'concierge_format',
  concierge_time = 'concierge_time',
  concierge_goal = 'concierge_goal',
  question_pending = 'question_pending',
  stopped = 'stopped',
}

export enum TelegramFrequency {
  weekly_1_2 = 'weekly_1_2',
  weekly_3_4 = 'weekly_3_4',
  on_demand = 'on_demand',
}

export enum TelegramTarget {
  bot = 'bot',
  channel = 'channel',
}

export enum TelegramUtmMedium {
  bot = 'bot',
  channel = 'channel',
  post = 'post',
  story = 'story',
}
