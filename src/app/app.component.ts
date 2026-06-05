import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { FreeTalkComponent } from './free-talk/free-talk.component';
import { DiscoveryBatchesComponent } from './admin/discovery-batches/discovery-batches.component';
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
import { LessonCompleteComponent } from './lesson-complete/lesson-complete.component';
import { TutorService } from './tutor.service';
import { VoiceService } from './voice.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FreeTalkComponent,
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
    LessonCompleteComponent,
    DiscoveryBatchesComponent,
  ],
  template: `
    @if (isAdminPage()) {
      <app-discovery-batches />
    } @else {
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
            <app-about #aboutRef />
          </div>
        </div>
      </header>

      <div class="content">
        <!-- Chat + Reflection (or Onboarding) -->
        <section class="chat-section">
          @if (onboarding.isActive()) {
            <app-onboarding />
          } @else if (tutor.inFreeTalk()) {
            <app-free-talk [duringLesson]="tutor.messages().length > 0" />
          } @else if (tutor.finished()) {
            <app-lesson-complete />
          } @else if (tutor.interactionMode() === null) {
            <div class="mode-select-card">
              <p class="mode-select-title">คุณอยากเรียนแบบไหนคะ? 😊</p>
              <p class="mode-select-sub">เลือกวิธีที่สะดวกสำหรับตอนนี้</p>
              <div class="mode-select-btns">
                <button class="mode-btn text-btn" (click)="chooseMode('text')">
                  <span class="mode-icon">⌨️</span>
                  <span class="mode-label">พิมพ์ข้อความ</span>
                </button>
                <button class="mode-btn voice-btn"
                  (click)="chooseMode('voice')"
                  [disabled]="!voice.isSupported()"
                  [title]="voice.isSupported() ? '' : 'ใช้ได้บน Chrome / Edge เท่านั้น'"
                >
                  <span class="mode-icon">🎙️</span>
                  <span class="mode-label">พูดออกเสียง</span>
                  @if (!voice.isSupported()) {
                    <span class="mode-note">Chrome เท่านั้น</span>
                  }
                </button>
              </div>
            </div>
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

      <!-- Mobile bottom navigation -->
      <nav class="mobile-bottom-nav">
        <button class="nav-item" [class.active]="onboarding.isActive()" (click)="goHome()">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">หน้าแรก</span>
        </button>
        <button class="nav-item" [class.active]="!onboarding.isActive()" (click)="goLearn()">
          <span class="nav-icon">📚</span>
          <span class="nav-label">เรียน</span>
        </button>
        <button class="nav-item" (click)="openAbout()">
          <span class="nav-icon">ℹ️</span>
          <span class="nav-label">เกี่ยวกับ</span>
        </button>
        <a class="nav-item" href="https://forms.gle/q9eV47ktwTvXhT2NA" target="_blank" rel="noopener">
          <span class="nav-icon">💬</span>
          <span class="nav-label">ความคิดเห็น</span>
        </a>
      </nav>
    </div>
    }
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

    /* ── Mode selection ── */
    .mode-select-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 32px 24px;
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }


    .mode-select-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      text-align: center;
    }

    .mode-select-sub {
      font-size: 14px;
      color: #64748b;
      text-align: center;
      margin-top: -8px;
    }

    .mode-select-btns {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .mode-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 32px;
      border-radius: 16px;
      border: 2px solid #e2e8f0;
      background: white;
      cursor: pointer;
      font-family: inherit;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
      min-width: 140px;
    }
    .mode-btn:hover:not(:disabled) {
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }
    .mode-btn:active:not(:disabled) { transform: translateY(0) scale(0.97); }
    .mode-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .text-btn:hover:not(:disabled)  { border-color: var(--color-primary); }
    .voice-btn:hover:not(:disabled) { border-color: #16a34a; }

    .mode-icon  { font-size: 36px; line-height: 1; }
    .mode-label { font-size: 15px; font-weight: 600; color: #1e293b; }
    .mode-note  { font-size: 11px; color: #94a3b8; }

    /* ── Mobile bottom nav ── */
    .mobile-bottom-nav {
      display: none;
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

      /* Mode selection on mobile */
      .mode-select-card {
        padding: 24px 16px;
        gap: 14px;
        justify-content: flex-start;
        padding-top: 40px;
      }
      .mode-select-title { font-size: 17px; }
      .mode-select-sub   { font-size: 13px; }
      .mode-select-btns  { width: 100%; flex-direction: column; gap: 10px; }
      .mode-btn {
        width: 100%;
        flex-direction: row;
        justify-content: center;
        padding: 16px 20px;
        min-width: 0;
        gap: 12px;
      }
      .mode-icon  { font-size: 28px; }
      .mode-label { font-size: 15px; }

      .side-note,
      .side-summary,
      .side-feedback {
        flex: none;
        min-height: 120px;
        height: auto;
      }

      /* Show bottom nav on mobile */
      .mobile-bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid #e2e8f0;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
        z-index: 100;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }

      .nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 8px 4px;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
        color: #94a3b8;
        transition: color 0.15s;
        font-family: inherit;
        -webkit-tap-highlight-color: transparent;
      }
      .nav-item:active { background: #f1f5f9; }
      .nav-item.active { color: var(--color-header-bg, #2563eb); }

      .nav-icon  { font-size: 20px; line-height: 1; }
      .nav-label { font-size: 10px; font-weight: 500; white-space: nowrap; }

      /* Pad content above bottom nav */
      .layout { padding-bottom: 56px; }
    }
  `]
})
export class AppComponent implements OnInit {
  protected tutor       = inject(TutorService);
  protected onboarding  = inject(OnboardingService);
  protected voice       = inject(VoiceService);

  protected isAdminPage = signal(
    window.location.pathname.startsWith('/admin/discovery-batches')
  );

  @ViewChild('aboutRef') private aboutRef!: AboutComponent;

  ngOnInit(): void {
    if (window.location.pathname === '/reset') {
      const keys = [
        'ai_tutor_student_id',
        'ai_tutor_display_name',
        'ai_tutor_device_id',
        'ai_tutor_onboarding_done',
        'ai_tutor_guide_seen',
      ];
      keys.forEach(k => localStorage.removeItem(k));
      window.location.replace('/');
      return;
    }

    this.onboarding.init();
    if (!this.onboarding.isActive()) {
      this.tutor.init();
    }
  }

  protected chooseMode(mode: 'text' | 'voice'): void { this.tutor.setInteractionMode(mode); }
  protected goHome(): void  { this.onboarding.restart(); }
  protected goLearn(): void { this.onboarding.skip(); this.tutor.init(); }
  protected openAbout(): void { this.aboutRef?.open(); }
}
