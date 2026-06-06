export type AssistType = 'hint' | 'guided' | 'worked-example';
export type InteractionMode = 'text' | 'voice';

export interface StartResponse {
  scenarioId: string;
  stepNumber: number;
  totalSteps: number;
  question: string;
  isLast: boolean;
  realWorldUses: string[];
}

export interface EvaluateRequest {
  scenarioId: string;
  stepNumber: number;
  answer: string;
  wrongCount: number;
  hintCount: number;
  guidedCount: number;
  studentName?: string;
}

export interface EvaluateResponse {
  correct: boolean;
  message: string;
  hint: string | null;
  nextStep: NextStepDto | null;
  studentNote: string | null;
  parentSummary: string | null;
  isGuidedAssistance: boolean;
  learningReflection: string[] | null;
  studentFeedback: string | null;
  parentCoachingTips: string | null;
}

export interface AssistResponse {
  message: string;
}

export interface NextStepDto {
  stepNumber: number;
  totalSteps: number;
  question: string;
  isLast: boolean;
}

// Session collection types
export interface SessionMessage {
  role: 'student' | 'ai' | 'system';
  type: 'answer' | 'message' | 'hint' | 'guided' | 'worked_example' | 'error';
  text: string;
  timestamp: string;
  inputMode?: 'voice' | 'text';
}

export interface SessionEvent {
  type: string;
  timestamp: string;
}

export interface SessionSummary {
  hintUsed: number;
  helpMeStartUsed: number;
  exampleUsed: number;
  completed: boolean;
  durationSeconds: number;
  voiceMessages?: number;
  textMessages?: number;
}

export interface CreateSessionRequest {
  sessionId: string;
  topic: string;
  studentAlias: string;
  startedAt: string;
  studentId?: string;
  deviceId?: string;
  displayName?: string;
}

export interface CompleteSessionRequest {
  completedAt: string;
  messages: SessionMessage[];
  events: SessionEvent[];
  summary: SessionSummary;
  interactionMode?: InteractionMode;
  reasonForChoice?: string;
}

export interface ParentFeedbackRequest {
  understandingLevel: string;
  mostValuableSection?: string;
  comment?: string;
}

export interface ReflectionRequest {
  whatILearned?: string;
  mostDifficultPart?: string;
  whatIWantToRemember?: string;
  submittedAt: string;
}
