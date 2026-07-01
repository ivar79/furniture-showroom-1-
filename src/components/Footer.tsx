import { Sofa, Phone, Mail, MapPin, Instagram, ShieldCheck, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const address = settings?.contact_address || "تهران، بازار مبل یافت‌آباد، بلوار معلم، دفتر مدیریت فضا";
  const phone = settings?.contact_phone || "۰۲۱-۶۶۵۴۳۲۱۰";
  const email = settings?.contact_email || "info@modern-home.ir";
  const about_desc = settings?.about_desc || "پلتفرم تخصصی واسطه‌گری و مشاوره‌ی رایگان خرید مبلمان لوکس و ژورنالی از برترین و برجسته‌ترین نمایشگاه‌های مبل ایران. ما بهترین قیمت تولیدی و تضمین کیفیت را بدون دردسر برای شما هماهنگ می‌کنیم.";
  const instagram = settings?.instagram || "modern_home_gallery";

  const getInstagramUrl = () => {
    if (!instagram) return "#";
    return instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram}`;
  };

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-8 border-t border-stone-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-stone-800">
          
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-950">
                <Sofa className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-stone-50 uppercase">
                modern<span className="text-amber-500 font-light">-home</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              {about_desc}
            </p>
            <div className="flex gap-4">
              <a
                href={getInstagramUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900 flex items-center justify-center hover:bg-stone-800 hover:text-stone-50 transition-colors"
                aria-label="Instagram Link"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Access Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-stone-100">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-stone-50 transition-colors">صفحه اصلی</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-stone-50 transition-colors">گالری محصولات</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-stone-50 transition-colors">درباره ما</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-stone-50 transition-colors">تماس با ما</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-stone-100">ارتباط با ما</h4>
            <ul className="space-y-3.5 text-sm text-stone-400">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-stone-400 shrink-0" />
                <span dir="ltr">{phone}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="font-sans text-xs">{email}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} گالری مبلمان مدرن هوم (Modern Home). تمامی حقوق این پلتفرم محفوظ است.</p>
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              ضمانت اصالت طرح
            </span>
            <span className="flex items-center gap-1">
              <Gem className="w-3.5 h-3.5" />
              مستقیمِ تولیدکننده
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
