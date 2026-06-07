import { Component, inject, OnInit, ViewChild, signal, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FreeTalkComponent } from './free-talk/free-talk.component';
import { ProjectBrainTutorComponent } from './project-brain/project-brain-tutor.component';
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
    ProjectBrainTutorComponent,
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
    FormsModule,
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
            <p class="header-sub">{{ tutor.inProjectBrainMode() ? 'Project Brain Tutor' : tutor.scenario().title }}</p>
          </div>
          <div class="header-right">
            <nav class="scenario-nav">
              @for (s of tutor.scenarios; track s.id) {
                <button
                  class="scenario-btn"
                  [class.active]="tutor.scenario().id === s.id && !tutor.inProjectBrainMode()"
                  [disabled]="tutor.loading()"
                  (click)="tutor.selectScenario(s.id)"
                >
                  <span>{{ s.icon }}</span>
                  <span>{{ s.title }}</span>
                </button>
              }
              <button
                class="scenario-btn pb-btn"
                [class.active]="tutor.inProjectBrainMode()"
                [disabled]="tutor.loading()"
                (click)="enterProjectBrain()"
              >
                <span>🧠</span>
                <span>Project Brain</span>
              </button>
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
          } @else if (tutor.inProjectBrainMode()) {
            <app-project-brain-tutor />
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
        @if (showNotesSheet()) {
          <div class="notes-backdrop" (click)="showNotesSheet.set(false)"></div>
        }
        <aside class="side-section" [class.sheet-open]="showNotesSheet()">
          <div class="sheet-header">
            <span class="sheet-title">📋 บันทึกและสรุป</span>
            <button class="sheet-close-btn" (click)="showNotesSheet.set(false)">✕</button>
          </div>
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
        <button class="nav-item" [class.active]="!onboarding.isActive() && !showNotesSheet()" (click)="goLearn()">
          <span class="nav-icon">📚</span>
          <span class="nav-label">เรียน</span>
        </button>
        <button class="nav-item" [class.active]="showNotesSheet()" (click)="toggleNotesSheet()">
          <span class="nav-icon">📋</span>
          <span class="nav-label">บันทึก</span>
        </button>
        <a class="nav-item" href="https://forms.gle/q9eV47ktwTvXhT2NA" target="_blank" rel="noopener">
          <span class="nav-icon">💬</span>
          <span class="nav-label">ความคิดเห็น</span>
        </a>
      </nav>
    </div>

    <!-- Project Brain password dialog -->
    @if (showPbDialog()) {
      <div class="pb-overlay" (click)="cancelPbDialog()">
        <div class="pb-dialog" (click)="$event.stopPropagation()">
          <div class="pb-dialog-icon">🧠</div>
          <h3 class="pb-dialog-title">Project Brain</h3>
          <p class="pb-dialog-desc">กรุณาใส่รหัสเพื่อเข้าใช้งาน</p>
          <input
            #pbInput
            type="password"
            class="pb-dialog-input"
            [(ngModel)]="pbPassword"
            placeholder="รหัสผ่าน"
            (keydown.enter)="confirmPbDialog()"
          />
          @if (pbError()) {
            <p class="pb-dialog-error">รหัสไม่ถูกต้อง กรุณาลองใหม่</p>
          }
          <div class="pb-dialog-actions">
            <button class="pb-btn-cancel" (click)="cancelPbDialog()">ยกเลิก</button>
            <button class="pb-btn-confirm" (click)="confirmPbDialog()">เข้าใช้งาน</button>
          </div>
        </div>
      </div>
    }
    }
  `,
  styles: [`
    .layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
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
    .pb-btn { border-color: rgba(147,197,253,0.5); }
    .pb-btn.active { background: #1e40af; color: white; border-color: #1e40af; }

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

    .sheet-header { display: none; }
    .notes-backdrop { display: none; }

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
        height: calc(100dvh - 56px - env(safe-area-inset-bottom, 0px) - 60px);
        min-height: 360px;
      }

      /* Hide side panels — accessible via 📋 บันทึก tab */
      .side-section {
        display: none;
      }

      /* Bottom sheet when open */
      .side-section.sheet-open {
        display: flex;
        position: fixed;
        bottom: calc(56px + env(safe-area-inset-bottom, 0px));
        left: 0;
        right: 0;
        height: 72vh;
        z-index: 51;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.18);
        background: var(--color-bg);
        overflow-y: auto;
        padding: 0 12px 16px;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
        max-width: none;
        animation: sheetUp 0.22s ease-out;
      }
      @keyframes sheetUp {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }

      .notes-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.35);
        z-index: 50;
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
        min-height: 100px;
        height: auto;
      }

      /* Sheet header */
      .sheet-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 4px 8px;
        position: sticky;
        top: 0;
        background: var(--color-bg);
        z-index: 1;
        flex-shrink: 0;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 4px;
      }
      .sheet-title { font-size: 14px; font-weight: 700; color: #1e293b; }
      .sheet-close-btn {
        width: 32px; height: 32px;
        border-radius: 50%;
        border: none;
        background: #f1f5f9;
        color: #64748b;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
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
        padding-bottom: env(safe-area-inset-bottom, 8px);
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

      /* Pad content above bottom nav (56px nav + safe area for iPhone home indicator) */
      .layout { padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px)); }
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
  protected showNotesSheet = signal(false);
  private readonly PB_KEY = 'adm2026@';
  private pbUnlocked = false;

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

  protected enterProjectBrain(): void {
    if (!this.pbUnlocked) {
      const input = window.prompt('กรุณาใส่รหัสเพื่อเข้า Project Brain:');
      if (input !== this.PB_KEY) {
        if (input !== null) window.alert('รหัสไม่ถูกต้อง');
        return;
      }
      this.pbUnlocked = true;
    }
    this.onboarding.skip();
    this.tutor.enterProjectBrainMode();
  }
  protected chooseMode(mode: 'text' | 'voice'): void { this.tutor.setInteractionMode(mode); }
  protected goHome(): void  { this.showNotesSheet.set(false); this.onboarding.restart(); }
  protected goLearn(): void { this.showNotesSheet.set(false); this.onboarding.skip(); this.tutor.init(); }
  protected openAbout(): void { this.aboutRef?.open(); }
  protected toggleNotesSheet(): void { this.showNotesSheet.update(v => !v); }
}
