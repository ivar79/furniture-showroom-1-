import { Request, Response, NextFunction } from "express";

/**
 * دکوراتور هماهنگ‌کننده احراز هویت و دسترسی به پنل مدیریت
 * این میدل‌ور از دسترسی کاربران غیرمجاز به اطلاعات حساس سفارش‌ها جلوگیری می‌کند.
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // در محیط تست یا پروداکشن، هدر Authorization بررسی می‌شود
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "دسترسی غیرمجاز. لطفا ابتدا وارد حساب مدیریت خود شوید."
    });
  }

  const token = authHeader.split(" ")[1];
  
  // توکن نمونه ثبت شده در فرانت‌اند
  if (token !== "admin-session-token-f918903u21dwad") {
    return res.status(403).json({
      success: false,
      error: "توکن نامعتبر است یا منقضی گردیده است."
    });
  }

  next();
}
