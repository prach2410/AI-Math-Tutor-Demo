import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StudentProfileService } from '../student-profile/student-profile.service';

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
  private http           = inject(HttpClient);
  private studentProfile = inject(StudentProfileService);

  getTimeline(): Promise<DailyLogGroup[]> {
    const name = this.studentProfile.displayName();
    const nameParam = name ? `?name=${encodeURIComponent(name)}` : '';
    return firstValueFrom(
      this.http.get<DailyLogGroup[]>(`/api/learning-records/timeline${nameParam}`)
    );
  }
}
