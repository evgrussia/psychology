import { ModerationActionType, ModerationReasonCategory, UgcStatus, UgcTriggerFlag, UgcType } from '../value-objects/ModerationEnums';

export interface ModerationListFilters {
  type?: UgcType[];
  status?: UgcStatus[];
  triggerFlags?: UgcTriggerFlag[];
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
}

export interface ModerationListItem {
  id: string;
  type: UgcType;
  status: UgcStatus;
  submittedAt: Date;
  answeredAt: Date | null;
  triggerFlags: UgcTriggerFlag[];
  hasContact: boolean;
  lastAction: {
    action: ModerationActionType;
    reasonCategory: ModerationReasonCategory | null;
    createdAt: Date;
    moderator: {
      id: string;
      email: string | null;
      displayName: string | null;
    } | null;
  } | null;
}

export interface ModerationListResult {
  items: ModerationListItem[];
  total: number;
  statusCounts: Record<string, number>;
}

export interface ModerationActionRecord {
  id: string;
  action: ModerationActionType;
  reasonCategory: ModerationReasonCategory | null;
  createdAt: Date;
  moderator: {
    id: string;
    email: string | null;
    displayName: string | null;
  } | null;
}

export interface QuestionAnswerRecord {
  id: string;
  answerTextEncrypted: string;
  publishedAt: Date;
  answeredBy: {
    id: string;
    email: string | null;
    displayName: string | null;
  } | null;
}

export interface AnonymousQuestionDetails {
  id: string;
  status: UgcStatus;
  submittedAt: Date;
  answeredAt: Date | null;
  triggerFlags: UgcTriggerFlag[];
  questionTextEncrypted: string;
  contactValueEncrypted: string | null;
  publishAllowed: boolean;
  answers: QuestionAnswerRecord[];
  moderations: ModerationActionRecord[];
}

export interface CreateAnonymousQuestionInput {
  userId?: string | null;
  questionTextEncrypted: string;
  contactValueEncrypted?: string | null;
  publishAllowed: boolean;
  triggerFlags?: UgcTriggerFlag[];
  status: UgcStatus;
}

export interface CreateModerationActionInput {
  ugcType: UgcType;
  ugcId: string;
  moderatorUserId: string;
  action: ModerationActionType;
  reasonCategory?: ModerationReasonCategory | null;
}

export interface CreateAnswerInput {
  questionId: string;
  answeredByUserId: string;
  answerTextEncrypted: string;
  publishedAt?: Date;
}

export interface IUgcModerationRepository {
  listModerationItems(filters: ModerationListFilters): Promise<ModerationListResult>;
  getAnonymousQuestionById(id: string): Promise<AnonymousQuestionDetails | null>;
  createAnonymousQuestion(input: CreateAnonymousQuestionInput): Promise<{ id: string; status: UgcStatus; submittedAt: Date }>;
  updateQuestionStatus(id: string, status: UgcStatus, answeredAt?: Date | null): Promise<void>;
  addModerationAction(input: CreateModerationActionInput): Promise<void>;
  addAnswer(input: CreateAnswerInput): Promise<QuestionAnswerRecord>;
}
