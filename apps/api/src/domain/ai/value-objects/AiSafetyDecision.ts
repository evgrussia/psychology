import { AiCrisisTriggerType, AiRefusalReason, AiSafetyStatus } from './AiEnums';

export interface AiSafetyDecision {
  status: AiSafetyStatus;
  refusalReason?: AiRefusalReason;
  crisisTrigger?: AiCrisisTriggerType;
}
