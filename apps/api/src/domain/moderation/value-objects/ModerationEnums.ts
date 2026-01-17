export enum UgcStatus {
  pending = 'pending',
  flagged = 'flagged',
  approved = 'approved',
  answered = 'answered',
  rejected = 'rejected',
}

export enum UgcTriggerFlag {
  crisis = 'crisis',
  pii = 'pii',
  medical = 'medical',
  spam = 'spam',
}

export enum ModerationActionType {
  approve = 'approve',
  reject = 'reject',
  flag = 'flag',
  mask_pii = 'mask_pii',
  publish = 'publish',
  unpublish = 'unpublish',
  escalate = 'escalate',
}

export enum ModerationReasonCategory {
  crisis = 'crisis',
  medical = 'medical',
  out_of_scope = 'out_of_scope',
  therapy_request = 'therapy_request',
  spam = 'spam',
  pii = 'pii',
  other = 'other',
}

export type UgcType = 'anonymous_question' | 'review' | 'comment';
