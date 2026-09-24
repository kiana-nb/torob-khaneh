# وضعیت پروژه و handoff (به‌روز: ۲۰۲۶-۰۹-۲۴ / ۲ مهر ۱۴۰۵)

این سند برای این است که هر سشن جدید (Claude Code یا خود کیانا) بدون خواندن تاریخچه‌ی گفت‌وگو، کل وضعیت را بداند.
ترتیب خواندن: همین سند ← `README.md` ← `docs/01-research-and-plan.md` (تحقیق و تصمیم‌ها) ← `docs/02-demo-report.md` (تست‌ها و باگ‌ها) ← `docs/03-video-script.md` (متن ویدیو).

---

## ۱. خلاصه در یک نگاه

| چیز | وضعیت / لینک |
|---|---|
| چالش | «AI Product Engineer» ترب: «ترب برای X بساز». X = آپارتمان در تهران |
| درخواست | ✅ **ارسال شده** (۲۰۲۶-۰۹-۲۴) از فرم https://jobs.torob.com/ai-product-engineer ؛ پیام موفقیت: «دموی تو برای این موقعیت در ترب ثبت شد. تیم ما بررسی‌اش می‌کنه.» |
| دموی زنده | https://torob-khaneh.vercel.app (Vercel، root dir = `web`، هر push به `main` دوباره deploy می‌شود) |
| ویدیو | https://torob-khaneh.vercel.app/demo/ · آپارات https://www.aparat.com/v/eptnn85 · Google Drive https://drive.google.com/file/d/1HyY-KtpkDhlrjVzgwZxdZOeU7XiiP-0M/view |
| کد | https://github.com/kiana-nb/torob-khaneh (public، پین‌شده روی پروفایل) |
| «چطور ساخته شد» | https://torob-khaneh.vercel.app/about/ (شامل ویدیو و کارت معرفی کیانا) |

> ⚠️ تا وقتی تیم ترب بررسی را تمام نکرده: ریپو را private نکن، پروژه‌ی Vercel را پاک نکن، ویدیوی آپارات و Drive را حذف یا private نکن. همه‌ی این لینک‌ها داخل فرم ارسال‌شده‌اند.

---

## ۲. محصول (چه چیزی ساخته شده)
- Next.js 15 (App Router) با **static export** (`output: 'export'`, `trailingSlash`) ← ۷۲۹ صفحه‌ی استاتیک. بدون بک‌اند.
- React 19، Tailwind 4، framer-motion، Radix (Dialog، DropdownMenu، Slider، Tabs، Tooltip)، nuqs (state در URL)، TanStack Query، Leaflet (کاشی OSM).
- داده: ۷۳۹ آگهی دیوار (crawl ۲۰۲۶-۰۹-۲۳) ← ۷۱۸ پارس‌شده ← **۶۹۸ خانه** (۴۵۱ اجاره، ۲۴۷ خرید)، ۲۰ محله، ۱۴۱ ایستگاه مترو.
- صفحه‌ها: `/` (هیرو متحرک + دیوار عکس + آمار count-up)، `/search`، `/home/[id]`، `/compare`، `/saved`، `/areas` و `/areas/[slug]`، `/about`، `/demo`.
- ساختار کد: `web/src/features/<feature>/{components,lib}` + `web/src/shared/{components/ui,hooks,lib,types}`. داده‌ی ساخته‌شده در `web/src/data/*.json` و `web/public/data/homes-index.json`.
- پایپ‌لاین داده: `scripts/crawl/crawl.mjs` (cache محلی، gitignore) ← `build-data.mjs` (normalize، dedupe با union-find، enrich). آگهی‌های هم‌خانه و خوابگاه با regex روی عنوان رد می‌شوند.

### کارهای UI این سشن (همه commit و deploy شده)
- قیمت روی کارت‌ها: «میلیون» به «تومان» می‌چسبید؛ حروف فارسی بین المنت‌های inline فقط با یک whitespace واقعی جدا می‌شوند (`{' '}`) — در `home-card.tsx` کامنت دارد.
- گالری: اگر فقط یک عکس باشد، کامل (`object-contain` روی پس‌زمینه‌ی blur) نشان داده می‌شود.
- Sheet فیلترها با framer-motion (موبایل: بالا آمدن + drag-to-dismiss؛ دسکتاپ: scale). **نکته:** `MotionConfig` باید بیرون از `Dialog.Portal` باشد، وگرنه Radix کرش می‌کند.
- لوگوی جدید (کاشی قرمز گرادیانی، خانه‌ی سفید، برگ سبز): `web/src/app/icon.svg`، `apple-icon.png`، `docs/brand/`، کامپوننت `shared/components/logo.tsx`.
- موشن لندینگ: `features/landing/components/motion.tsx` (HeroTitle با wipe راست‌به‌چپ، PhotoWall، CountUp، Reveal). عمداً سبک؛ کیانا گفت «overdo نکن».
- نقشه روی هدر می‌رفت: `.leaflet-container { isolation:isolate; z-index:0 }` در `globals.css`.
- مرتب‌سازی: `select` پیش‌فرض HTML با `SortMenu` (Radix DropdownMenu) عوض شد.
- `/about` بازطراحی شد (ایده از jobs.torob.com): تور محصول با اسکرین‌شات‌ها (`web/public/shots/*.webp`)، قاب گوشی با status bar، نمودارها (`about-visuals.tsx`)، ویدیو، و `AuthorCard`.
- `AuthorCard` / `AuthorLine` در `features/about/components/author-card.tsx`: عکس `web/public/about/kiana.jpg` (کراپ کمتر به درخواست کیانا)، ایمیل `kiana.nabipour07@gmail.com`، متن Uryva («پلتفرم دانش بین‌المللی مبتنی بر AI»).

---

## ۳. ویدیوی دمو (ساخته‌شده، تأییدشده، ارسال‌شده)
- نسخه‌ی نهایی: **deep-urban**، ۳:۵۲ دقیقه، 1080p، ~۶۰ MB. کپی در `web/public/demo/torob-khaneh-demo.mp4` + `poster.jpg`.
- صدا: ElevenLabs v3، صدای **Jane (Professional Audiobook Reader)**، با تگ‌های لحن. take‌های انتخابی کیانا: `1b, 2b, 3b, 4a, 5b, 6a, 7b, 8b, 9a` ← `voice/final/s1..s9.mp3`. متن تگ‌دار: `docs/03b-elevenlabs-script.txt`.
- موسیقی: «Deep Urban» از Mixkit (رایگان)، زیر صدا با −30 LUFS + ducking. نسخه‌های دیگر (vastness، rest-now) هم ساخته شد و رد شد.
- ابزار ساخت در `video/` (Node + playwright-core + ffmpeg):
  - `scenes.mjs` (۱۷ شات)، `timeline.mjs` (زمان‌بندی روی طول فایل‌های صدا)، `record.mjs` (ضبط هر شات از سایت با CDP screencast، ۱۵۳۶×۸۶۴ @ DPR 1.25 = 1080p)، `overlay.mjs` (زیرنویس و chapter به‌صورت PNG شفاف ← qtrle)، `compose.mjs` (مونتاژ، loudnorm −16 LUFS).
  - `node compose.mjs --music music/deep-urban.mp3` خروجی را در `video/out/` می‌سازد؛ `--reuse` فقط صدا را دوباره می‌سازد.
  - `video/music`، `video/out`، `video/.build`، `voice/` در git نیستند (حجم و لایسنس).
- یک حدس باز: شاید take `s8b` یک جمله کم داشته باشد. کیانا ویدیو را همین‌طور تأیید کرد.

## ۴. ارسال فرم ترب (برای یادآوری)
- فرم فایل ~۶۰ مگابایتی را آپلود نمی‌کرد؛ به‌جایش لینک گذاشتیم. فیلد لینک ویدیو (`profileUrl`) = لینک Vercel (منقضی نمی‌شود). همه‌ی لینک‌ها در «توضیحات» (سقف ۷۰۰ کاراکتر؛ متن نهایی ~۵۱۸ کاراکتر).
- خطای «ارتباط کامل نشد» = **403 از Cloudflare** در پروفایل Chrome که اکستنشن Claude فعال بود. در incognito درست ارسال شد. درس: برای فرم‌های پشت Cloudflare، ارسال نهایی را خود کاربر در پنجره‌ی تمیز بزند.
- یک ارسال آزمایشی هم قبلاً ثبت شده بود؛ در توضیحات نوشته شده که نادیده گرفته شود.

## ۵. پروفایل گیت‌هاب (به‌روز شد ۲۰۲۶-۰۹-۲۴)
- ریپوی `kiana-nb/kiana-nb`: README با همان حال‌وهوای پیکسلی (gif ماریو، octocat)، ولی متن‌ها به‌روز: نقش فعلی در کلاسه، Uryva / Fahmyar / Classeh Target / LMS، بخش ترب خانه، ابزارها و کارت streak.
- پین‌ها: فقط `torob-khaneh` و `rem-waste`. پروژه‌های قدیمی (simonSaysGame، digitalHippo، noteKeeperApp) از پین برداشته شدند.
- مانده (نیاز به تأیید کیانا): بیوی سایدبار پروفایل هنوز متن قدیمی زمان کارآموزی است. لوکیشن «Karaj, Iran» است، ولی رزومه «Istanbul» می‌گوید.

## ۶. Vercel و در دسترس ماندن سایت
- پلن Hobby روی deploymentهای production **تاریخ انقضا ندارد**. `torob-khaneh.vercel.app` تا وقتی پروژه پاک نشود بالا می‌ماند، حتی اگر مدت‌ها push نشود.
- چیزهایی که واقعاً می‌توانند سایت را پایین بیاورند: پاک کردن یا تغییر نام پروژه، پاک کردن اکانت یا قطع اتصال GitHub، رد شدن سقف مصرف ماهانه‌ی Hobby (مهم‌ترینش bandwidth ۱۰۰GB؛ ویدیوی ۶۰MB یعنی حدود ۱۶۰۰ بار دانلود کامل)، و build خراب بعد از push (نسخه‌ی قبلی بالا می‌ماند).
- لینک‌هایی که «منقضی» می‌شوند معمولاً URLهای preview با hash هستند (`torob-khaneh-abc123-kiana.vercel.app`) یا preview‌هایی که Deployment Protection دارند. همیشه دامنه‌ی production را بده.
- احتیاط پیشنهادی: `preload="none"` روی ویدیوها (در `/about` هست، در `/demo` `metadata` است)، و در صورت نیاز فقط Aparat یا Drive را embed کن تا bandwidth مصرف نشود. برای پایش: Vercel ← Project ← Usage.

---

## ۷. قواعد کار با کیانا (از این سشن)
- قبل از commit و push روی تغییرات UI، اول خودش ببیند و تأیید کند («کامیت پوش نکن که میگم»). بعد از «کامیت و پوش کن» انجام بده.
- برای بررسی در مرورگر، **اکستنشن Claude in Chrome** را ترجیح بده؛ Playwright MCP را تا جای ممکن استفاده نکن.
- فرم‌های بیرونی: پر کن، ولی دکمه‌ی ارسال نهایی را خودش می‌زند.
- موشن: ظریف، نه زیاد. رفرنس‌های سلیقه: jobs.torob.com و clinio.ir.
- مستندات فارسی‌اند؛ کامنت‌های کد انگلیسی.
- `gh` CLI لاگین نیست؛ push با Git Credential Manager کار می‌کند. کارهای وب گیت‌هاب (ساخت ریپو، پین، تنظیمات) از طریق مرورگر انجام شده.

## ۸. کارهای باز / ایده‌های بعدی (هیچ‌کدام درخواست نشده)
- جابه‌جا کردن ترتیب پین‌ها (torob-khaneh اول) با درگ دستی روی پروفایل.
- توضیح برای ریپوی `rem-waste` (الان description ندارد).
- crawl دوره‌ای برای تاریخچه‌ی قیمت و «خبرم کن»، منبع دوم، فاصله‌ی واقعی تا مترو (نه خط مستقیم).
