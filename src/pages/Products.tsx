import { useState, useEffect } from "react";
import { Product, Category } from "../types";
import ProductCard from "../components/ProductCard";
import { Search, SlidersHorizontal, Archive, Sofa, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const prodRes = await fetch("/api/products");
        const prodData = await prodRes.json();
        if (prodData.success) {
          setProducts(prodData.products);
        }

        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (catData.success) {
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error("Products loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products locally for instantaneous UI performance
  const filteredProducts = products.filter((item) => {
    const product = item.product;
    const matchesCategory = selectedCategory === "ALL" || product.categoryId === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.material && product.material.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch && product.isActive;
  });

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-right space-y-3 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            کالکشن مبلمان لوکس و ژورنالی
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
            محصول نهایی را در ابعاد، کلاف، پارچه و اسفنج دلخواه سفارشی‌سازی کنید. هر محصول تحت وکیل واسطه‌گری ما در معتبرترین نمایشگاه‌ها با ضمانت فیزیکی قابل هماهنگی است.
          </p>
        </div>

        {/* Search & Filters Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Box */}
            <div className="bg-white border border-stone-200/60 p-5 rounded-3xl space-y-3">
              <label className="text-xs font-bold text-stone-800 block text-right">جستجوی مبل</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: چستر، استیل، مدرن..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-3 pr-10 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
                />
                <Search className="w-4 h-4 text-stone-400 absolute top-3 right-3" />
              </div>
            </div>

            {/* Category selection */}
            <div className="bg-white border border-stone-200/60 p-5 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                <h3 className="text-xs font-bold text-stone-800">دسته‌بندی‌ها</h3>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-medium transition-all flex justify-between items-center ${
                    selectedCategory === "ALL"
                      ? "bg-stone-900 text-stone-50"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <span>همه کالاها</span>
                  <Archive className="w-3.5 h-3.5" />
                </button>

                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-medium transition-all flex justify-between items-center ${
                      selectedCategory === c.id
                        ? "bg-stone-900 text-stone-50"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>{c.name}</span>
                    <ChevronIndicator />
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Products Grid Stage */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white border border-stone-200 rounded-3xl h-[400px]" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((item) => (
                    <ProductCard
                      key={item.product.id}
                      product={item.product}
                      showroomName={item.showroomName}
                      categoryName={item.categoryName}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-white border border-stone-200/50 rounded-3xl space-y-4">
                <Sofa className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-bold text-stone-800">هیچ مبلی یافت نشد!</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                  احتمالاً فیلترهای جستجوی شما بسیار سخت‌گیرانه هستند. فیلترها را ریست کنید یا کلمه‌ی دیگری بنویسید.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("ALL");
                    setSearchQuery("");
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs px-5 py-2.5 rounded-xl font-semibold transition-all"
                >
                  دیدن تمام مبل‌ها
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

function ChevronIndicator() {
  return (
    <svg className="w-3 h-3 text-current transform rotate-180 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
