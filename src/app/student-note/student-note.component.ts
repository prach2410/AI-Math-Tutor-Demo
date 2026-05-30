import { Component, inject } from '@angular/core';
import { TutorService } from '../tutor.service';

@Component({
  selector: 'app-student-note',
  standalone: true,
  template: `
    <div class="panel">
      <div class="panel-header">
        <span class="panel-icon">📓</span>
        <h2 class="panel-title">บันทึกของหนู</h2>
      </div>
      <div class="panel-body">
        @if (tutorService.studentNote()) {
          <pre class="note-content">{{ tutorService.studentNote() }}</pre>
        } @else {
          <p class="empty-hint">บันทึกจะปรากฏเมื่อเริ่มเรียน...</p>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .panel {
      background: var(--color-note-bg);
      border: 1px solid var(--color-note-border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      height: 100%;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-note-border);
      background: #fef9c3;
    }

    .panel-icon {
      font-size: 20px;
    }

    .panel-title {
      font-size: 15px;
      font-weight: 700;
      color: #92400e;
    }

    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
    }

    .note-content {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 13.5px;
      line-height: 1.7;
      color: var(--color-text);
    }

    .empty-hint {
      color: var(--color-text-muted);
      font-size: 13.5px;
      font-style: italic;
      text-align: center;
      padding-top: 20px;
    }
  `]
})
export class StudentNoteComponent {
  protected tutorService = inject(TutorService);
}
