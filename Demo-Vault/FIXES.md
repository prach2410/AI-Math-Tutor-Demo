# สรุปการแก้ไข AI Math Tutor Demo

## 1. เปลี่ยน API Endpoint

**ไฟล์:** `src/app/tutor.service.ts`

```ts
// เดิม
const API = 'http://localhost:5000/api/learning';

// แก้เป็น
const API = '/api/learning';
```

---

## 2. ตั้งค่า Railway Deployment

**ไฟล์:** `railway.toml` *(สร้างใหม่)*

```toml
[build]
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
```

---

## 3. แทนที่ `serve` ด้วย Express Proxy Server

**ปัญหา:** `npm start` เดิมรัน `ng serve` ซึ่งเป็น dev server และเกิด CORS error เมื่อ deploy บน Railway

**ไฟล์:** `server.js` *(สร้างใหม่)*

```js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use(createProxyMiddleware({
  target: 'https://ai-math-tutor-api-demo-production.up.railway.app',
  changeOrigin: true,
  pathFilter: '/api',   // ← สำคัญ: ต้องใช้ pathFilter ไม่ใช่ mount path
}));

app.use(express.static('dist/frontend/browser'));
```

**ไฟล์:** `package.json`

```json
"start": "node server.js",
"dev": "ng serve"
```

---

## 4. บทเรียนสำคัญ

| ปัญหา | สาเหตุ | วิธีแก้ |
|---|---|---|
| Build fail บน Railway | `package-lock.json` ไม่ sync กับ `package.json` | รัน `npm install` แล้ว commit lock file |
| CORS error | Browser block cross-origin request | ใช้ Express proxy แทน static server |
| 404 ที่ API | Express strip `/api` prefix ออกก่อนส่งต่อ proxy | ใช้ `pathFilter` แทน `app.use('/api', ...)` |
