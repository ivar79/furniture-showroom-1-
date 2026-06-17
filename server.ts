import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import { getDb } from "./src/db/index";
import { runSeed } from "./src/db/seed";
import * as schema from "./src/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

dotenv.config();

// Ensure db gets initialized and seeded safely
async function initializeApp() {
  try {
    const db = getDb();
    console.log("Database connected successfully during server boot.");
    await runSeed();
  } catch (err) {
    console.error("Database connection/seeding failed on startup:", err);
  }
}

initializeApp();

const app = express();
const PORT = 3000;

app.use(express.json());

// Simplistic robust Tokenless Admin auth endpoint for AI Studio Preview
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "نام کاربری و رمز عبور الزامی است." });
  }

  try {
    const db = getDb();
    const found = await db
      .select()
      .from(schema.admins)
      .where(eq(schema.admins.username, username))
      .limit(1);

    if (found.length === 0) {
      return res.status(401).json({ success: false, error: "نام کاربری یا رمز عبور اشتباه است." });
    }

    const admin = found[0];
    const isMatched = await bcryptjs.compare(password, admin.password);
    
    if (!isMatched) {
      return res.status(401).json({ success: false, error: "نام کاربری یا رمز عبور اشتباه است." });
    }

    // Return mock success with localized session indicator
    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
      },
      token: "admin-session-token-f918903u21dwad"
    });
  } catch (error: any) {
    console.error("Login failure:", error);
    return res.status(500).json({ success: false, error: "خطایی در سیستم رخ داده است." });
  }
});

// -----------------------------------------------------------------------------
// SHOWROOMS API
// -----------------------------------------------------------------------------
app.get("/api/showrooms", async (req, res) => {
  try {
    const db = getDb();
    const list = await db.select().from(schema.showrooms).orderBy(desc(schema.showrooms.createdAt));
    return res.json({ success: true, showrooms: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/showrooms", async (req, res) => {
  const { name, city, contactPhone, contactName, commissionRate, address, notes, isActive } = req.body;
  if (!name || !city || !contactPhone || commissionRate === undefined) {
    return res.status(400).json({ success: false, error: "پر کردن فیلدهای ستاره‌دار الزامی است." });
  }
  try {
    const db = getDb();
    const inserted = await db.insert(schema.showrooms).values({
      name,
      city,
      contactPhone,
      contactName,
      commissionRate: commissionRate.toString(),
      address,
      notes,
      isActive: isActive !== false,
    }).returning();
    return res.json({ success: true, showroom: inserted[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/showrooms/:id", async (req, res) => {
  const { id } = req.params;
  const { name, city, contactPhone, contactName, commissionRate, address, notes, isActive } = req.body;
  try {
    const db = getDb();
    const updated = await db.update(schema.showrooms).set({
      name,
      city,
      contactPhone,
      contactName,
      commissionRate: commissionRate ? commissionRate.toString() : undefined,
      address,
      notes,
      isActive: isActive === undefined ? undefined : isActive,
      updatedAt: new Date(),
    }).where(eq(schema.showrooms.id, id)).returning();
    return res.json({ success: true, showroom: updated[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/showrooms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    // Soft toggle isActive instead of hard delete
    const current = await db.select().from(schema.showrooms).where(eq(schema.showrooms.id, id)).limit(1);
    if (current.length === 0) {
      return res.status(404).json({ success: false, error: "نمایشگاه یافت نشد." });
    }
    const updated = await db.update(schema.showrooms)
      .set({ isActive: !current[0].isActive })
      .where(eq(schema.showrooms.id, id))
      .returning();
    return res.json({ success: true, showroom: updated[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// CATEGORIES API
// -----------------------------------------------------------------------------
app.get("/api/categories", async (req, res) => {
  try {
    const db = getDb();
    const list = await db.select().from(schema.categories).orderBy(schema.categories.sortOrder);
    return res.json({ success: true, categories: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------------------------
// PRODUCTS API
// -----------------------------------------------------------------------------
app.get("/api/products", async (req, res) => {
  const { categorySlug, showcaseOnly } = req.query;
  try {
    const db = getDb();
    
    // Join products with category and showroom
    const list = await db.select({
      product: schema.products,
      showroomName: schema.showrooms.name,
      categoryName: schema.categories.name,
    })
    .from(schema.products)
    .innerJoin(schema.showrooms, eq(schema.products.showroomId, schema.showrooms.id))
    .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .orderBy(desc(schema.products.createdAt));

    let filtered = list;
    if (showcaseOnly === "true") {
      filtered = filtered.filter(p => p.product.isFeatured && p.product.isActive);
    }
    
    return res.json({ success: true, products: filtered });
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const db = getDb();
    const results = await db.select({
      product: schema.products,
      showroom: schema.showrooms,
      category: schema.categories,
    })
    .from(schema.products)
    .innerJoin(schema.showrooms, eq(schema.products.showroomId, schema.showrooms.id))
    .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(eq(schema.products.slug, slug))
    .limit(1);

    if (results.length === 0) {
      // Try fetching by ID
      const resultsById = await db.select({
        product: schema.products,
        showroom: schema.showrooms,
        category: schema.categories,
      })
      .from(schema.products)
      .innerJoin(schema.showrooms, eq(schema.products.showroomId, schema.showrooms.id))
      .innerJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .where(eq(schema.products.id, slug))
      .limit(1);

      if (resultsById.length === 0) {
        return res.status(404).json({ success: false, error: "محصول مورد نظر یافت نشد." });
      }
      return res.json({ success: true, data: resultsById[0] });
    }

    return res.json({ success: true, data: results[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  const {
    name, slug, description, basePrice, images, colors,
    material, dimensions, fabricType, innerFrame, seatSponge,
    baseMaterial, isFeatured, isActive, categoryId, showroomId
  } = req.body;

  if (!name || !slug || !basePrice || !categoryId || !showroomId) {
    return res.status(400).json({ success: false, error: "فیلدهای اجباری پر نشده‌اند." });
  }

  try {
    const db = getDb();
    
    // Check slug uniqueness
    const exists = await db.select().from(schema.products).where(eq(schema.products.slug, slug)).limit(1);
    if (exists.length > 0) {
      return res.status(400).json({ success: false, error: "شناسه یکتا (slug) تکراری است." });
    }

    const parsedImages = Array.isArray(images) ? images : [images].filter(Boolean);
    const parsedColors = Array.isArray(colors) ? colors : colors ? colors.split("،").map((c: string) => c.trim()) : [];

    const inserted = await db.insert(schema.products).values({
      name,
      slug,
      description,
      basePrice: Number(basePrice),
      images: parsedImages,
      colors: parsedColors,
      material,
      dimensions,
      fabricType,
      innerFrame,
      seatSponge,
      baseMaterial,
      isFeatured: !!isFeatured,
      isActive: isActive !== false,
      categoryId,
      showroomId,
    }).returning();

    return res.json({ success: true, product: inserted[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name, slug, description, basePrice, images, colors,
    material, dimensions, fabricType, innerFrame, seatSponge,
    baseMaterial, isFeatured, isActive, categoryId, showroomId
  } = req.body;

  try {
    const db = getDb();
    
    const parsedImages = Array.isArray(images) ? images : undefined;
    const parsedColors = Array.isArray(colors) ? colors : colors ? colors.split("،").map((c: string) => c.trim()) : undefined;

    const updated = await db.update(schema.products).set({
      name,
      slug,
      description,
      basePrice: basePrice ? Number(basePrice) : undefined,
      images: parsedImages,
      colors: parsedColors,
      material,
      dimensions,
      fabricType,
      innerFrame,
      seatSponge,
      baseMaterial,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
      isActive: isActive !== undefined ? !!isActive : undefined,
      categoryId,
      showroomId,
      updatedAt: new Date(),
    }).where(eq(schema.products.id, id)).returning();

    return res.json({ success: true, product: updated[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    // Soft Toggle dynamic state
    const current = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
    if (current.length === 0) {
      return res.status(404).json({ success: false, error: "محصول یافت نشد." });
    }
    const updated = await db.update(schema.products)
      .set({ isActive: !current[0].isActive })
      .where(eq(schema.products.id, id))
      .returning();
    return res.json({ success: true, product: updated[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


// -----------------------------------------------------------------------------
// ORDERS API
// -----------------------------------------------------------------------------
app.post("/api/orders", async (req, res) => {
  const { customerName, customerPhone, customerCity, customerMessage, productId } = req.body;

  if (!customerName || !customerPhone || !customerCity || !productId) {
    return res.status(400).json({ success: false, error: "لطفاً تمام فیلدهای ستاره‌دار را تکمیل کنید." });
  }

  // Iranian Phone Regex validation
  const iranPhoneRegex = /^(\+98|0098|98|0)?9[0-9]{9}$/;
  if (!iranPhoneRegex.test(customerPhone)) {
    return res.status(400).json({ success: false, error: "شماره موبایل وارد شده معتبر نیست. مثال: 09123456789" });
  }

  try {
    const db = getDb();

    // Fetch product to find showroomId and initial commission rate
    const foundProducts = await db.select({
      product: schema.products,
      showroom: schema.showrooms
    })
    .from(schema.products)
    .innerJoin(schema.showrooms, eq(schema.products.showroomId, schema.showrooms.id))
    .where(eq(schema.products.id, productId))
    .limit(1);

    if (foundProducts.length === 0) {
      return res.status(444).json({ success: false, error: "محصول انتخابی وجود ندارد." });
    }

    const matchedProduct = foundProducts[0].product;
    const matchedShowroom = foundProducts[0].showroom;

    // Create Order with base PENDING status, copying showroom commission rate
    const finalOrder = await db.insert(schema.orders).values({
      customerName,
      customerPhone,
      customerCity,
      customerMessage,
      productId,
      showroomId: matchedProduct.showroomId,
      commissionRate: matchedShowroom.commissionRate,
      status: "PENDING",
    }).returning();

    return res.json({
      success: true,
      message: "درخواست شما ثبت شد. کارشناسان ما ظرف ۲۴ ساعت تماس می‌گیرند.",
      order: finalOrder[0]
    });
  } catch (error: any) {
    console.error("Order submit failed:", error);
    return res.status(500).json({ success: false, error: "خطایی پیش آمده: " + error.message });
  }
});

// Admin Filtered Orders API
app.get("/api/admin/orders", async (req, res) => {
  const { status, showroomId, search } = req.query;
  try {
    const db = getDb();
    
    let query = db.select({
      order: schema.orders,
      productName: schema.products.name,
      showroomName: schema.showrooms.name,
    })
    .from(schema.orders)
    .innerJoin(schema.products, eq(schema.orders.productId, schema.products.id))
    .innerJoin(schema.showrooms, eq(schema.orders.showroomId, schema.showrooms.id))
    .orderBy(desc(schema.orders.createdAt));

    let list = await query;

    // Apply client filters manually in-memoriam or build conditions dynamically
    if (status && status !== "ALL") {
      list = list.filter(o => o.order.status === status);
    }
    if (showroomId && showroomId !== "ALL") {
      list = list.filter(o => o.order.showroomId === showroomId);
    }
    if (search) {
      const searchStr = String(search).toLowerCase();
      list = list.filter(o => 
        o.order.customerName.toLowerCase().includes(searchStr) || 
        o.order.customerPhone.toLowerCase().includes(searchStr) ||
        o.productName.toLowerCase().includes(searchStr)
      );
    }

    return res.json({ success: true, orders: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/admin/orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    const result = await db.select({
      order: schema.orders,
      product: schema.products,
      showroom: schema.showrooms,
    })
    .from(schema.orders)
    .innerJoin(schema.products, eq(schema.orders.productId, schema.products.id))
    .innerJoin(schema.showrooms, eq(schema.orders.showroomId, schema.showrooms.id))
    .where(eq(schema.orders.id, id))
    .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: "سفارش یافت نشد." });
    }

    // Include the commission relation if exists
    const commissionRec = await db.select().from(schema.commissions).where(eq(schema.commissions.orderId, id)).limit(1);

    return res.json({ success: true, data: result[0], commission: commissionRec[0] || null });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Update/Edit Order in Admin Panel
app.put("/api/admin/orders/:id", async (req, res) => {
  const { id } = req.params;
  const {
    status,
    adminNotes,
    statusNote,
    agreedPrice,
    commissionPaid,
    paymentMethod,
    commissionNotes
  } = req.body;

  try {
    const db = getDb();

    // Fetch existing order to verify rate
    const currentOrder = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
    if (currentOrder.length === 0) {
      return res.status(404).json({ success: false, error: "سفارش یافت نشد." });
    }

    const orderData = currentOrder[0];
    const updatedFields: any = {};

    if (status) updatedFields.status = status;
    if (adminNotes !== undefined) updatedFields.adminNotes = adminNotes;
    if (statusNote !== undefined) updatedFields.statusNote = statusNote;

    // Recalculate commission if agreedPrice is set or changed
    let commissionVal: number | null = orderData.commissionAmount;
    if (agreedPrice !== undefined) {
      const priceNum = agreedPrice ? Number(agreedPrice) : null;
      updatedFields.agreedPrice = priceNum;
      
      if (priceNum && orderData.commissionRate) {
        // commissionAmount = Math.round((agreedPrice * commissionRate) / 100)
        commissionVal = Math.round((priceNum * Number(orderData.commissionRate)) / 100);
        updatedFields.commissionAmount = commissionVal;
      } else {
        updatedFields.commissionAmount = null;
        commissionVal = null;
      }
    }

    if (commissionPaid !== undefined) {
      updatedFields.commissionPaid = !!commissionPaid;
      updatedFields.commissionPaidAt = commissionPaid ? new Date() : null;
    }

    // 1. Update the Order table
    const resultOrder = await db.update(schema.orders)
      .set({
        ...updatedFields,
        updatedAt: new Date(),
      })
      .where(eq(schema.orders.id, id))
      .returning();

    // 2. Synchronize the Commissions table
    if (commissionVal && commissionVal > 0) {
      // Check if commission table entry exists
      const existingComm = await db.select().from(schema.commissions).where(eq(schema.commissions.orderId, id)).limit(1);
      
      if (existingComm.length > 0) {
        await db.update(schema.commissions)
          .set({
            amount: commissionVal,
            isPaid: !!commissionPaid,
            paidAt: commissionPaid ? new Date() : null,
            paymentMethod: paymentMethod || existingComm[0].paymentMethod,
            notes: commissionNotes || existingComm[0].notes,
          })
          .where(eq(schema.commissions.orderId, id));
      } else {
        await db.insert(schema.commissions).values({
          orderId: id,
          showroomId: orderData.showroomId,
          amount: commissionVal,
          rateUsed: orderData.commissionRate || "0.00",
          isPaid: !!commissionPaid,
          paidAt: commissionPaid ? new Date() : null,
          paymentMethod: paymentMethod || "ثبت سیستمی",
          notes: commissionNotes || "ثبت خودکار سیستمی",
        });
      }
    }

    return res.json({ success: true, order: resultOrder[0] });
  } catch (error: any) {
    console.error("Order edit in API error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});


// -----------------------------------------------------------------------------
// ADMIN DASHBOARD & FINANCE SUMMARY
// -----------------------------------------------------------------------------
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const db = getDb();
    
    const allOrders = await db.select({
      id: schema.orders.id,
      status: schema.orders.status,
      customerCity: schema.orders.customerCity,
      customerName: schema.orders.customerName,
      customerPhone: schema.orders.customerPhone,
      createdAt: schema.orders.createdAt,
      agreedPrice: schema.orders.agreedPrice,
      commissionAmount: schema.orders.commissionAmount,
      commissionPaid: schema.orders.commissionPaid,
      productId: schema.orders.productId,
      showroomId: schema.orders.showroomId,
      productName: schema.products.name,
      showroomName: schema.showrooms.name,
    })
    .from(schema.orders)
    .innerJoin(schema.products, eq(schema.orders.productId, schema.products.id))
    .innerJoin(schema.showrooms, eq(schema.orders.showroomId, schema.showrooms.id));

    const totalOrdersCount = allOrders.length;
    
    // 1. Live Calculations
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayOrdersCount = allOrders.filter(o => new Date(o.createdAt) >= today).length;
    const pendingCount = allOrders.filter(o => o.status === "PENDING").length;

    // Commission Metrics
    let totalCommissionMonth = 0;
    let earnedCommissionPaid = 0;
    let earnedCommissionUnpaid = 0;

    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    allOrders.forEach(o => {
      const amt = Number(o.commissionAmount) || 0;
      if (amt > 0) {
        if (new Date(o.createdAt) >= currentMonthStart) {
          totalCommissionMonth += amt;
        }
        if (o.commissionPaid) {
          earnedCommissionPaid += amt;
        } else {
          earnedCommissionUnpaid += amt;
        }
      }
    });

    // 2. Analytical Chart Values (30 days past)
    const recentDaysChart: { date: string; value: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      
      const dayLabel = d.toLocaleDateString("fa-IR", { day: "numeric", month: "short" });
      const ordersInDay = allOrders.filter(o => {
        const cDate = new Date(o.createdAt);
        return cDate >= startOfDay && cDate <= endOfDay;
      }).length;

      recentDaysChart.push({
        date: dayLabel,
        value: ordersInDay,
      });
    }

    // Recent orders table
    const recentOrders = [...allOrders]
      .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    return res.json({
      success: true,
      stats: {
        totalOrdersCount,
        todayOrdersCount,
        pendingCount,
        totalCommissionMonth,
        earnedCommissionPaid,
        earnedCommissionUnpaid,
      },
      chartData: recentDaysChart,
      recentOrders,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


// -----------------------------------------------------------------------------
// COMMISSION REPORT API
// -----------------------------------------------------------------------------
app.get("/api/admin/commissions", async (req, res) => {
  res.redirect(307, "/api/admin/commissions-report");
});

app.get("/api/admin/commissions-report", async (req, res) => {
  try {
    const db = getDb();
    
    // Fetch showrooms, orders & commissions details
    const allShowrooms = await db.select().from(schema.showrooms);
    const allOrders = await db.select({
      id: schema.orders.id,
      agreedPrice: schema.orders.agreedPrice,
      commissionAmount: schema.orders.commissionAmount,
      commissionPaid: schema.orders.commissionPaid,
      showroomId: schema.orders.showroomId,
    }).from(schema.orders);

    const report = allShowrooms.map(sr => {
      const sOrders = allOrders.filter(o => o.showroomId === sr.id);
      
      let totalCommission = 0;
      let paidCommission = 0;
      let unpaidCommission = 0;

      sOrders.forEach(o => {
        const amt = Number(o.commissionAmount) || 0;
        totalCommission += amt;
        if (o.commissionPaid) {
          paidCommission += amt;
        } else {
          unpaidCommission += amt;
        }
      });

      return {
        id: sr.id,
        name: sr.name,
        city: sr.city,
        rate: sr.commissionRate,
        ordersCount: sOrders.length,
        totalCommission,
        paidCommission,
        unpaidCommission,
      };
    });

    // Detailed transactions
    const detailedList = await db.select({
      id: schema.commissions.id,
      orderId: schema.commissions.orderId,
      amount: schema.commissions.amount,
      rateUsed: schema.commissions.rateUsed,
      isPaid: schema.commissions.isPaid,
      paidAt: schema.commissions.paidAt,
      paymentMethod: schema.commissions.paymentMethod,
      notes: schema.commissions.notes,
      createdAt: schema.commissions.createdAt,
      customerName: schema.orders.customerName,
      customerPhone: schema.orders.customerPhone,
      showroomName: schema.showrooms.name,
    })
    .from(schema.commissions)
    .innerJoin(schema.orders, eq(schema.commissions.orderId, schema.orders.id))
    .innerJoin(schema.showrooms, eq(schema.commissions.showroomId, schema.showrooms.id))
    .orderBy(desc(schema.commissions.createdAt));

    return res.json({ success: true, report, transactions: detailedList });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


// -----------------------------------------------------------------------------
// DYNAMIC SITE SETTINGS API
// -----------------------------------------------------------------------------
const DEFAULT_SETTINGS: Record<string, string> = {
  about_title: "درباره گالری مبلمان مدرن هوم",
  about_desc: "ما محصول عینی نمی‌فروشیم — ما حلقه ارتباطی امن و وکیل شما با نمایشگا‌ه‌های ممتاز مبلمان کشور هستیم.",
  about_content: "در مدل سنتی خرید مبل، مشتریان معمولاً با چالش‌های بزرگی نظیر قیمت‌های نامتعادل دلالان، تنوع پایین، تحویل دیرهنگام و عدم همخوانی متریال اسفنج کلاف و چوب با ادعای فروشنده مواجه می‌شوند.\n\nپلتفرم مدرن هوم به عنوان مرجع تخصصی دکوراسیون، این خلأ را به شیوه‌ای مدرن پوشش می‌دهد. ما با بیش از ۲۵ کارگاه مبل‌سازی و نمایشگاه‌های برند مبل در بازارهای تخصصی ایران از جمله یافت‌آباد، دلاوران و جاجرود هماهنگ هستیم.",
  contact_address: "تهران، بازار مبل یافت‌آباد غربی، بلوار معلم، ساختمان دیزاین فضا، پلاک ۱۸۰، طبقه ۳",
  contact_phone: "۰۲۱-۶۶۵۴۳۲۱۰ / ۰۹۱۲۳۴۵۶۷۸۹",
  contact_email: "management@modern-home.ir",
  instagram: "modern_home_gallery",
  telegram: "modern_home_admin",
  bale: "@modern_home"
};

app.get("/api/settings", async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.select().from(schema.siteSettings);
    
    const settings = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    
    return res.json({ success: true, settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/admin/settings", async (req, res) => {
  try {
    const db = getDb();
    const { settings } = req.body;
    
    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ success: false, error: "تنظیمات به شکل صحیح فرستاده نشده است." });
    }
    
    for (const [key, val] of Object.entries(settings)) {
      if (typeof val === "string") {
        const existing = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, key)).limit(1);
        if (existing.length > 0) {
          await db.update(schema.siteSettings)
            .set({ value: val, updatedAt: new Date() })
            .where(eq(schema.siteSettings.key, key));
        } else {
          await db.insert(schema.siteSettings).values({
            key,
            value: val,
            updatedAt: new Date()
          });
        }
      }
    }
    
    const rows = await db.select().from(schema.siteSettings);
    const updatedSettings = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      updatedSettings[r.key] = r.value;
    }
    
    return res.json({ success: true, settings: updatedSettings });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});


// -----------------------------------------------------------------------------
// VITE AND DEVELOPMENT DEV SERVER ENGINE
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
