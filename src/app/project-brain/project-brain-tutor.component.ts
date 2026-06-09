import {
  Component, inject, OnInit,
  ElementRef, ViewChild, AfterViewChecked, effect, signal, computed
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProjectBrainTutorService, ProjectBrainPhase } from './project-brain-tutor.service';
import { TutorService } from '../tutor.service';

interface TopicSummary {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
}

interface PortalStatus {
  currentPhase: string;
  sprintStatus: string;
  currentPriority: string;
  currentWork: string;
  nextMilestone: string;
  updatedAt: string;
}

const PHASE_LABELS: Record<ProjectBrainPhase, string> = {
  teach:     '📖 เรียนรู้',
  retrieval: '🔄 ต่อจากครั้งก่อน',
  guided:    '🧭 สร้างความเข้าใจ',
  ready:     '🎯 เตรียมอธิบาย',
  check:     '✅ ตรวจความเข้าใจ',
  reflect:   '💭 สะท้อนความคิด',
  grill:     '🔍 ฝึกคิด',
  summary:   '📋 สรุปความเข้าใจ',
};

@Component({
  selector: 'app-project-brain-tutor',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="pb-wrap">

      <!-- ══════════════ PORTAL ══════════════ -->
      @if (view() === 'portal') {

        <div class="pb-header">
          <span class="pb-icon">🧠</span>
          <div class="pb-header-text">
            <span class="pb-title">Project Brain Portal</span>
            <span class="pb-sub">Organizational Learning Interface</span>
          </div>
          <button class="pb-back-btn" (click)="exit()">← กลับ</button>
        </div>

        <!-- Tab Bar -->
        <div class="portal-tabs">
          <button class="portal-tab" [class.active]="portalTab() === 'understand'"
            (click)="portalTab.set('understand')">🧭 Understand</button>
          <button class="portal-tab" [class.active]="portalTab() === 'build'"
            (click)="portalTab.set('build')">🔨 Build</button>
          <button class="portal-tab" [class.active]="portalTab() === 'learn'"
            (click)="portalTab.set('learn')">📚 Learn</button>
          <button class="portal-tab" [class.active]="portalTab() === 'decide'"
            (click)="portalTab.set('decide')">⚖️ Decide</button>
          <button class="portal-tab" [class.active]="portalTab() === 'grow'"
            (click)="portalTab.set('grow')">🌱 Grow</button>
        </div>

        <!-- Tab: Understand -->
        @if (portalTab() === 'understand') {
          <div class="portal-body">
            <div class="overview-grid">

              <div class="ov-card ov-mission">
                <div class="ov-label">🎯 Mission</div>
                <div class="ov-value">สอนให้คิด ไม่ใช่สอนให้จำ</div>
                <div class="ov-sub">AI Tutor คณิตศาสตร์ ม.2 — ช่วยนักเรียนเรียนรู้อย่างอิสระผ่าน Socratic questioning</div>
              </div>

              <div class="ov-card ov-vision">
                <div class="ov-label">🌟 Vision</div>
                <div class="ov-quote">เมื่อเด็กๆ เติบโต ครอบครัวก็เติบโต<br>เมื่อครอบครัวเติบโต ชุมชนก็เติบโต<br>เมื่อชุมชนเติบโต ประเทศก็เติบโต</div>
              </div>

              <div class="ov-card ov-principles">
                <div class="ov-label">🧭 Core Principles</div>
                <div class="principle-list">
                  <div class="principle-item">
                    <span class="p-icon">🎓</span>
                    <div>
                      <div class="p-title">Teach, Don't Answer</div>
                      <div class="p-desc">AI guides through questions — never just gives answers</div>
                    </div>
                  </div>
                  <div class="principle-item">
                    <span class="p-icon">🔬</span>
                    <div>
                      <div class="p-title">Evidence Before Decisions</div>
                      <div class="p-desc">Every product decision is backed by real student sessions</div>
                    </div>
                  </div>
                  <div class="principle-item">
                    <span class="p-icon">🪴</span>
                    <div>
                      <div class="p-title">Build Less, Observe More</div>
                      <div class="p-desc">Small experiments, real observations, validated learning</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ov-card ov-phase">
                <div class="ov-label">🎯 Current Phase</div>
                <div class="ov-value">Demo V1.5</div>
                <div class="ov-sub">Feature Complete — กำลัง User Testing &amp; Evidence Collection</div>
              </div>

            </div>
          </div>
        }

        <!-- Tab: Build -->
        @if (portalTab() === 'build') {
          <div class="portal-body">
            <div class="overview-grid">

              <div class="ov-card ov-current-sprint">
                @if (portalStatusError()) {
                  <div class="ov-label">📋 Current Sprint</div>
                  <div class="sprint-fallback">ไม่สามารถโหลดข้อมูลได้</div>
                } @else if (portalStatus()) {
                  <div class="ov-label">📋 Current Sprint</div>
                  <div class="sprint-header">
                    <span [class]="'sprint-status-badge sprint-badge-' + portalStatus()!.sprintStatus.toLowerCase()">
                      {{ portalStatus()!.sprintStatus }}
                    </span>
                  </div>
                  <div class="ov-value">{{ portalStatus()!.currentPriority }}</div>
                  <div class="ov-sub">{{ portalStatus()!.currentWork }}</div>
                  <div class="sprint-updated">Updated: {{ portalStatus()!.updatedAt }}</div>
                } @else {
                  <div class="ov-label">📋 Current Sprint</div>
                  <div class="sprint-loading">กำลังโหลด…</div>
                }
              </div>

              <div class="ov-card ov-roadmap">
                <div class="ov-label">🗺️ Roadmap</div>
                <div class="roadmap-steps">
                  <div class="rm-step rm-done">✅ Phase 1 — MVP Demo V1.5</div>
                  <div class="rm-step rm-active">🔄 Phase 2 — Team Portal (H14)</div>
                  <div class="rm-step rm-future">⬜ Phase 3 — Standalone Platform</div>
                </div>
              </div>

              <div class="ov-card ov-arch">
                <div class="ov-label">⚙️ Architecture</div>
                <div class="arch-stack">
                  <div class="arch-layer arch-ui">Angular UI</div>
                  <div class="arch-arrow">↓</div>
                  <div class="arch-layer arch-api">ASP.NET Core API</div>
                  <div class="arch-arrow">↓</div>
                  <div class="arch-layer arch-engine">Learning Flow Engine ← core</div>
                  <div class="arch-arrow">↓</div>
                  <div class="arch-layer arch-llm">LLM Provider (Claude)</div>
                </div>
              </div>

              <div class="ov-card ov-tutor-entry">
                <div class="ov-label">🧠 Brain Tutor</div>
                <div class="ov-sub" style="margin-bottom:12px">สอนก่อน → AI Grill → สร้างหลักฐานความเข้าใจ</div>
                @if (topicsLoading()) {
                  <div class="topic-loading">กำลังโหลด topics…</div>
                } @else {
                  <div class="topic-grid-mini">
                    @for (t of topics(); track t.id) {
                      <button class="topic-chip" (click)="selectTopic(t.id)">
                        <span>{{ t.emoji }}</span> {{ t.title }}
                      </button>
                    }
                  </div>
                }
              </div>

            </div>
          </div>
        }

        <!-- Tab: Learn -->
        @if (portalTab() === 'learn') {
          <div class="portal-body">
            <div class="overview-grid">

              <div class="ov-card ov-discoveries">
                <div class="ov-label">🔍 Recent Discoveries</div>
                <div class="disc-list">
                  <div class="disc-item">
                    <span class="disc-badge">D007</span>
                    <div>
                      <div class="disc-title">PassiveGrill</div>
                      <div class="disc-desc">นักเรียนแสดงความเข้าใจผ่านการอธิบายโดยไม่รู้ตัว</div>
                    </div>
                  </div>
                  <div class="disc-item">
                    <span class="disc-badge">D008</span>
                    <div>
                      <div class="disc-title">Inline Readiness Check</div>
                      <div class="disc-desc">Quick-reply buttons ลด friction ในการแสดง readiness</div>
                    </div>
                  </div>
                  <div class="disc-item">
                    <span class="disc-badge">D010</span>
                    <div>
                      <div class="disc-title">Discovery Harness</div>
                      <div class="disc-desc">Structure สำหรับ capture &amp; validate discoveries อย่างเป็นระบบ</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ov-card ov-sessions">
                <div class="ov-label">📊 Student Sessions</div>
                <div class="ov-sub" style="margin-bottom:12px">บันทึก evidence จากการทดสอบจริงกับนักเรียน</div>
                <a href="/admin/discovery-batches" class="disc-btn-sm">เปิด Discovery Batches →</a>
              </div>

              <div class="ov-card ov-lessons">
                <div class="ov-label">💡 Lessons Learned</div>
                <div class="lesson-list">
                  <div class="lesson-item">Teaching Flow &gt; AI Capability — โครงสร้างสำคัญกว่า model</div>
                  <div class="lesson-item">นักเรียนต้องการ hint ที่ถามกลับ ไม่ใช่คำตอบ</div>
                  <div class="lesson-item">Parent Summary สร้าง trust loop กับผู้ปกครอง</div>
                </div>
              </div>

              <div class="ov-card ov-questions">
                <div class="ov-label">❓ Open Questions</div>
                <div class="lesson-list">
                  <div class="lesson-item">H14: Project Brain menu เป็น Portal MVP ได้จริงไหม?</div>
                  <div class="lesson-item">นักเรียนต้องการ session ต่อเนื่องกี่ครั้งถึงเห็น learning?</div>
                  <div class="lesson-item">Parent involvement ส่งผลต่อ student motivation อย่างไร?</div>
                </div>
              </div>

              <div class="ov-card ov-portal-link">
                <div class="ov-label">🔗 Share Portal</div>
                <div class="portal-url">/?pb</div>
                <div class="ov-sub">Link สำหรับแชร์กับ team members และ contributors</div>
              </div>

            </div>
          </div>
        }

        <!-- Tab: Decide -->
        @if (portalTab() === 'decide') {
          <div class="portal-body">
            <div class="overview-grid">

              <div class="ov-card ov-hypothesis">
                <div class="ov-label">💡 Active Hypothesis</div>
                <div class="ov-value">H14</div>
                <div class="ov-sub">Project Brain Menu inside AI-Math-Tutor อาจเป็น MVP แรกของ Project Brain Portal</div>
                <div class="hyp-status">
                  <span class="hyp-badge hyp-interesting">Interesting</span>
                  <span class="hyp-badge hyp-unvalidated">Not Validated</span>
                </div>
              </div>

              <div class="ov-card ov-risks">
                <div class="ov-label">⚠️ Current Risks</div>
                <div class="risk-list">
                  <div class="risk-item risk-med">
                    <span class="risk-dot"></span>
                    <div>
                      <div class="risk-title">Portal Complexity</div>
                      <div class="risk-desc">Portal menu อาจซับซ้อนเกินไปสำหรับ developer เดียว</div>
                    </div>
                  </div>
                  <div class="risk-item risk-med">
                    <span class="risk-dot"></span>
                    <div>
                      <div class="risk-title">User Overwhelm</div>
                      <div class="risk-desc">Internal information อาจ overwhelm ผู้เยี่ยมชมภายนอก</div>
                    </div>
                  </div>
                  <div class="risk-item risk-low">
                    <span class="risk-dot risk-low-dot"></span>
                    <div>
                      <div class="risk-title">Content Freshness</div>
                      <div class="risk-desc">Portal content อาจล้าสมัยถ้าไม่มี update workflow</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="ov-card ov-tradeoffs">
                <div class="ov-label">⚖️ Key Trade-offs</div>
                <div class="tradeoff-list">
                  <div class="tradeoff-item">
                    <div class="tradeoff-label">Teaching Flow vs AI Capability</div>
                    <div class="tradeoff-choice">✅ เลือก: Teaching Flow — โครงสร้างสำคัญกว่า model capability</div>
                  </div>
                  <div class="tradeoff-item">
                    <div class="tradeoff-label">Build Portal Now vs Validate First</div>
                    <div class="tradeoff-choice">✅ เลือก: Validate First — ใช้ Project Brain menu ทดสอบ concept</div>
                  </div>
                </div>
              </div>

              <div class="ov-card ov-next-decision">
                <div class="ov-label">🔮 Next Decision Needed</div>
                <div class="ov-sub">หลัง User Testing: ขยาย Portal Lite หรือ focus on Teaching Framework?</div>
              </div>

            </div>
          </div>
        }

        <!-- Tab: Grow -->
        @if (portalTab() === 'grow') {
          <div class="portal-body">
            <div class="overview-grid">

              <div class="ov-card ov-partner-phil">
                <div class="ov-label">🤝 Partnership Philosophy</div>
                <div class="ov-quote">"Do we believe in the same future?"</div>
                <div class="ov-sub" style="margin-top:8px">Partnership ไม่ได้เริ่มจากเงิน — เริ่มจาก shared values และ shared impact</div>
              </div>

              <div class="ov-card ov-partners">
                <div class="ov-label">🌐 Partner Categories</div>
                <div class="partner-grid">
                  <div class="partner-cat">
                    <span class="pcat-icon">🏫</span>
                    <span class="pcat-label">Education</span>
                    <span class="pcat-desc">Schools, Teachers, Universities</span>
                  </div>
                  <div class="partner-cat">
                    <span class="pcat-icon">🏘️</span>
                    <span class="pcat-label">Community</span>
                    <span class="pcat-desc">NGOs, Foundations, Networks</span>
                  </div>
                  <div class="partner-cat">
                    <span class="pcat-icon">💻</span>
                    <span class="pcat-label">Technology</span>
                    <span class="pcat-desc">AI Orgs, Open Source, Devs</span>
                  </div>
                </div>
              </div>

              <div class="ov-card ov-current-focus">
                <div class="ov-label">📍 Current Stage</div>
                <div class="focus-list">
                  <div class="focus-item focus-yes">✅ Vision Validation</div>
                  <div class="focus-item focus-yes">✅ Community Building</div>
                  <div class="focus-item focus-yes">✅ Relationship Development</div>
                  <div class="focus-item focus-no">⏸️ Active Partner Acquisition (ยังไม่ถึงเวลา)</div>
                  <div class="focus-item focus-no">⏸️ Commercial Expansion (ยังไม่ถึงเวลา)</div>
                </div>
              </div>

              <div class="ov-card ov-join">
                <div class="ov-label">💌 Join The Mission</div>
                <div class="ov-sub" style="margin-bottom:12px">สนใจร่วมสร้างอนาคตการศึกษาไทย?</div>
                <a href="/?pb" class="disc-btn-sm">🧠 เข้า Project Brain Portal</a>
              </div>

            </div>
          </div>
        }

      <!-- ══════════════ CHAT ══════════════ -->
      } @else {

        <!-- Header -->
        <div class="pb-header">
          <span class="pb-icon">🧠</span>
          <div class="pb-header-text">
            <span class="pb-title">{{ currentTopicLabel }}</span>
            <span class="pb-sub">{{ phaseLabel }}</span>
          </div>
          <button class="pb-back-btn" (click)="backToTopics()">← Topics</button>
          <button class="pb-back-btn" (click)="exit()">✕ ออก</button>
        </div>

        <!-- Messages -->
        <div class="pb-messages" #msgEl>
          @for (msg of pb.messages(); track $index) {
            <div class="pb-row" [class.pb-user-row]="msg.role === 'user'">
              @if (msg.role === 'assistant') {
                <div class="pb-avatar">🧠</div>
              }
              <div class="pb-bubble"
                [class.pb-ai]="msg.role === 'assistant'"
                [class.pb-user]="msg.role === 'user'">
                <pre class="pb-text">{{ msg.content }}</pre>
              </div>
              @if (msg.role === 'user') {
                <div class="pb-avatar">🧑</div>
              }
            </div>
          }

          @if (showReadinessButtons()) {
            <div class="pb-readiness">
              <button class="pb-ri-btn pb-ri-confused" (click)="sendReadiness('😕 ยังงงอยู่')">
                😕 ยังงงอยู่
              </button>
              <button class="pb-ri-btn pb-ri-starting" (click)="sendReadiness('🙂 เริ่มเห็นภาพแล้ว')">
                🙂 เริ่มเห็นภาพแล้ว
              </button>
              <button class="pb-ri-btn pb-ri-ready" (click)="sendReadiness('😄 เห็นภาพแล้ว')">
                😄 เห็นภาพแล้ว
              </button>
            </div>
          }

          @if (pb.loading()) {
            <div class="pb-row">
              <div class="pb-avatar">🧠</div>
              <div class="pb-bubble pb-ai typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          }
        </div>

        <!-- Summary banner -->
        @if (pb.suggestSummary() && !pb.loading() && pb.phase() !== 'summary') {
          <div class="pb-suggest">
            <span>พร้อมดูสรุปความเข้าใจแล้วไหม? 😊</span>
            <button class="pb-suggest-btn" (click)="requestSummary()">
              📋 ดูสรุปความเข้าใจ
            </button>
          </div>
        }

        <!-- Input -->
        <div class="pb-input-bar">
          <input
            #inputEl
            class="pb-input"
            type="text"
            placeholder="พิมพ์ความคิดของคุณ..."
            [(ngModel)]="inputText"
            (keydown.enter)="send()"
            [disabled]="pb.loading()"
          />
          <button
            class="pb-send-btn"
            (click)="send()"
            [disabled]="pb.loading() || !inputText.trim()"
          >
            ส่ง ➤
          </button>
        </div>

      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .pb-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      background: white;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    /* ── Header ── */
    .pb-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: linear-gradient(90deg, #1e40af, #3b82f6);
      flex-shrink: 0;
    }

    .pb-icon { font-size: 22px; }

    .pb-header-text {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .pb-title {
      font-size: 14px;
      font-weight: 700;
      color: white;
    }

    .pb-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.8);
    }

    .pb-back-btn {
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.35);
      color: white;
      border-radius: 16px;
      padding: 5px 12px;
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .pb-back-btn:hover { background: rgba(255,255,255,0.28); }

    /* ── Portal Tabs ── */
    .portal-tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
    }

    .portal-tab {
      flex: 1;
      padding: 10px 8px;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      color: #64748b;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s, background 0.15s;
    }
    .portal-tab:hover { color: #1e40af; background: #eff6ff; }
    .portal-tab.active {
      color: #1e40af;
      border-bottom-color: #2563eb;
      font-weight: 700;
      background: white;
    }

    /* ── Portal Body ── */
    .portal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 20px 32px;
    }

    /* ── Overview Grid ── */
    .overview-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ov-card {
      padding: 14px 16px;
      border-radius: var(--radius);
      border: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .ov-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    .ov-value {
      font-size: 18px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.2;
    }

    .ov-sub {
      font-size: 12.5px;
      color: #64748b;
      margin-top: 3px;
    }

    .ov-phase    { border-left: 3px solid #2563eb; }
    .ov-hypothesis { border-left: 3px solid #8b5cf6; }
    .ov-discoveries { border-left: 3px solid #059669; }
    .ov-principle { border-left: 3px solid #f59e0b; }
    .ov-links    { border-left: 3px solid #64748b; }

    .ov-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .ov-tag {
      font-size: 12px;
      padding: 3px 10px;
      background: #d1fae5;
      color: #065f46;
      border-radius: 20px;
      font-weight: 600;
    }

    .ov-quote {
      font-size: 13.5px;
      color: #92400e;
      font-style: italic;
      line-height: 1.7;
    }

    .ov-link-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .ov-link {
      font-size: 13px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }
    .ov-link:hover { text-decoration: underline; }

    /* ── Color coding overrides for new tabs ── */
    .ov-mission      { border-left: 3px solid #2563eb; }
    .ov-vision       { border-left: 3px solid #7c3aed; }
    .ov-principles   { border-left: 3px solid #0891b2; }
    .ov-roadmap      { border-left: 3px solid #2563eb; }
    .ov-arch         { border-left: 3px solid #475569; }
    .ov-tutor-entry  { border-left: 3px solid #8b5cf6; }
    .ov-sessions     { border-left: 3px solid #2563eb; }
    .ov-lessons      { border-left: 3px solid #059669; }
    .ov-questions    { border-left: 3px solid #f59e0b; }
    .ov-risks        { border-left: 3px solid #dc2626; }
    .ov-tradeoffs    { border-left: 3px solid #7c3aed; }
    .ov-next-decision{ border-left: 3px solid #f59e0b; }
    .ov-partner-phil { border-left: 3px solid #059669; }
    .ov-partners     { border-left: 3px solid #2563eb; }
    .ov-current-focus{ border-left: 3px solid #0891b2; }
    .ov-join         { border-left: 3px solid #8b5cf6; }

    /* ── Principles list ── */
    .principle-list { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
    .principle-item { display: flex; align-items: flex-start; gap: 10px; }
    .p-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .p-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .p-desc  { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 2px; }

    /* ── Roadmap ── */
    .roadmap-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
    .rm-step { font-size: 13px; padding: 6px 10px; border-radius: 6px; }
    .rm-done   { background: #f0fdf4; color: #166534; }
    .rm-active { background: #eff6ff; color: #1e40af; font-weight: 600; }
    .rm-future { background: #f8fafc; color: #94a3b8; }

    /* ── Architecture stack ── */
    .arch-stack  { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; margin-top: 6px; }
    .arch-layer  { font-size: 12px; padding: 5px 10px; border-radius: 6px; font-weight: 600; }
    .arch-arrow  { font-size: 11px; color: #94a3b8; padding-left: 10px; }
    .arch-ui     { background: #eff6ff; color: #1e40af; }
    .arch-api    { background: #f0fdf4; color: #166534; }
    .arch-engine { background: #fef3c7; color: #92400e; }
    .arch-llm    { background: #faf5ff; color: #6b21a8; }

    /* ── Topic mini grid (Build tab) ── */
    .topic-loading { text-align: center; color: #94a3b8; padding: 20px; }
    .topic-grid-mini { display: flex; flex-direction: column; gap: 6px; }
    .topic-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s, background 0.15s;
    }
    .topic-chip:hover { border-color: #3b82f6; background: #eff6ff; color: #1e40af; }

    /* ── Discovery list (Learn tab) ── */
    .disc-list  { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
    .disc-item  { display: flex; align-items: flex-start; gap: 10px; }
    .disc-badge {
      font-size: 11px; font-weight: 700; padding: 3px 8px;
      background: #d1fae5; color: #065f46; border-radius: 20px;
      flex-shrink: 0; white-space: nowrap; margin-top: 2px;
    }
    .disc-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .disc-desc  { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 2px; }

    .disc-btn-sm {
      display: inline-block;
      padding: 8px 18px;
      background: #1e40af;
      color: white;
      border-radius: var(--radius-sm);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.15s;
    }
    .disc-btn-sm:hover { background: #1e3a8a; }

    /* ── Lessons / Open Questions ── */
    .lesson-list { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
    .lesson-item {
      font-size: 13px; color: #334155; line-height: 1.55;
      padding-left: 12px; border-left: 2px solid #cbd5e1;
    }

    /* ── Risk list ── */
    .risk-list { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
    .risk-item { display: flex; align-items: flex-start; gap: 10px; }
    .risk-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #f97316; flex-shrink: 0; margin-top: 4px;
    }
    .risk-low-dot { background: #facc15; }
    .risk-title { font-size: 13px; font-weight: 700; color: #1e293b; }
    .risk-desc  { font-size: 12px; color: #64748b; margin-top: 2px; line-height: 1.5; }

    /* ── Trade-offs ── */
    .tradeoff-list  { display: flex; flex-direction: column; gap: 12px; margin-top: 6px; }
    .tradeoff-item  {}
    .tradeoff-label  { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 3px; }
    .tradeoff-choice { font-size: 13px; color: #166534; background: #f0fdf4; padding: 5px 10px; border-radius: 6px; }

    /* ── Hypothesis status badges ── */
    .hyp-status { display: flex; gap: 6px; margin-top: 8px; }
    .hyp-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
    .hyp-interesting  { background: #fef3c7; color: #92400e; }
    .hyp-unvalidated  { background: #fee2e2; color: #991b1b; }

    /* ── Partner grid ── */
    .partner-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 8px; }
    .partner-cat  { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; }
    .pcat-icon  { font-size: 20px; }
    .pcat-label { font-size: 12px; font-weight: 700; color: #1e293b; }
    .pcat-desc  { font-size: 10.5px; color: #64748b; line-height: 1.4; }

    /* ── Focus list (Grow tab) ── */
    .focus-list { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
    .focus-item { font-size: 13px; line-height: 1.5; }
    .focus-yes  { color: #166534; }
    .focus-no   { color: #94a3b8; }

    /* ── Topic Selector (kept for chat backToTopics compatibility) ── */
    .topic-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 20px 32px;
    }

    .topic-intro {
      font-size: 13.5px;
      color: #475569;
      margin: 0 0 20px;
      line-height: 1.6;
      text-align: center;
    }

    /* ── Chat ── */
    .pb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 18px 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scroll-behavior: smooth;
    }

    .pb-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    .pb-user-row { flex-direction: row-reverse; }

    .pb-avatar {
      font-size: 22px;
      width: 34px;
      text-align: center;
      flex-shrink: 0;
    }

    .pb-bubble {
      max-width: 72%;
      padding: 12px 16px;
      border-radius: var(--radius);
      font-size: 14.5px;
      line-height: 1.65;
    }

    .pb-ai {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-bottom-left-radius: 4px;
    }

    .pb-user {
      background: var(--color-user-bubble);
      border: 1px solid var(--color-user-border);
      border-bottom-right-radius: 4px;
    }

    .pb-text {
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0;
    }

    .typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 14px 18px;
    }
    .typing span {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #3b82f6;
      animation: bounce 1.2s infinite;
    }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    .pb-suggest {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: #eff6ff;
      border-top: 1px solid #bfdbfe;
      font-size: 14px;
      color: #1e40af;
      flex-shrink: 0;
    }

    .pb-suggest-btn {
      padding: 7px 18px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 16px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .pb-suggest-btn:hover { background: #1e3a8a; }

    .pb-input-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      flex-shrink: 0;
    }

    .pb-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #cbd5e1;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14.5px;
      outline: none;
      transition: border-color 0.2s;
    }
    .pb-input:focus { border-color: #3b82f6; }

    .pb-send-btn {
      padding: 10px 20px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .pb-send-btn:hover:not(:disabled) { background: #1e3a8a; }
    .pb-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Readiness Quick-Reply ── */
    .pb-readiness {
      padding-left: 42px;
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      animation: fadeSlideIn 0.2s ease;
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .pb-ri-btn {
      padding: 8px 14px;
      border-radius: 20px;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1.5px solid;
      transition: background 0.15s, transform 0.1s, box-shadow 0.1s;
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
    }
    .pb-ri-btn:hover  { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .pb-ri-btn:active { transform: translateY(0); box-shadow: none; }
    .pb-ri-confused { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
    .pb-ri-confused:hover { background: #fee2e2; }
    .pb-ri-starting { background: #fffbeb; color: #92400e; border-color: #fde68a; }
    .pb-ri-starting:hover { background: #fef3c7; }
    .pb-ri-ready    { background: #f0fdf4; color: #15803d; border-color: #86efac; }
    .pb-ri-ready:hover    { background: #dcfce7; }

    /* ── Current Sprint card ── */
    .ov-current-sprint { border-left: 3px solid #f97316; }
    .sprint-header { margin-bottom: 8px; }
    .sprint-status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid transparent;
    }
    .sprint-badge-ready_for_coding { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
    .sprint-badge-in_progress       { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .sprint-badge-done               { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .sprint-badge-testing            { background: #faf5ff; color: #6b21a8; border-color: #e9d5ff; }
    .sprint-badge-blocked            { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
    .sprint-badge-planning           { background: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
    .sprint-updated  { font-size: 11px; color: #94a3b8; margin-top: 6px; }
    .sprint-loading  { font-size: 13px; color: #94a3b8; font-style: italic; }
    .sprint-fallback { font-size: 13px; color: #b91c1c; }

    /* ── Portal link card ── */
    .ov-portal-link { border-left: 3px solid #2563eb; }
    .portal-url {
      font-size: 16px;
      font-weight: 800;
      color: #1e40af;
      font-family: monospace;
      margin: 6px 0 4px;
    }

    @media (max-width: 640px) {
      .pb-bubble { max-width: 85%; font-size: 14px; }
      .partner-grid { grid-template-columns: 1fr 1fr; }
      .portal-tab { font-size: 11px; padding: 9px 4px; }
    }
  `]
})
export class ProjectBrainTutorComponent implements OnInit, AfterViewChecked {
  @ViewChild('msgEl')  private msgEl!: ElementRef<HTMLDivElement>;
  @ViewChild('inputEl') private inputEl?: ElementRef<HTMLInputElement>;

  protected pb    = inject(ProjectBrainTutorService);
  private   tutor = inject(TutorService);
  private   http  = inject(HttpClient);

  protected inputText    = '';
  protected view         = signal<'portal' | 'chat'>('portal');
  protected portalTab    = signal<'understand' | 'build' | 'learn' | 'decide' | 'grow'>('understand');
  protected topics       = signal<TopicSummary[]>([]);
  protected topicsLoading = signal(true);
  protected selectedTopic      = signal<TopicSummary | null>(null);
  protected portalStatus       = signal<PortalStatus | null>(null);
  protected portalStatusError  = signal(false);
  protected readonly showReadinessButtons = computed(() => {
    const msgs = this.pb.messages();
    return (
      this.pb.phase() === 'guided' &&
      !this.pb.loading() &&
      msgs.length > 0 &&
      msgs[msgs.length - 1].role === 'assistant'
    );
  });

  protected get phaseLabel(): string {
    return PHASE_LABELS[this.pb.phase()] ?? '';
  }

  protected get currentTopicLabel(): string {
    return this.selectedTopic()
      ? `${this.selectedTopic()!.emoji} ${this.selectedTopic()!.title}`
      : 'Project Brain';
  }

  constructor() {
    effect(() => {
      this.pb.messages();
      this.scrollToBottom();
      if (!this.pb.loading()) {
        setTimeout(() => this.inputEl?.nativeElement.focus());
      }
    });
  }

  ngOnInit(): void {
    this._loadTopics();
    this._loadPortalStatus();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private async _loadTopics(): Promise<void> {
    this.topicsLoading.set(true);
    try {
      const topics = await firstValueFrom(
        this.http.get<TopicSummary[]>('/api/project-brain/topics')
      );
      this.topics.set(topics);
    } catch {
      // Fallback: show static list so UI never breaks
      this.topics.set([
        { id: 'vision',               emoji: '🧭', title: 'Vision & Teaching Philosophy', subtitle: 'ทำไมเราถึงสร้างสิ่งนี้' },
        { id: 'understanding-engine', emoji: '🧠', title: 'Understanding Engine',          subtitle: 'ความเข้าใจที่ซ่อนอยู่ → หลักฐาน' },
        { id: 'learning-flow-engine', emoji: '⚙️', title: 'Learning Flow Engine',          subtitle: 'โครงสร้างที่เปลี่ยน LLM ให้เป็นครู' },
        { id: 'discoveries',          emoji: '🔍', title: 'Key Discoveries',               subtitle: 'Insight สำคัญที่นำทาง product' },
        { id: 'decisions',            emoji: '✅', title: 'Key Decisions',                 subtitle: 'ทำไมถึงตัดสินใจแบบนี้' },
      ]);
    } finally {
      this.topicsLoading.set(false);
    }
  }

  private _loadPortalStatus(): void {
    this.http.get<PortalStatus>('/api/portal/status').subscribe({
      next:  s => this.portalStatus.set(s),
      error: () => this.portalStatusError.set(true),
    });
  }

  protected selectTopic(topicId: string): void {
    const topic = this.topics().find(t => t.id === topicId) ?? null;
    this.selectedTopic.set(topic);
    this.view.set('chat');
    this.pb.start(topicId);
    setTimeout(() => this.inputEl?.nativeElement.focus());
  }

  protected backToTopics(): void {
    this.pb.saveEvidence();
    this.selectedTopic.set(null);
    this.view.set('portal');
    this.portalTab.set('build');
  }

  protected send(): void {
    const text = this.inputText.trim();
    if (!text) return;
    this.inputText = '';
    this.pb.send(text);
  }

  protected sendReadiness(text: string): void {
    this.pb.send(text);
  }

  protected requestSummary(): void {
    this.pb.saveEvidence();
    this.pb.requestSummary();
  }

  protected exit(): void {
    this.pb.saveEvidence();
    this.tutor.exitProjectBrainMode();
  }

  private scrollToBottom(): void {
    const el = this.msgEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
