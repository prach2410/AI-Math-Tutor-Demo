import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LearningRecordEntry {
  id: string;
  documentType: string;
  topic: string;
  summary: string;
  keywords: string[];
  createdAt: string;
}

export interface DailyLogGroup {
  date: string;
  records: LearningRecordEntry[];
}

@Injectable({ providedIn: 'root' })
export class LearningRecordsService {
  private http = inject(HttpClient);

  getTimeline(): Promise<DailyLogGroup[]> {
    return firstValueFrom(
      this.http.get<DailyLogGroup[]>('/api/learning-records/timeline')
    );
  }
}
