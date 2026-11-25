/* =====================================================================
   ملف الإعداد — انسخيه باسم js/config.js ثم ضعي قيم مشروعك.
   (عند النشر على Netlify أو Vercel يُنشأ هذا الملف تلقائيًا من متغيرات البيئة.)

   supabaseKey هو المفتاح العام (Publishable: sb_publishable_...)
   أو المفتاح القديم anon. هذا المفتاح مصمَّم ليظهر في المتصفح، والحماية
   تأتي من سياسات RLS وكلمة سر العائلة.
   لا تضعي هنا المفتاح السري (sb_secret_...) أو service_role أبدًا.
   ===================================================================== */
window.WISHLIST_CONFIG = {
  mode: 'supabase',                                   // 'supabase' أو 'preview' (معاينة على جهاز واحد)
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  supabaseKey: 'sb_publishable_YOUR_KEY',
  authMode: 'password',                               // 'password' = كلمة سر العائلة، 'open' = بلا دخول
  familyEmail: 'family@example.com',                  // بريد حساب العائلة المُنشأ في Supabase
};
