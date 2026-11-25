#!/usr/bin/env node
/* =====================================================================
   يُنشئ js/config.js من متغيرات البيئة أثناء النشر (Netlify / Vercel).
   لا يحتاج أي حزم إضافية.

   المتغيرات:
     SUPABASE_URL                 رابط المشروع (إلزامي)
     SUPABASE_PUBLISHABLE_KEY     المفتاح العام sb_publishable_... (أو SUPABASE_ANON_KEY)
     WISHLIST_AUTH_MODE           password (افتراضي) أو open
     WISHLIST_FAMILY_EMAIL        بريد حساب العائلة (إلزامي في وضع password)
   ===================================================================== */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const env = process.env;
const url = (env.SUPABASE_URL || '').trim();
const key = (env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || '').trim();
const authMode = (env.WISHLIST_AUTH_MODE || 'password').trim();
const familyEmail = (env.WISHLIST_FAMILY_EMAIL || '').trim();

const problems = [];
if (!/^https:\/\/\S+$/.test(url)) problems.push('SUPABASE_URL مفقود أو غير صحيح');
if (!key) problems.push('SUPABASE_PUBLISHABLE_KEY مفقود');
if (!['password', 'open'].includes(authMode)) problems.push('WISHLIST_AUTH_MODE يجب أن يكون password أو open');
if (authMode === 'password' && !familyEmail) problems.push('WISHLIST_FAMILY_EMAIL مفقود');

// حماية: نرفض أي مفتاح سري
if (/^sb_secret_/.test(key)) problems.push('هذا مفتاح سري (sb_secret_). استخدمي المفتاح العام sb_publishable_ فقط');
if (/^eyJ/.test(key)) {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
    if (payload.role && payload.role !== 'anon') problems.push(`هذا مفتاح بصلاحية ${payload.role}. استخدمي المفتاح العام فقط`);
  } catch { /* ليس JWT صالحًا؛ ستكشفه Supabase عند الاتصال */ }
}

if (problems.length) {
  console.error('✗ تعذّر إنشاء js/config.js:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}

const config = { mode: 'supabase', supabaseUrl: url.replace(/\/$/, ''), supabaseKey: key, authMode, familyEmail };
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'js', 'config.js');
writeFileSync(out, `/* أُنشئ تلقائيًا أثناء النشر — لا تعدّليه يدويًا */\nwindow.WISHLIST_CONFIG = ${JSON.stringify(config, null, 2)};\n`);
console.log('✓ js/config.js جاهز (authMode = ' + authMode + ')');
