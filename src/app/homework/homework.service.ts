import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ProblemItem {
  index: number;
  problemText: string;
  latex: string;
  topic: string;
  hasFigure: boolean;
  groupIndex?: number;
  groupTitle?: string;
  subText?: string;
}

export interface HomeworkAnalysisResult {
  readable: boolean;
  message: string;
  problems: ProblemItem[];
  visionModel?: string;
  analysisStartedAt?: string;
  analysisEndedAt?: string;
}

export interface HomeworkRead {
  id: number;
  createdAt: string;
  topic: string;
  problemCount: number;
  visionModel?: string;
  analysisStartedAt?: string;
  analysisEndedAt?: string;
  problems: ProblemItem[];
}

@Injectable({ providedIn: 'root' })
export class HomeworkService {
  private http = inject(HttpClient);

  analyze(files: File[]): Promise<HomeworkAnalysisResult> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return firstValueFrom(
      this.http.post<HomeworkAnalysisResult>('/api/homework/analyze', formData)
    );
  }

  listReads(limit = 30): Promise<HomeworkRead[]> {
    return firstValueFrom(
      this.http.get<HomeworkRead[]>(`/api/homework/reads?limit=${limit}`)
    );
  }
}
