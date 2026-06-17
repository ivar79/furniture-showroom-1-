import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Product, Category } from "../types";
import ProductCard from "../components/ProductCard";
import { ArrowLeft, Sparkles, Sofa, Shield, Compass, BadgeCheck, PhoneCall, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const prodRes = await fetch("/api/products?showcaseOnly=true");
        const prodData = await prodRes.json();
        if (prodData.success) {
          setFeaturedProducts(prodData.products.slice(0, 3));
        }

        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error("Home loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-stone-950">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&auto=format&fit=crop&q=80"
            alt="Luxury Sofa"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8 select-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-1.5 self-center mx-auto bg-stone-100/10 text-stone-300 border border-stone-100/20 px-4 py-1.5 rounded-full w-fit text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>پلتفرم واسطه‌گری مبلمان لوکس و ژورنالی</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-4xl sm:text-6xl font-extrabold text-stone-50 tracking-tight leading-tight"
          >
            مبلمان لوکس، مستقیم از نمایشگاه
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-stone-300 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed"
          >
            ما واسطه‌ و مشاور تخصصی شما هستیم. بهترین مبلمان برند را بدون دردسر، با پورسانت منصفانه و بهترین شرایط قیمتی مستقیم از معتبرترین نمایشگاه‌ها هماهنگ می‌کنیم.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/products"
              className="w-full sm:w-auto bg-stone-50 hover:bg-stone-200 text-stone-950 px-8 py-4 rounded-2xl text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>مشاهده گالری مبل‌ها</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto bg-stone-900/40 hover:bg-stone-900/60 border border-stone-800 text-stone-100 px-8 py-4 rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <span>نحوه هماهنگی واسطه‌گری</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Top Brands Tagline / Why furniture-showroom */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex gap-4 p-6 bg-white border border-stone-200/50 rounded-3xl">
            <div className="w-12 h-12 bg-stone-100 text-stone-900 flex items-center justify-center shrink-0 rounded-2xl">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-stone-900">قیمت مستقیم نمایشگاهی</h3>
              <p className="text-xs text-stone-400 leading-relaxed">ما با نمایشگاه مچ می‌شویم و قیمت‌های توافق شده تولید اولیه را با نظارت بر کیفیت به شما تقدیم می‌کنیم.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white border border-stone-200/50 rounded-3xl">
            <div className="w-12 h-12 bg-stone-100 text-stone-900 flex items-center justify-center shrink-0 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-stone-900">ضمانت اصالت و سلامت مبل</h3>
              <p className="text-xs text-stone-400 leading-relaxed">قبل از بارگیری، کارشناسان ما کیفیت چوب، کلاف، پارچه و اسفنج یورتان را شخصاً تأیید می‌کنند.</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 bg-white border border-stone-200/50 rounded-3xl">
            <div className="w-12 h-12 bg-stone-100 text-stone-900 flex items-center justify-center shrink-0 rounded-2xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-stone-900">مشاوره رایگان تخصصی</h3>
              <p className="text-xs text-stone-400 leading-relaxed">کاندید کردن مبل، ارسال رنگ‌بندی‌های تکمیلی و مشاوره ابعاد دکوراسیون توسط دیزاینرهای ما انجام می‌شود.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-1.5 justify-start text-stone-400 text-xs font-bold tracking-wider uppercase">
              <Sofa className="w-4 h-4 text-stone-400" />
              <span>مبلمان برگزیده هفته</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">طرح‌های شاخص نمایشگاه</h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 border-b border-stone-900/0 hover:border-stone-900 pb-0.5 transition-all"
          >
            <span>همه مدل‌ها</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-stone-200 rounded-2xl h-[420px]" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.product.id}
                product={p.product}
                showroomName={p.showroomName}
                categoryName={p.categoryName}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-stone-200/50 rounded-2xl">
            <p className="text-stone-400">هیچ محصولی به عنوان محصول ویژه ثبت نشده است.</p>
          </div>
        )}
      </section>

      {/* 4. Category Exploration Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-stone-900 rounded-3xl overflow-hidden p-8 sm:p-12 text-stone-50 flex flex-col md:flex-row items-center justify-between gap-10 relative">
          <div className="absolute inset-0 opacity-15 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop&q=80"
              alt="Background sofa text"
              className="w-full h-full object-cover scale-110"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 space-y-4 max-w-lg text-right">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-widest flex items-center gap-1.5 justify-start">
              <BadgeCheck className="w-4 h-4 text-amber-400" />
              تضمین کیفیت و اصالت
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-50">خرید مبل بی‌دردسر و ایمن</h3>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              دیگر نگران بدعهدی نمایشگاه‌ها یا گران‌فروشی مبل در یافت‌آباد نباشید. کلیه فرآیندهای مالی، برآورد قیمت نهایی و بررسی‌های فنی به عنوان وکیل قانونی و راهنمای خرید شما انجام می‌شود.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link
              to="/products"
              className="block text-center w-full md:w-auto bg-stone-50 hover:bg-stone-200 text-stone-900 px-8 py-3.5 rounded-2xl text-sm font-semibold transition-colors"
            >
              مشاوره خرید کالا
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
