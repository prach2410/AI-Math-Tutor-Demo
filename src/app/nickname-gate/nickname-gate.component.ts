import { Component, inject, signal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentProfileService } from '../student-profile/student-profile.service';

@Component({
  selector: 'app-nickname-gate',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .gate-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }
    .gate-card {
      background: #fff;
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      text-align: center;
    }
    .gate-emoji { font-size: 56px; margin-bottom: 16px; }
    .gate-title { font-size: 22px; font-weight: 700; color: #1e40af; margin-bottom: 8px; }
    .gate-sub { font-size: 15px; color: #64748b; margin-bottom: 28px; line-height: 1.5; }
    .gate-input {
      width: 100%;
      padding: 14px 16px;
      font-size: 18px;
      border: 2px solid #bfdbfe;
      border-radius: 12px;
      outline: none;
      text-align: center;
      box-sizing: border-box;
      margin-bottom: 16px;
      transition: border-color 0.15s;
    }
    .gate-input:focus { border-color: #3b82f6; }
    .gate-btn {
      width: 100%;
      padding: 14px;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-size: 17px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    .gate-btn:disabled { background: #93c5fd; cursor: not-allowed; }
    .gate-btn:not(:disabled):hover { background: #1d4ed8; }
    .gate-note { font-size: 12px; color: #94a3b8; margin-top: 14px; }
  `],
  template: `
    <div class="gate-overlay">
      <div class="gate-card">
        <div class="gate-emoji">👋</div>
        <div class="gate-title">สวัสดีครับ!</div>
        <div class="gate-sub">
          ก่อนเริ่มเรียน น้องอยากให้เราเรียกว่าอะไรดีครับ?<br>
          ใส่ชื่อเล่นได้เลย ไม่ต้องใส่ชื่อจริง 😊
        </div>
        <input
          class="gate-input"
          type="text"
          placeholder="ชื่อเล่น เช่น ปลื้ม, มายด์"
          [(ngModel)]="nickname"
          (keyup.enter)="confirm()"
          maxlength="30"
          autofocus
        />
        <button class="gate-btn" [disabled]="!canConfirm()" (click)="confirm()">
          เริ่มเลยครับ 🚀
        </button>
        <div class="gate-note">จำชื่อเล่นไว้ให้ ไม่ต้องใส่ทุกครั้ง</div>
      </div>
    </div>
  `,
})
export class NicknameGateComponent {
  private studentProfile = inject(StudentProfileService);
  confirmed = output<void>();

  nickname = '';

  canConfirm(): boolean {
    return /\p{L}/u.test(this.nickname.trim());
  }

  confirm(): void {
    if (!this.canConfirm()) return;
    this.studentProfile.setDisplayName(this.nickname.trim());
    this.confirmed.emit();
  }
}
