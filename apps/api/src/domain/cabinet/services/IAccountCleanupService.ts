export interface AccountCleanupResult {
  diaryEntries: number;
  intakeForms: number;
  anonymousQuestions: number;
  questionAnswers: number;
  reviews: number;
  leadIdentities: number;
  waitlistRequests: number;
}

export interface IAccountCleanupService {
  cleanupUserData(userId: string): Promise<AccountCleanupResult>;
}
