import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Product, Showroom, Category } from "../types";
import { ArrowRight, CheckCircle2, Store, Calendar, HelpCircle, PhoneCall, Heart, Star, Sparkles, MapPin, ShieldAlert, BadgeInfo, ShieldCheck, Scale, Percent, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState<{ product: Product; showroom: Showroom; category: Category } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  
  // Lead Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("تهران");
  const [customerMessage, setCustomerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Capture referral code if present in url query
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get("ref");
    if (refParam) {
      localStorage.setItem("m_referrer", refParam.trim());
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const parsed = await res.json();
        if (parsed.success) {
          setData(parsed.data);
          if (parsed.data.product.images?.length > 0) {
            setActiveImage(parsed.data.product.images[0]);
          }
        }
      } catch (err) {
        console.error("Detail fetching error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  // Iranian cities
  const iranianCities = [
    "تهران", "اصفهان", "شیراز", "مشهد", "تبریز", "کرج", "قم", "رشت", "اهواز", "کرمان", "یزد", "همدان", "ساری", "کرمانشاه"
  ];

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    if (!customerName || !customerPhone || !customerCity) {
      setErrorMessage("لطفاً تمام کادرهای ستاره‌دار را پر کنید.");
      setIsSubmitting(false);
      return;
    }

    const iranPhoneRegex = /^(\+98|0098|98|0)?9[0-9]{9}$/;
    if (!iranPhoneRegex.test(customerPhone)) {
      setErrorMessage("شماره موبایل اشتباه است. مثال مناسب: 09121234567");
      setIsSubmitting(false);
      return;
    }

    // Append optional referral code if present in localStorage
    let finalMessage = customerMessage;
    const storedReferrer = localStorage.getItem("m_referrer");
    if (storedReferrer) {
      finalMessage = `${customerMessage ? customerMessage + "\n" : ""}[کد معرف: ${storedReferrer}]`;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerCity,
          customerMessage: finalMessage,
          productId: data?.product.id,
        })
      });

      const resJson = await res.json();
      if (resJson.success) {
        setFormSuccess(true);
        // Reset states
        setCustomerName("");
        setCustomerPhone("");
        setCustomerMessage("");
      } else {
        setErrorMessage(resJson.error || "مشکلی در ذخیره اطلاعات به وجود آمد.");
      }
    } catch (err: any) {
      setErrorMessage("خطا در ارتباط با سرور. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen pt-36 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-stone-50 min-h-screen pt-36 pb-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-800">کالای انتخابی شما پیدا نشد!</h2>
        <Link to="/products" className="inline-block bg-stone-900 text-stone-50 px-5 py-2 rounded-xl text-xs">
          برگشت به گالری مبل‌ها
        </Link>
      </div>
    );
  }

  const { product, showroom, category } = data;
  const isImagePlaceholder = !product.images || product.images.length === 0;
  const currentImage = activeImage || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80";

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 pt-28 pb-20 leading-relaxed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/products" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>برگشت به گالری و کاتالوگ</span>
        </Link>

        {/* Double Column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Images Stage & Technical details */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Image display stage */}
            <div className="bg-white border border-stone-200/50 p-4 rounded-3xl space-y-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbs Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(imgUrl)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border-2 transition-all ${
                        activeImage === imgUrl ? "border-stone-900" : "border-transparent opacity-70"
                      }`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Parameters Table */}
            <div className="bg-white border border-stone-200/50 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="text-lg font-extrabold text-stone-900">مشخصات فنی و متریال ساخت</h3>
                <p className="text-xs text-stone-400 mt-1">کلیه پارامترهای زیر در هنگام سفارش قابل شخصی‌سازی هستند.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                  <span className="text-stone-400 font-bold">جنس کلاف کل بدنه</span>
                  <span className="text-stone-800 font-extrabold">{product.material || "چوب درخت روس چنار خشک"}</span>
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                  <span className="text-stone-400 font-bold">پایه و متریال روکار</span>
                  <span className="text-stone-800 font-extrabold">{product.baseMaterial || "راش طبیعی گرجستان"}</span>
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                  <span className="text-stone-400 font-bold">فوم و اسفنج نشیمن</span>
                  <span className="text-stone-800 font-extrabold">{product.seatSponge || "اسفنج ۳۵ کیلویی ویژه"}</span>
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                  <span className="text-stone-400 font-bold">نوع و متریال پارچه</span>
                  <span className="text-stone-800 font-extrabold">{product.fabricType || "پارچه خارجی نانو مسکو"}</span>
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                  <span className="text-stone-400 font-bold">ابعاد و ساختار فیزیکی</span>
                  <span className="text-stone-800 font-extrabold">{product.dimensions || "اندازه استاندارد ژورنالی"}</span>
                </div>

                <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100/50">
                  <span className="text-stone-400 font-bold">کلاف تقویتی داخل کار</span>
                  <span className="text-stone-800 font-extrabold">{product.innerFrame || "چوب راش و اتصالات فلزی"}</span>
                </div>

              </div>

              {/* Colors show */}
              {product.colors && product.colors.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-stone-400 block mb-2 font-bold">کالیته‌های رنگ پرفروش</span>
                  <div className="flex gap-2">
                    {product.colors.map((c, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Platform Exclusive Protections & Anti-bypass Info */}
            <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-3xl space-y-6 border border-stone-800">
              <div className="space-y-1.5 text-right">
                <span className="text-[10px] bg-amber-400 text-stone-950 font-extrabold px-2.5 py-1 rounded-md inline-block uppercase tracking-wider">
                  بسته طلایی خرید مشتری
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-stone-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                  چرا ثبت از سایت؟ چرا مستقیم خرید نکنیم؟
                </h3>
                <p className="text-stone-400 text-xs font-light leading-relaxed">
                  مراجعه مستقیم بدلیل عدم نظارت پلتفرم مدرن هوم معمولاً منجر به از دست رفتن تخفیف‌ها، تحویل دیرهنگام بدون امکان پیگیری قانونی و یا استفاده ناخواسته از متریال با کیفیت پایین‌تر (اسفنج متفرقه بجای یورتان ۳۵ کیلویی) می‌شود.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Perk 1: Discount */}
                <div className="bg-stone-800/40 border border-stone-800/60 p-4 rounded-2xl space-y-2 text-right">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                    <Percent className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-100">۵٪ تخفیف انحصاری پلتفرم</h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                    فاکتور نهایی شما در سراسر کشور ۵٪ ارزان‌تر از قیمت مراجعه حضوری و مستقیم به فیزیک نمایشگاه صادر خواهد شد.
                  </p>
                </div>

                {/* Perk 2: Workshop QC Inspection */}
                <div className="bg-stone-800/40 border border-stone-800/60 p-4 rounded-2xl space-y-2 text-right">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-100">کارشناسی مهندسی متریال مبل</h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                    ناظران فنی ما دانسیته واقعی اسفنج ۳۵ کیلویی و کیفیت الوار چوبی کارگاه را پیش از بارگیری فیزیکی تایید می‌کنند.
                  </p>
                </div>

                {/* Perk 3: 3D Consultation */}
                <div className="bg-stone-800/40 border border-stone-800/60 p-4 rounded-2xl space-y-2 text-right">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-100">مشاوره ۳بعدی چیدمان و پارچه</h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                    انطباق علمی طیف رنگی کالیته با والپیپر و مبلمان قبلی شما با رندر ۳بعدی دکوراسیون پلتفرم ما به صورت ۱۰۰٪ رایگان.
                  </p>
                </div>

                {/* Perk 4: Legal & Penalty Protection */}
                <div className="bg-stone-800/40 border border-stone-800/60 p-4 rounded-2xl space-y-2 text-right">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-100">حمایت حقوقی و جریمه دیرکرد</h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-light">
                    پلتفرم، زمان تحویل نمایشگاه را گارانتی می‌کند؛ به ازای هر روز تاخیر، جریمه روزشمار کسر و به خریدار بازپرداخت می‌شود.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Column 2: Order Lead Form & Showroom Details */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Header Product Details */}
            <div className="bg-white border border-stone-200/50 p-6 sm:p-8 rounded-3xl space-y-4">
              <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold w-fit">
                {category.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-stone-500 text-xs sm:text-sm font-light leading-relaxed">
                {product.description || "هیچ توضیحی برای این محصول لوکس توسط نمایشگاه مبل نوشته نشده است. مبلی بر اساس الگوهای نوین دکوراسیون و راحتی بی عیب و نقص."}
              </p>

              <div className="h-px bg-stone-100" />

              {/* Price Row / Dynamic Anti-Bypass Comparison */}
              <div className="space-y-3.5 pt-2">
                <div className="flex justify-between items-center text-xs text-stone-400 font-semibold line-through">
                  <span>خرید آزاد و مستقیم از فیزیک نمایشگاه:</span>
                  <span>
                    {new Intl.NumberFormat("fa-IR").format(Math.round(product.basePrice * 1.05 / 50000) * 50000)} <span className="text-[10px]">تومان</span>
                  </span>
                </div>

                <div className="flex justify-between items-center p-3.5 bg-stone-50 border border-stone-100 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[10px] bg-amber-100 text-stone-900 border border-amber-200 px-2 py-0.5 rounded-lg font-extrabold inline-block leading-none mb-1">
                      ۵٪ تخفیف نقدی پلتفرم
                    </span>
                    <span className="text-xs font-extrabold text-stone-900 block">قیمت نهایی با ثبت از طریق سایت:</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-extrabold text-stone-900">
                    {new Intl.NumberFormat("fa-IR").format(product.basePrice)} <span className="text-xs font-sans">تومان</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Showroom metadata card */}
            <div className="bg-white border border-stone-200/50 p-5 rounded-3xl flex items-start gap-4">
              <div className="w-12 h-12 bg-stone-100/50 rounded-2xl flex items-center justify-center shrink-0 text-stone-800">
                <Store className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1 text-right">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">نمایشگاه عرضه‌کننده</h4>
                <p className="text-sm font-bold text-stone-900">{showroom.name}</p>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-stone-500 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-100">
                  <MapPin className="w-3.5 h-3.5" />
                  {showroom.city}
                </span>
              </div>
            </div>

            {/* Order Form (Lead Generation) */}
            <div className="bg-stone-900 text-stone-50 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-amber-400 via-stone-500 to-stone-400" />
              
              <div className="space-y-1.5 text-right">
                <h3 className="text-lg font-extrabold text-stone-50">درخواست هماهنگی و مشاوره رایگان</h3>
                <p className="text-stone-400 text-xs font-light">مبلمان واسطه‌گری ما را با بهترین شرایط قیمتی کاندید کنید. کارشناسان ما جهت هماهنگی با شما تماس خواهند گرفت.</p>
              </div>

              {!formSuccess ? (
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-300 block text-right">
                      نام و نام خانوادگی <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: علی محمدی"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-right bg-stone-800/80 border border-stone-700/80 rounded-xl py-2.5 px-4 text-xs text-stone-50 placeholder-stone-500 focus:outline-none focus:border-stone-400 transition-colors"
                    />
                  </div>

                  {/* Phone field with Iranian Validation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-300 block text-right">
                      شماره موبایل <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 09123456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full text-left bg-stone-800/80 border border-stone-700/80 rounded-xl py-2.5 px-4 text-xs text-stone-50 placeholder-stone-500 focus:outline-none focus:border-stone-400 transition-colors"
                      dir="ltr"
                    />
                  </div>

                  {/* City Select */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-300 block text-right">
                        شهر محل سکونت <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        className="w-full text-right bg-stone-800/80 border border-stone-700/80 rounded-xl py-2.5 px-3 text-xs text-stone-100 focus:outline-none focus:border-stone-400 transition-colors"
                      >
                        {iranianCities.map((c) => (
                          <option key={c} value={c} className="bg-stone-900 text-stone-100 text-right">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-300 block text-right">توضیحات اختیاری (پارچه، کلاف، ابعاد خاص)</label>
                    <textarea
                      rows={3}
                      placeholder="رنگ پارچه دلخواه را اینجا یادداشت کنید..."
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="w-full text-right bg-stone-800/80 border border-stone-700/80 rounded-xl py-2.5 px-4 text-xs text-stone-50 placeholder-stone-500 focus:outline-none focus:border-stone-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Errors display */}
                  {errorMessage && (
                    <div className="flex gap-2 items-start bg-red-950/50 border border-red-900/60 p-3 rounded-xl text-red-300 text-xs">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-stone-50 hover:bg-stone-200 text-stone-900 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">در حال بررسی اطلاعات...</span>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4" />
                        <span>ثبت رایگان درخواست مشاوره</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-stone-800/40 border border-stone-700 p-6 rounded-2xl text-center space-y-4"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-extrabold text-stone-50">بسته طلایی و تخفیف ۵٪ شما رزرو شد!</h4>
                  <p className="text-stone-300 text-xs font-light leading-relaxed">
                    با تشکر از ثبت هوشمندانه درخواست در پلتفرم واسطه‌گری <span className="font-semibold text-stone-50">مدرن هوم</span>.<br />
                    تخفیف انحصاری ۵٪، بن مشاوره دکوراسیون و گارانتی کاربری مهندسی متریال مبل برای شماره‌ی <span className="font-bold underline text-stone-100">{customerPhone}</span> قفل شد. کارشناسان ما ظرف ۲۴ ساعت آینده با شما تماس خواهند گرفت.
                  </p>
                  <button
                    onClick={() => setFormSuccess(false)}
                    className="bg-stone-700 hover:bg-stone-600 text-stone-50 text-[10px] px-4 py-2 rounded-lg font-bold"
                  >
                    ثبت مجدد درخواستِ مشاوره
                  </button>
                </motion.div>
              )}
            </div>

            {/* Platform notice badge */}
            <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-3xl flex gap-2.5 items-start">
              <BadgeInfo className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-stone-500 leading-relaxed text-right">
                <strong>توجه مالی:</strong> پرداخت شما مستقیماً در وجه نمایشگاه مبلمان به قیمت مصوب تولیدی، در فاکتور رسمی نمایشگاه تسویه می‌شود. هیچ مبلغی تحت عنوان بیعانه از طرف این پلتفرم از کلاینت‌ها اخذ نخواهد شد.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
