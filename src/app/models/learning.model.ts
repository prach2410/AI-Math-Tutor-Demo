export type AssistType = 'hint' | 'guided' | 'worked-example';

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
