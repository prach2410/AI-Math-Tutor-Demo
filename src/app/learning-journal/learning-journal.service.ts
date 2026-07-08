import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StudentProfileService } from '../student-profile/student-profile.service';

export interface LearningJournalAnalysis {
  readable: boolean;
  message: string;
  documentType: string;
  topic: string;
  summary: string;
  highlights: string[];
  keywords: string[];
  duplicate?: boolean;
  existingDate?: string;
  id?: string;
}

@Injectable({ providedIn: 'root' })
export class LearningJournalService {
  private http           = inject(HttpClient);
  private studentProfile = inject(StudentProfileService);

  analyze(files: File[]): Promise<LearningJournalAnalysis> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const name = this.studentProfile.displayName();
    if (name) formData.append('studentName', name);
    return firstValueFrom(
      this.http.post<LearningJournalAnalysis>('/api/learning-journal/analyze', formData)
    );
  }

  setReflection(id: string, reflection: string): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`/api/learning-records/${id}/reflection`, { reflection })
    );
  }
}
