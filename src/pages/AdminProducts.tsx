import React, { useEffect, useState } from "react";
import { Product, Showroom, Category } from "../types";
import { Plus, Edit2, Check, X, Sofa, Trash2, Save, Sparkles, Image, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Panel toggles
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form fields states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [images, setImages] = useState("");
  const [colors, setColors] = useState("");
  const [material, setMaterial] = useState("چوب چنار و پارچه مسکو نانو");
  const [dimensions, setDimensions] = useState("طول: ۲۲۰ سانتی‌متر - عرض: ۹۰ سانتی‌متر");
  const [fabricType, setFabricType] = useState("میکروفایبر ضد لک");
  const [innerFrame, setInnerFrame] = useState("روس چنار خشک");
  const [seatSponge, setSeatSponge] = useState("۳۵ کیلویی ویژه ویژه");
  const [baseMaterial, setBaseMaterial] = useState("راش گرجستان");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [showroomId, setShowroomId] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      const prodRes = await fetch("/api/products");
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.products);

      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      if (catData.success) {
        setCategories(catData.categories);
        if (catData.categories.length > 0) setCategoryId(catData.categories[0].id);
      }

      const showRes = await fetch("/api/showrooms");
      const showData = await showRes.json();
      if (showData.success) {
        setShowrooms(showData.showrooms);
        if (showData.showrooms.length > 0) setShowroomId(showData.showrooms[0].id);
      }
    } catch (err) {
      console.error("Products admin loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditProduct(null);
    setName("");
    setSlug("");
    setDescription("");
    setBasePrice("");
    setImages("");
    setColors("");
    setMaterial("چوب چنار و پارچه مسکو نانو");
    setDimensions("طول: ۲۲۰ - عرض: ۹۰ سانتی‌متر");
    setFabricType("میکروفایبر ضد لک");
    setInnerFrame("روس چنار خشک");
    setSeatSponge("۳۵ کیلویی ویژه ویژه");
    setBaseMaterial("راش گرجستان");
    setIsFeatured(false);
    setIsActive(true);
    if (categories.length > 0) setCategoryId(categories[0].id);
    if (showrooms.length > 0) setShowroomId(showrooms[0].id);
    setErrorMsg("");
  };

  const handleEditClick = (p: Product) => {
    setEditProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description || "");
    setBasePrice(String(p.basePrice));
    setImages(p.images?.join(", ") || "");
    setColors(p.colors?.join("، ") || "");
    setMaterial(p.material || "");
    setDimensions(p.dimensions || "");
    setFabricType(p.fabricType || "");
    setInnerFrame(p.innerFrame || "");
    setSeatSponge(p.seatSponge || "");
    setBaseMaterial(p.baseMaterial || "");
    setIsFeatured(p.isFeatured);
    setIsActive(p.isActive);
    setCategoryId(p.categoryId);
    setShowroomId(p.showroomId);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteToggle = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const parsed = await res.json();
      if (parsed.success) {
        await fetchData();
      }
    } catch (err) {
      console.error("Delete product toggle request failed:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    if (!name || !slug || !basePrice || !categoryId || !showroomId) {
      setErrorMsg("لطفاً تمام کادرهای الزامی را تکمیل بفرمایید.");
      setSaving(false);
      return;
    }

    const parsedImages = images.split(",").map(i => i.trim()).filter(Boolean);
    const parsedColors = colors.split(/[،,]/).map(c => c.trim()).filter(Boolean);

    const payload = {
      name,
      slug,
      description,
      basePrice,
      images: parsedImages,
      colors: parsedColors,
      material,
      dimensions,
      fabricType,
      innerFrame,
      seatSponge,
      baseMaterial,
      isFeatured,
      isActive,
      categoryId,
      showroomId,
    };

    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : "/api/products";
      const method = editProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const parsed = await res.json();
      if (parsed.success) {
        setShowForm(false);
        resetForm();
        await fetchData();
      } else {
        setErrorMsg(parsed.error || "ذخیره‌سازی اطلاعات با خطا روبه‌رو شد.");
      }
    } catch (err) {
      setErrorMsg("عدم برقراری ارتباط با پلتفرم سرور دیتابیس.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right pb-10">
      
      {/* Header section with Plus toggle */}
      <div className="flex justify-between items-center border-b border-stone-200/50 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">مدیریت کل گالری مبل‌ها</h1>
          <p className="text-xs text-stone-400 mt-1">ویرایش مشخصات فنی کلاف، فوم، رنگ‌بندی‌های تکمیلی و قیمت کاتالوگ</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs px-4 py-2.5 rounded-xl font-bold transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? "بستن فرم مبل" : "افزودن مبل جدید"}</span>
        </button>
      </div>

      {/* Advanced Create/Edit Form Panel */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-stone-200/50 p-6 sm:p-8 rounded-3xl text-right shadow-sm"
        >
          <div className="border-b border-stone-100 pb-4 mb-6">
            <h3 className="text-base font-extrabold text-stone-900">
              {editProduct ? "ویرایش و به‌روزرسانی مدل مبل" : "تعریف و گنجاندن مبل ژورنالی جدید"}
            </h3>
            <p className="text-[10px] text-stone-400">تمام مشخصات فنی را با دقت پر کنید تا برگه مشاوره مشتریان پربارتر باشد.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Simple Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Product Name */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-stone-600">نام مبل (فارسی) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مبل راحتی چستر لوکس"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Autofill slug for convenience
                    if (!editProduct) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "-").replace(/-+/g, "-"));
                    }
                  }}
                  className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-stone-600">شناسه لینک یکتا (Slug) <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="chesterfield-luxury-sofa"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-left bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none font-mono"
                  dir="ltr"
                />
              </div>

              {/* Base Price */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-stone-600">قیمت پایه نمایشگاه (به تومان) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  required
                  placeholder="مثال: 65000000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  className="w-full text-left bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none"
                  dir="ltr"
                />
              </div>

              {/* Category Select */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-stone-600">دسته‌بندی مربوطه <span className="text-red-400">*</span></label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2 px-2 text-xs text-stone-800 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Showroom select */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-stone-600">نمایشگاه سازنده <span className="text-red-400">*</span></label>
                <select
                  value={showroomId}
                  onChange={(e) => setShowroomId(e.target.value)}
                  className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2 px-2 text-xs text-stone-800 focus:outline-none"
                >
                  {showrooms.map((sr) => (
                    <option key={sr.id} value={sr.id}>{sr.name}</option>
                  ))}
                </select>
              </div>

              {/* Colors array */}
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-stone-600">کالیته‌های رنگ (با ویرگول الک کنید)</label>
                <input
                  type="text"
                  placeholder="طوسی، کرم، سرمه‌ای، یاقوتی"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-xs text-stone-900 focus:outline-none"
                />
              </div>

            </div>

            {/* Images stage URLs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600">نشانی آدرس تصاویر مبل (با کاما جدا کنید)</label>
              <textarea
                rows={2}
                placeholder="https://images.unsplash.com/photo-1555041469-a586c61ea9bc , https://images.unsplash.com/photo-1484101403633-562f891dc89a"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                className="w-full text-left bg-stone-50 border border-stone-200 rounded-xl py-2 px-4 text-xs text-stone-900 focus:outline-none resize-none font-mono"
                dir="ltr"
              />
            </div>

            {/* Spec Tables details */}
            <div className="bg-stone-50 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6 border border-stone-150">
              
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-stone-600">جنس کلاف کل کار بدنه</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full text-right bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-stone-600">ابعاد و ساختار فیزیکی</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full text-right bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-stone-600">نوع پارچه روکش کار</label>
                <input
                  type="text"
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="w-full text-right bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-stone-600">جنس پایه‌ها (روکار)</label>
                <input
                  type="text"
                  value={baseMaterial}
                  onChange={(e) => setBaseMaterial(e.target.value)}
                  className="w-full text-right bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-stone-600">کلاف داخلی کار</label>
                <input
                  type="text"
                  value={innerFrame}
                  onChange={(e) => setInnerFrame(e.target.value)}
                  className="w-full text-right bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs text-stone-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] sm:text-xs font-bold text-stone-600">نوع اسفنج و فوم نشیمن</label>
                <input
                  type="text"
                  value={seatSponge}
                  onChange={(e) => setSeatSponge(e.target.value)}
                  className="w-full text-right bg-white border border-stone-200 rounded-lg py-2 px-3 text-xs text-stone-800 focus:outline-none"
                />
              </div>

            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600">توضیحات و خصوصیات معرفی مبل کاتالوگ</label>
              <textarea
                rows={3}
                placeholder="توضیحات کامل درباره سبک نشیمن، ویژگی چرم یا پارچه، کوسن‌ها..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2 px-4 text-xs text-stone-900 focus:outline-none resize-none"
              />
            </div>

            {/* Checkbox settings */}
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-stone-950 border-stone-300 rounded focus:ring-stone-950 accent-stone-950"
                />
                <label htmlFor="isFeatured" className="text-xs font-bold text-stone-700 cursor-pointer select-none flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>پیشنهاد برتر دکوراسیون (Featured)</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-stone-950 border-stone-300 rounded focus:ring-stone-950 accent-stone-950"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                  فروش فعال در شووروم عمومی سایت
                </label>
              </div>
            </div>

            {/* Errors block */}
            {errorMsg && (
              <div className="bg-red-50 text-red-800 p-3.5 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Submit Action buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "در حال ثبت کالا در دیتابیس..." : editProduct ? "به‌روزرسانی کاتالوگ مبل" : "افزودن قطعی مبل به کاتالوگ"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs px-6 py-3 rounded-xl font-bold transition-all"
              >
                انصراف
              </button>
            </div>

          </form>
        </motion.div>
      )}

      {/* Products list table */}
      <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900" />
          </div>
        ) : products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-stone-500">
              <thead className="text-xs uppercase text-stone-400 bg-stone-50/50 rounded-xl">
                <tr>
                  <th className="px-4 py-3.5 rounded-r-xl">تصویر مبل</th>
                  <th className="px-4 py-3.5">نام مدل</th>
                  <th className="px-4 py-3.5">دسته‌بندی مبل</th>
                  <th className="px-4 py-3.5">نمایشگاه سازنده</th>
                  <th className="px-4 py-3.5">قیمت کاتالوگ</th>
                  <th className="px-4 py-3.5">وضعیت معرفی</th>
                  <th className="px-4 py-3.5 text-center rounded-l-xl">عملیات ادمین</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((item: any) => {
                  const p = item.product;
                  return (
                    <tr key={p.id} className={`hover:bg-stone-50/50 transition-colors text-xs text-stone-800 ${!p.isActive ? "opacity-60 bg-stone-50/20" : ""}`}>
                      
                      <td className="px-4 py-3">
                        <div className="w-16 h-12 rounded-lg bg-stone-100 overflow-hidden border border-stone-50/80 shadow-sm shrink-0">
                          <img
                            src={p.images?.[0] || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80"}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3 font-extrabold text-stone-900">
                        <div className="space-y-1">
                          <p>{p.name}</p>
                          <span className="text-[10px] text-stone-400 font-mono" dir="ltr">{p.slug}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-stone-600">{item.categoryName}</td>

                      <td className="px-4 py-3 text-stone-600 font-bold">{item.showroomName}</td>

                      <td className="px-4 py-3 font-extrabold text-stone-900">
                        {new Intl.NumberFormat("fa-IR").format(p.basePrice)} تومان
                      </td>

                      <td className="px-4 py-3 space-x-1 space-y-1">
                        {p.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            ویژه
                          </span>
                        )}
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            در حال نمایش
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md text-[10px] font-medium border border-stone-200">
                            مخفی شده
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center items-center">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-800 p-2 rounded-lg transition-colors"
                            title="ویرایش مشخصات مبل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteToggle(p.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              p.isActive ? "bg-rose-50 hover:bg-rose-100 text-rose-750" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-750"
                            }`}
                            title={p.isActive ? "مخفی کردن از نمایشگاه عمومی" : "نمایش مجدد در کاتالوگ"}
                          >
                            {p.isActive ? <Trash2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-stone-50 rounded-2xl text-stone-400 text-xs">
            هیچ ملزوماتی به عنوان مبلمان کاتالوگ ثبت نشده است.
          </div>
        )}

      </div>

    </div>
  );
}
