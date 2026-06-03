import { Injectable, signal } from '@angular/core';

const DEVICE_ID_KEY = 'ai_tutor_device_id';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private _deviceId = signal(this.loadOrCreateDeviceId());

  readonly deviceId = this._deviceId.asReadonly();

  private loadOrCreateDeviceId(): string {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  }
}
