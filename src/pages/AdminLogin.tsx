import { adminFetch } from "../adminFetch";
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, ShieldAlert, ArrowRight, Sofa } from "lucide-react";
import { motion } from "motion/react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("لطفاً نام کاربری و رمز عبور را وارد نمایید.");
      setLoading(false);
      return;
    }

    try {
      const res = await adminFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        
        // Trigger page refresh or custom event so layout detects the auth change
        window.dispatchEvent(new Event("storage"));
        navigate("/admin");
      } else {
        setError(data.error || "نام کاربری یا کلمه عبور نادرست است.");
      }
    } catch (err: any) {
      setError("عملیات با خطا مواجه شد. از اتصال پایگاه داده مطمئن شوید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-stone-100 min-h-screen text-stone-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border border-stone-200 shadow-xl rounded-3xl p-8 space-y-6 text-right"
      >
        {/* Header decoration */}
        <div className="flex justify-between items-start mb-2">
          <Link to="/" className="text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 p-2 rounded-xl border border-stone-100 transition-colors flex items-center gap-1.5 text-[10px] font-bold">
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به سایت</span>
          </Link>
        </div>
        
        <div className="text-center space-y-2 mt-2">
          <div className="w-12 h-12 bg-stone-900 text-stone-50 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Sofa className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-stone-950 font-sans tracking-tight">
            ورود به سیستم مدیریت Modern Home
          </h1>
          <p className="text-xs text-stone-400 font-light select-none">
            پنل کنترل واسطه‌گری و ثبت گزارشات حسابداری پورسانت
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 block text-right">
              نام کاربری ادمین
            </label>
            <input
              type="text"
              required
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-right bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-xs text-stone-900 focus:outline-none focus:border-stone-500 transition-all font-mono"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5 font-mono">
            <label className="text-xs font-bold text-stone-500 block text-right font-sans">
              رمز عبور امنیتی
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-left bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-xs text-stone-900 focus:outline-none focus:border-stone-500 transition-all"
              dir="ltr"
            />
          </div>

          {/* Local alert */}
          {error && (
            <div className="flex gap-2 items-start bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs text-right">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-stone-50 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? "در حال احراز هویت..." : "ورود ایمن به پنل"}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-stone-100 flex justify-center items-center text-[10px] text-stone-400">
          <span>داده سِشن: محلی (LocalStorage)</span>
        </div>
      </motion.div>
    </div>
  );
}
