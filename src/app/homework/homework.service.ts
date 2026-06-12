import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface HomeworkAnalysisResult {
  problemText: string;
  latex: string;
  topic: string;
  readable: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HomeworkService {
  private http = inject(HttpClient);

  analyze(file: File): Promise<HomeworkAnalysisResult> {
    const formData = new FormData();
    formData.append('image', file);
    return firstValueFrom(
      this.http.post<HomeworkAnalysisResult>('/api/homework/analyze', formData)
    );
  }
}
