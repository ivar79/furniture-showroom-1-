import React, { useEffect, useState } from "react";
import { Sofa, Phone, Mail, MapPin, Instagram, Send, MessageCircle, Save, CheckCircle, RefreshCw, Key, ShieldAlert, Image, LayoutTemplate } from "lucide-react";

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
    bale: "",
    hero_images: "",
    site_logo: ""
  });
  const [vipPassword, setVipPassword] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
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

      // Fetch VIP Password
      const token = localStorage.getItem("adminToken");
      const vipRes = await fetch("/api/admin/vip-password", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const vipData = await vipRes.json();
      if (vipData.success) {
        setVipPassword(vipData.vipPassword || "");
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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, name: file.name }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    } catch (err) {
      console.error("Upload error", err);
    }
    return null;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus({ type: "success", message: "در حال آپلود لوگو..." });
    const url = await uploadImage(file);
    if (url) {
      setSettings(prev => ({ ...prev, site_logo: url }));
      setStatus({ type: "success", message: "لوگو با موفقیت آپلود شد." });
    } else {
      setStatus({ type: "error", message: "خطا در آپلود لوگو" });
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setStatus({ type: "success", message: `در حال آپلود ${files.length} تصویر...` });
    
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) uploadedUrls.push(url);
    }
    
    if (uploadedUrls.length > 0) {
      const currentList = settings.hero_images ? settings.hero_images.split(",").map((s:string) => s.trim()).filter(Boolean) : [];
      const newList = [...currentList, ...uploadedUrls].join(", ");
      setSettings(prev => ({ ...prev, hero_images: newList }));
      setStatus({ type: "success", message: "تصاویر با موفقیت آپلود شدند." });
    } else {
      setStatus({ type: "error", message: "خطا در آپلود تصاویر" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    if (!passwords.current || !passwords.new) {
      setStatus({ type: "error", message: "تمامی فیلدهای رمز عبور الزامی است." });
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: "رمز عبور مدیر با موفقیت تغییر کرد." });
        setPasswords({ current: "", new: "" });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: "error", message: data.error || "خطا در تغییر رمز عبور" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "خطا در ارتباط با سرور" });
    } finally {
      setSaving(false);
    }
  };

  const handleVipPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/vip-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ vipPassword })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: "رمز عبور یکپارچه VIP با موفقیت ذخیره شد." });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: "error", message: data.error || "خطا در ثبت رمز VIP" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "خطا در ارتباط با سرور" });
    } finally {
      setSaving(false);
    }
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
          <p className="text-xs text-stone-400">اطلاعات برگه درباره ما، جزییات فیزیکی و لینک مستقیم به شبکه‌های اجتماعی Modern Home را مدیریت کنید.</p>
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

      {/* Admin Security */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>تغییر کلمه عبور مدیر سیستم</span>
        </h3>
        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 block">رمز عبور فعلی</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
              className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 block">رمز عبور جدید</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
              className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
              dir="ltr"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-stone-800 hover:bg-stone-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>بروزرسانی رمز عبور</span>
            </button>
          </div>
        </form>
      </div>

      {/* VIP Security */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-500" />
          <span>کلمه عبور یکپارچه ورود کاربران VIP</span>
        </h3>
        <p className="text-stone-400 text-[10px] leading-relaxed">
          این کلمه عبور به عنوان یک رمز عمومی و مشترک برای ورود سریع مشتریان ویژه به حساب باشگاه مشتریان استفاده می‌شود.
        </p>
        <form onSubmit={handleVipPasswordSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 block">کلمه عبور VIP</label>
            <input
              type="text"
              value={vipPassword}
              onChange={(e) => setVipPassword(e.target.value)}
              placeholder="مثال: vip123"
              className="w-full text-xs font-medium border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
              dir="ltr"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره رمز VIP</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Visual Settings section */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
            <span>تنظیمات ظاهری سایت (لوگو و تصاویر)</span>
          </h3>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>لوگوی سایت (لینک تصویر)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="site_logo"
                  value={settings.site_logo || ""}
                  onChange={handleChange}
                  className="w-full text-xs font-mono border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left"
                  placeholder="https://example.com/logo.png"
                  dir="ltr"
                />
                <label className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold transition-all whitespace-nowrap flex items-center shrink-0">
                  آپلود عکس
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-stone-400">در صورت خالی بودن، متن Modern Home نمایش داده می‌شود.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-500 block flex items-center gap-1">
                <Image className="w-3.5 h-3.5" />
                <span>تصاویر پس‌زمینه اصلی سایت (با ویرگول انگلیسی , جدا کنید)</span>
              </label>
              <div className="flex gap-2 items-start">
                <textarea
                  name="hero_images"
                  rows={3}
                  value={settings.hero_images || ""}
                  onChange={handleChange}
                  className="w-full text-xs font-mono border border-stone-200 p-3 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-950/25 transition-all text-left leading-relaxed"
                  placeholder="https://image1.jpg, https://image2.jpg"
                  dir="ltr"
                />
                <label className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-3 rounded-xl cursor-pointer text-xs font-bold transition-all whitespace-nowrap flex items-center shrink-0 h-[42px]">
                  آپلود عکس
                  <input type="file" accept="image/*" multiple onChange={handleHeroUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-stone-400">برای ایجاد اسلایدر چند تصویر قرار دهید. می‌توانید خودتان آپلود کنید یا آدرس درج کنید.</p>
            </div>
          </div>
        </div>

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
                placeholder="مثال: درباره گالری مبلمان Modern Home"
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
            <span>اتصال شبکه‌های اجتماعی Modern Home</span>
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
