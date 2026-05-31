import { Component, inject, OnInit } from '@angular/core';
import { FirstTimeGuideComponent } from './first-time-guide/first-time-guide.component';
import { AboutComponent } from './about/about.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { OnboardingService } from './onboarding/onboarding.service';
import { ChatComponent } from './chat/chat.component';
import { StudentNoteComponent } from './student-note/student-note.component';
import { ParentSummaryComponent } from './parent-summary/parent-summary.component';
import { RealWorldComponent } from './real-world/real-world.component';
import { LearningReflectionComponent } from './learning-reflection/learning-reflection.component';
import { LearningFeedbackComponent } from './learning-feedback/learning-feedback.component';
import { FeedbackCollectionComponent } from './feedback-collection/feedback-collection.component';
import { TutorService } from './tutor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FirstTimeGuideComponent,
    AboutComponent,
    OnboardingComponent,
    ChatComponent,
    StudentNoteComponent,
    ParentSummaryComponent,
    RealWorldComponent,
    LearningReflectionComponent,
    LearningFeedbackComponent,
    FeedbackCollectionComponent,
  ],
  template: `
    <app-first-time-guide />
    <div class="layout">
      <header class="header">
        <div class="header-inner">
          <div class="header-text">
            <h1 class="header-title">AI Tutor คณิตศาสตร์ ม.2</h1>
            <p class="header-sub">{{ tutor.scenario().title }}</p>
          </div>
          <div class="header-right">
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
            <app-about />
          </div>
        </div>
      </header>

      <div class="content">
        <!-- Chat + Reflection (or Onboarding) -->
        <section class="chat-section">
          @if (onboarding.isActive()) {
            <app-onboarding />
          } @else {
            <app-learning-reflection />
            <app-chat />
          }
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
          <div class="side-feedback">
            <app-learning-feedback />
          </div>
          <div class="side-collect">
            <app-feedback-collection />
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

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
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

    .side-feedback {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .side-collect {
      flex: 0 0 auto;
    }

    /* ── Mobile ── */
    @media (max-width: 640px) {
      .header {
        padding: 10px 14px;
      }

      .header-inner {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .header-right {
        width: 100%;
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }
      .header-right::-webkit-scrollbar { display: none; }

      .header-title { font-size: 15px; }
      .header-sub   { font-size: 11px; }

      .scenario-nav {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 2px;
        scrollbar-width: none;
      }
      .scenario-nav::-webkit-scrollbar { display: none; }

      .scenario-btn {
        font-size: 12px;
        padding: 6px 11px;
        flex-shrink: 0;
      }

      .content {
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px;
        gap: 8px;
      }

      .chat-section {
        flex: none;
        height: 70vh;
        min-height: 360px;
      }

      .side-section {
        flex: none;
        min-width: 0;
        max-width: none;
        overflow: visible;
        height: auto;
      }

      .side-realworld { max-height: none; }

      .side-note,
      .side-summary,
      .side-feedback {
        flex: none;
        min-height: 120px;
        height: auto;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  protected tutor       = inject(TutorService);
  protected onboarding  = inject(OnboardingService);

  ngOnInit(): void {
    this.onboarding.init();
    if (!this.onboarding.isActive()) {
      this.tutor.init();
    }
  }
}
