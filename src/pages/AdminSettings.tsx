import React, { useEffect, useState } from "react";
import { Sofa, Phone, Mail, MapPin, Instagram, Send, MessageCircle, Save, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    about_title: "",
    about_desc: "",
    about_content: "",
    contact_address: "",
    contact_phone: "",
    contact_email: "",
    instagram: "",
    telegram: "",
    bale: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "خطا در بارگذاری تنظیمات سایت" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // simple Farsi validation
    if (!settings.about_title.trim()) {
      setStatus({ type: "error", message: "تایتل درباره ما نمی‌تواند خالی باشد." });
      setSaving(false);
      return;
    }
    if (!settings.contact_phone.trim()) {
      setStatus({ type: "error", message: "تلفن تماس نمی‌تواند خالی باشد." });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setStatus({ type: "success", message: "تنظیمات درباره ما و اطلاعات تماس با موفقیت ویرایش و ذخیره شد." });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: "error", message: data.error || "خطا در ثبت اطلاعات" });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "خطا در ارتباط با سرور" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* Title block */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm">
        <div className="text-right space-y-1">
          <h1 className="text-xl font-extrabold text-stone-900">تنظیمات اصلی سایت</h1>
          <p className="text-xs text-stone-400">اطلاعات برگه درباره ما، جزییات فیزیکی و لینک مستقیم به شبکه‌های اجتماعی مدرن هوم را مدیریت کنید.</p>
        </div>
        <div className="p-3 bg-stone-100 rounded-xl text-stone-900">
          <Sofa className="w-6 h-6" />
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl border text-xs font-bold leading-relaxed ${
          status.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* About Us section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            <span>تنظیمات برگه «درباره ما» (Modern Home)</span>
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block">عنوان برگه (تایتل اصلی)</label>
              <input
                type="text"
                name="about_title"
                value={settings.about_title}
                onChange={handleChange}
                className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-right"
                placeholder="مثال: درباره گالری مبلمان مدرن هوم"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block">زیر عنوان (توضیح کوتاه زیر عنوان)</label>
              <input
                type="text"
                name="about_desc"
                value={settings.about_desc}
                onChange={handleChange}
                className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block">متن کامل درباره ما</label>
              <textarea
                name="about_content"
                rows={6}
                value={settings.about_content}
                onChange={handleChange}
                className="w-full text-xs font-light border border-stone-200 p-4 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-right leading-relaxed"
                placeholder="برای ایجاد پاراگراف جدید از Enter استفاده کنید..."
              />
            </div>
          </div>
        </div>

        {/* Contact information */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            <span>اطلاعات تماس و نشانی فیزیکی</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>نشانی دقیق دفتر مدیریت</span>
              </label>
              <input
                type="text"
                name="contact_address"
                value={settings.contact_address}
                onChange={handleChange}
                className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>تلفن تماس (ارتباط مستقیم)</span>
              </label>
              <input
                type="text"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-right"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>پست الکترونیکی رسمی</span>
              </label>
              <input
                type="text"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleChange}
                className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-right"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Social networks section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span>اتصال شبکه‌های اجتماعی مدرن هوم</span>
          </h3>

          <p className="text-stone-400 text-[10px] leading-relaxed">
            کاربران در برگه ارتبط با ما به صورت مستقیم از طریق کلیک بر روی گزینه‌ها به آدرس‌های زیر هدایت خواهند شد. 
            می‌توانید آی‌دی کاربری یا آدرس کامل صفحه خود را وارد کنید.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>آی‌دی اینستاگرام</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="instagram"
                  value={settings.instagram}
                  onChange={handleChange}
                  className="w-full text-xs font-mono border border-stone-200 p-3 pr-9 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
                  placeholder="instagram_id"
                  dir="ltr"
                />
                <span className="absolute right-3.5 top-3.5 text-stone-400 text-xs font-sans">@</span>
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <Send className="w-3.5 h-3.5 text-blue-500 rotate-[-20deg]" />
                <span>آی‌دی یا کانال تلگرام</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="telegram"
                  value={settings.telegram}
                  onChange={handleChange}
                  className="w-full text-xs font-mono border border-stone-200 p-3 pr-9 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
                  placeholder="telegram_id"
                  dir="ltr"
                />
                <span className="absolute right-3.5 top-3.5 text-stone-400 text-xs font-sans">@</span>
              </div>
            </div>

            {/* Bale */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>آدرس یا هندل در «بله»</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="bale"
                  value={settings.bale}
                  onChange={handleChange}
                  className="w-full text-xs font-mono border border-stone-200 p-3 pr-9 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
                  placeholder="bale_username"
                  dir="ltr"
                />
                <span className="absolute right-3.5 top-3.5 text-stone-400 text-xs font-sans">@</span>
              </div>
            </div>

          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            className="border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700 px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>بازنشانی فیلدها</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-stone-900 hover:bg-stone-850 text-white px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-stone-950/10 hover:shadow-stone-950/20 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                <span>در حال ثبت...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>ذخیره نهایی اطلاعات</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
