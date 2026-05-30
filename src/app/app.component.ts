import { Component, inject, OnInit } from '@angular/core';
import { ChatComponent } from './chat/chat.component';
import { StudentNoteComponent } from './student-note/student-note.component';
import { ParentSummaryComponent } from './parent-summary/parent-summary.component';
import { RealWorldComponent } from './real-world/real-world.component';
import { LearningReflectionComponent } from './learning-reflection/learning-reflection.component';
import { TutorService } from './tutor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ChatComponent,
    StudentNoteComponent,
    ParentSummaryComponent,
    RealWorldComponent,
    LearningReflectionComponent,
  ],
  template: `
    <div class="layout">
      <header class="header">
        <div class="header-inner">
          <div class="header-text">
            <h1 class="header-title">AI Tutor คณิตศาสตร์ ม.2</h1>
            <p class="header-sub">{{ tutor.scenario().title }}</p>
          </div>
          <nav class="scenario-nav">
            @for (s of tutor.scenarios; track s.id) {
              <button
                class="scenario-btn"
                [class.active]="tutor.scenario().id === s.id"
                [disabled]="tutor.loading()"
                (click)="tutor.selectScenario(s.id)"
              >
                <span>{{ s.icon }}</span>
                <span>{{ s.title }}</span>
              </button>
            }
          </nav>
        </div>
      </header>

      <div class="content">
        <!-- Chat + Reflection -->
        <section class="chat-section">
          <app-learning-reflection />
          <app-chat />
        </section>

        <!-- Right panels: Real-world + Student Note + Parent Summary -->
        <aside class="side-section">
          <div class="side-realworld">
            <app-real-world />
          </div>
          <div class="side-note">
            <app-student-note />
          </div>
          <div class="side-summary">
            <app-parent-summary />
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .header {
      background: var(--color-header-bg);
      color: white;
      padding: 12px 20px;
      flex-shrink: 0;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-title {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.2;
    }

    .header-sub {
      font-size: 12px;
      opacity: 0.75;
      margin-top: 2px;
    }

    .scenario-nav {
      display: flex;
      gap: 8px;
    }

    .scenario-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      background: rgba(255,255,255,0.15);
      color: white;
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      font-family: inherit;
      font-size: 13.5px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }

    .scenario-btn:hover:not(:disabled) { background: rgba(255,255,255,0.25); }
    .scenario-btn.active {
      background: white;
      color: var(--color-header-bg);
      border-color: white;
      font-weight: 600;
    }
    .scenario-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .content {
      flex: 1;
      display: flex;
      gap: 12px;
      padding: 12px;
      overflow: hidden;
      min-height: 0;
    }

    .chat-section {
      flex: 3;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .side-section {
      flex: 2;
      min-width: 260px;
      max-width: 360px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: hidden;
    }

    .side-realworld {
      flex: 0 0 auto;
      min-height: 110px;
      max-height: 150px;
      display: flex;
      flex-direction: column;
    }

    .side-note,
    .side-summary {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AppComponent implements OnInit {
  protected tutor = inject(TutorService);

  ngOnInit(): void {
    this.tutor.init();
  }
}
