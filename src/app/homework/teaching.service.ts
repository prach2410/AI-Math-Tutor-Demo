import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface TeachingStep {
  step: number;
  goal: string;
  guidingQuestion: string;
  conceptHint: string;
}

export interface StartTeachingResponse {
  sessionId: string;
  needsConfirm: boolean;
  figureDescription: string;
  currentStep: TeachingStep | null;
  totalSteps: number;
}

export interface ConfirmFigureResponse {
  currentStep: TeachingStep;
  totalSteps: number;
}

export interface AnswerResponse {
  verdict: 'correct' | 'partial' | 'wrong';
  reason: string;
  missing: string;
  encouragement: string;
  nextStep: TeachingStep | null;
  done: boolean;
}

export interface HintResponse {
  level: number;
  help: string;
}

export interface NotesResponse {
  studentNotes: string;
  parentSummary: string;
}

export interface SolveResponse {
  sessionId: string;
  solutionSteps: string[];
  understandingStep: string;
}

@Injectable({ providedIn: 'root' })
export class TeachingService {
  private http = inject(HttpClient);

  start(problemText: string, latex: string, topic: string, hasFigure: boolean): Promise<StartTeachingResponse> {
    return firstValueFrom(
      this.http.post<StartTeachingResponse>('/api/teaching/start', { problemText, latex, topic, hasFigure })
    );
  }

  answer(sessionId: string, answer: string): Promise<AnswerResponse> {
    return firstValueFrom(
      this.http.post<AnswerResponse>(`/api/teaching/${sessionId}/answer`, { answer })
    );
  }

  hint(sessionId: string, level: number): Promise<HintResponse> {
    return firstValueFrom(
      this.http.post<HintResponse>(`/api/teaching/${sessionId}/hint`, { level })
    );
  }

  confirmFigure(sessionId: string, studentNote: string): Promise<ConfirmFigureResponse> {
    return firstValueFrom(
      this.http.post<ConfirmFigureResponse>(`/api/teaching/${sessionId}/confirm-figure`, { studentNote })
    );
  }

  notes(sessionId: string): Promise<NotesResponse> {
    return firstValueFrom(
      this.http.get<NotesResponse>(`/api/teaching/${sessionId}/notes`)
    );
  }

  solve(problemText: string, latex: string, topic: string): Promise<SolveResponse> {
    return firstValueFrom(
      this.http.post<SolveResponse>('/api/teaching/solve', { problemText, latex, topic })
    );
  }
}
