/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";
const DB_FILE = path.join(process.cwd(), "db.json");

const marketplaceProducts = [];

// Presence state
const onlineUsers = new Map<string, { id: string | number; name: string }>();

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("presence:join", (user) => {
    if (user && user.id) {
      onlineUsers.set(socket.id, user);
      io.emit("presence:update", Array.from(onlineUsers.values()));
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("presence:update", Array.from(onlineUsers.values()));
    console.log("User disconnected");
  });
});

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    business_profiles: [],
    loans: [],
    market_feed: [],
    warehouse: { items: [], logs: [] },
    notifications: [
      {
        id: "notif-1",
        user_id: "0",
        title: "Community Reply",
        message: "Sarah commented on your post 'Expanding to Klang Valley'.",
        type: "reply",
        read: false,
        createdAt: new Date().toISOString(),
        link: "/community"
      },
      {
        id: "notif-2",
        user_id: "0",
        title: "Mentor Message",
        message: "Your SME Advisor has drafted a new marketing strategy for you.",
        type: "mentor",
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        link: "/advisor"
      }
    ],
    marketplace_products: marketplaceProducts,
    inventory: [
      {
        id: "i1",
        sku: "ALUM-A1100-S",
        name: "Aluminum Sheet A1100",
        category: "Raw Material",
        unit: "sheets",
        quantity: 50,
        min_stock: 20,
        location_id: "loc1",
        cost: 15.5,
        status: "available",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "i2",
        sku: "PLAS-ABS-01",
        name: "ABS Plastic Pellets",
        category: "Raw Material",
        unit: "kg",
        quantity: 120,
        min_stock: 100,
        location_id: "loc2",
        cost: 4.2,
        status: "available",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    locations: [
      { id: "loc1", name: "WH1-A-01-01", warehouse: "Main", zone: "A", rack: "01", shelf: "01", bin: "01", status: "active" },
      { id: "loc2", name: "WH1-B-02-01", warehouse: "Main", zone: "B", rack: "02", shelf: "01", bin: "01", status: "active" }
    ],
    stock_movements: [
      {
        id: "m1",
        inventory_id: "i1",
        type: "inbound",
        quantity: 50,
        to_location_id: "loc1",
        user_id: "0",
        created_at: new Date().toISOString()
      }
    ],
    community_posts: [
      {
        "id": "1",
        "user_id": "0",
        "author_name": "HoneyBee Team",
        "title": "Welcome to HoneyBee!",
        "content": "We're excited to have you here. HoneyBee is designed to help your SME thrive. Explore the AI Advisor, track your finances, and learn new skills. This platform is built for the community, by the community.",
        "category": "General",
        "likes": 24,
        "comments": [],
        "created_at": "2026-04-15T10:00:00Z"
      },
      {
        "id": "gen-post-2",
        "user_id": "0",
        "author_name": "Community Spirit",
        "title": "New Weekend Market in Bangsar",
        "content": "Check out the new SME market happening this Sunday! It's a great chance to showcase local products. Many of us from the HoneyBee hive will be there.",
        "category": "General",
        "likes": 18,
        "comments": [],
        "created_at": "2026-04-20T08:30:00Z"
      },
      {
        "id": "seed-post-2",
        "user_id": "0",
        "author_name": "HoneyBee Mentor",
        "title": "Tips for managing inventory efficiently",
        "content": "Properly tracking stock can save thousands of ringgits. What are your favorite methods? We recommend regular audits and using a reliable SKU system. \n\nCheck out our Inventory Mastery course in the Academy!",
        "category": "Advice Needed",
        "likes": 15,
        "comments": [
          {
            "id": "c_1",
            "user_id": "0",
            "author_name": "Tech Savvy SME",
            "content": "We started using QR codes for our raw materials and it cut audit time by 50%!",
            "created_at": "2026-04-22T14:20:00Z"
          }
        ],
        "created_at": "2026-04-21T09:00:00Z"
      },
      {
        "id": "seed-post-3",
        "user_id": "0",
        "author_name": "Success Story",
        "title": "How we increased monthly sales by 20% using Digital Ads",
        "content": "Focusing on customer retention and personalized outreach made the difference. Sometimes the best growth comes from your existing base! We used the Marketing Generator in HoneyBee to draft our new campaign. \n\nConsistent posting on Instagram was the key for our local bakery.",
        "category": "Success Stories",
        "likes": 42,
        "comments": [],
        "created_at": "2026-04-05T11:15:00Z"
      },
      {
        "id": "success-post-fresh",
        "user_id": "0",
        "author_name": "Green Grocer",
        "title": "From 1 to 5 outlets in 1 year!",
        "content": "The data insights from HoneyBee's Finance Tracker helped us identify which locations were actually profitable. We secured an SME grant last month thanks to the clear reporting. Don't underestimate the power of data!",
        "category": "Success Stories",
        "likes": 89,
        "comments": [],
        "created_at": "2026-04-12T16:45:00Z"
      },
      {
        "id": "seed-post-4",
        "user_id": "0",
        "author_name": "Marketplace Hub",
        "title": "Looking for affordable eco-friendly packaging suppliers",
        "content": "We are expanding our product line and need recycled paper packaging at scale. Any recommendations for reliable suppliers in the Klang Valley? \n\nWe prioritize sustainability!",
        "category": "Marketplace",
        "likes": 8,
        "comments": [],
        "created_at": "2026-04-25T13:00:00Z"
      },
      {
        "id": "seed-post-5",
        "user_id": "0",
        "author_name": "Batik Queen",
        "title": "Our first export shipment to Europe!",
        "content": "It took 6 months of paperwork but we finally sent our first container of hand-printed fabrics to France. The SME export grants were a huge help. \n\nPersistence pays off! 🌍✈️",
        "category": "Success Stories",
        "likes": 156,
        "comments": [
          {
            "id": "c_2",
            "user_id": "0",
            "author_name": "HoneyBee Mentor",
            "content": "Huge congratulations! This is why we started this hive. 🐝",
            "created_at": "2026-04-28T10:00:00Z"
          }
        ],
        "created_at": "2026-04-27T09:30:00Z"
      },
      {
        "id": "seed-post-6",
        "user_id": "0",
        "author_name": "Finance Whiz",
        "title": "Preparing for Year-End Audit - Don't Panic!",
        "content": "It's already Q4. Make sure your receipts are categorized and your balance sheets are balanced. \n\nPro-tip: Use the Finance Tracker here to stay on top of daily entries so year-end is a breeze.",
        "category": "General",
        "likes": 25,
        "comments": [],
        "created_at": new Date(Date.now() - 432000000).toISOString()
      },
      {
        "id": "seed-post-7",
        "user_id": "0",
        "author_name": "CollaborateNow",
        "title": "Searching for a Graphic Designer for Brand Re-vamp",
        "content": "We are a traditional spice brand looking to modernize our look. If you are a designer specializing in SME branding, let's collaborate! \n\nDM us your portfolio.",
        "category": "Collaboration",
        "likes": 12,
        "comments": [],
        "created_at": new Date(Date.now() - 518400000).toISOString()
      },
      {
        "id": "seed-post-8",
        "user_id": "0",
        "author_name": "Retail Rebel",
        "title": "Moving our brick-and-mortar shop online",
        "content": "We've had a physical store for 15 years, but the last 2 have been tough. We finally launched our Shopify store last month! \n\nIt was a steep learning curve but the 'Web Presence' guide in HoneyBee gave us the confidence to finally do it. 🚀",
        "category": "Success Stories",
        "likes": 88,
        "comments": [],
        "created_at": "2026-04-02T10:00:00Z"
      },
      {
        "id": "seed-post-9",
        "user_id": "0",
        "author_name": "New Boss",
        "title": "Just hired our first full-time staff!",
        "content": "Transitioning from a solopreneur to a team leader is scary but exciting. How do you guys manage payroll and EPF for just one staff? \n\nAny simple tools you'd recommend?",
        "category": "Advice Needed",
        "likes": 34,
        "comments": [
          {
            "id": "c_3",
            "user_id": "0",
            "author_name": "Finance Whiz",
            "content": "Congrats! Check out the KWSP i-Akaun, it's pretty straightforward for small businesses.",
            "created_at": new Date().toISOString()
          }
        ],
        "created_at": new Date(Date.now() - 691200000).toISOString()
      },
      {
        "id": "seed-post-10",
        "user_id": "0",
        "author_name": "Tech Startup MY",
        "title": "Searching for early-stage cloud credits",
        "content": "Does anybody know if there are specific MDEC or government programs that offer AWS/Azure credits for Malaysian tech startups this year? \n\nWe are looking to scale our prototype. ☁️",
        "category": "Collaboration",
        "likes": 5,
        "comments": [],
        "created_at": new Date(Date.now() - 777600000).toISOString()
      },
      {
        "id": "market-post-1",
        "user_id": "0",
        "author_name": "SME Supplier",
        "title": "[WTS] Bulk Organic Honey from Johor",
        "content": "Looking to supply cafes and retail outlets. Our honey is 100% pure and locally sourced. Minimum order 20 jars. Dm for wholesale pricing! 🍯",
        "category": "Marketplace",
        "likes": 15,
        "comments": [],
        "created_at": new Date(Date.now() - 3600000).toISOString()
      },
      {
        "id": "market-post-2",
        "user_id": "0",
        "author_name": "Cafe Owner KL",
        "title": "[WTB] Eco-friendly packaging for takeaway",
        "content": "Searching for a reliable local supplier of biodegradable boxes and straws. Needs to be high quality as we serve hot meals. Any recommendations?",
        "category": "Marketplace",
        "likes": 8,
        "comments": [],
        "created_at": new Date(Date.now() - 7200000).toISOString()
      }
    ],
    courses: [
      {
        id: "c1",
        title: "Mastering Cash Flow",
        description: "Learn how to manage your business finances effectively and avoid common pitfalls.",
        category: "Finance",
        duration: "45 mins",
        thumbnail_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
        lessons: [
          { id: "l1", title: "Introduction to Cash Flow", content: "Cash flow is the movement of money in and out of your business. Understanding your burn rate and runway is essential for SME survival.", order: 1, video_url: "https://www.youtube.com/watch?v=nU-IIIXZuyc" },
          { id: "l2", title: "Tracking Expenses", content: "Keeping track of every expense is crucial for a healthy business. Modern tools allow you to automate receipt scanning and categorization.", order: 2, video_url: "https://www.youtube.com/watch?v=F0OqV8A947g" }
        ]
      },
      {
        id: "c2",
        title: "Digital Marketing for SMEs",
        description: "Grow your online presence and reach more customers with simple digital strategies.",
        category: "Marketing",
        duration: "60 mins",
        thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        lessons: [
          { id: "l3", title: "Social Media Basics", content: "Choose the right platforms for your target audience. LinkedIn is great for B2B, while Instagram and TikTok excel for consumer brands.", order: 1, video_url: "https://www.youtube.com/watch?v=nU-IIIXZuyc" }
        ]
      },
      {
        id: "c3",
        title: "Inventory & Warehouse Mastery",
        description: "Optimize your stock levels and reduce waste with efficient inventory management.",
        category: "Inventory",
        duration: "40 mins",
        thumbnail_url: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80",
        lessons: [
          { id: "l4", title: "SKU Implementation", content: "A well-structured Stock Keeping Unit (SKU) system is the backbone of efficient operations.", order: 1, video_url: "https://www.youtube.com/watch?v=F0OqV8A947g" }
        ]
      },
      {
        id: "c4",
        title: "SME Leadership & Culture",
        description: "Build a high-performing team and a sustainable company culture as a small business owner.",
        category: "Leadership",
        duration: "50 mins",
        thumbnail_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
        lessons: [
          { id: "l5", title: "Visionary Leadership", content: "Learn how to communicate your mission clearly to inspire your team and stakeholders.", order: 1, video_url: "https://www.youtube.com/watch?v=nU-IIIXZuyc" }
        ]
      }
    ]
  }));
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function migrateDb() {
  const db = readDb();
  const oldNames = ["Organic Wildflower Honey", "Wild Rainforest Tualang Honey", "Modern Kebaya Embroidery", "Wild Kelulut Stingless Bee Honey", "Hand painted batik kebaya", "Sambal Hitam Pahang"];
  const hasOldData = db.marketplace_products && db.marketplace_products.some((p: any) => oldNames.includes(p.name));
  
  if (hasOldData) {
    console.log("Removing legacy marketplace products...");
    db.marketplace_products = db.marketplace_products.filter((p: any) => !oldNames.includes(p.name));
    writeDb(db);
  }
}

// Call migration on startup
if (fs.existsSync(DB_FILE)) {
  migrateDb();
}

function sanitizeInput(text: string): string {
  if (!text) return "";
  // Basic sanitization: trim, remove obvious script tags/HTML, and handle potential offensive terms
  let sanitized = text.trim()
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[^\w\s\.\?\!\(\)\k\/\-\:\,\@\#\$\%\&\n]/gi, ''); // Keep common characters only
  
  // Custom filter for specific inappropriate content mentioned by user
  const offensiveRegex = /hawk tuah|kms/gi;
  sanitized = sanitized.replace(offensiveRegex, '[Content Removed]');
  
  return sanitized;
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateId(prefix = ""): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth Middleware
function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  const db = readDb();
  if (db.users.find((u: any) => u.email === email)) {
    return res.status(400).json({ message: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: generateId("u"), name, email, password_hash: passwordHash, created_at: new Date() };
  db.users.push(user);
  writeDb(db);
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

// --- Profile Routes ---
app.get("/api/profile", auth, (req: any, res) => {
  const db = readDb();
  const user = db.users.find((u: any) => u.id === req.user.id);
  const profile = db.business_profiles.find((p: any) => p.user_id === req.user.id);
  res.json({ user, businessProfile: profile || null });
});

app.put("/api/profile/business-profile", auth, (req: any, res) => {
  const { business_name, industry, revenue_range, type, goals, avatar_url, marketplace_notif, community_notif, subscription_plan } = req.body;
  const db = readDb();
  let profile = db.business_profiles.find((p: any) => p.user_id === req.user.id);
  if (profile) {
    profile.business_name = business_name;
    profile.industry = industry;
    profile.revenue_range = revenue_range;
    profile.type = type;
    profile.goals = goals;
    profile.avatar_url = avatar_url;
    profile.marketplace_notif = marketplace_notif ?? profile.marketplace_notif;
    profile.community_notif = community_notif ?? profile.community_notif;
    if (subscription_plan) {
      profile.subscription_plan = subscription_plan;
      profile.subscription_renew_date = new Date(Date.now() + 30 * 86400000).toISOString();
    }
    profile.updated_at = new Date();
  } else {
    profile = { 
      id: generateId("p"), 
      user_id: req.user.id, 
      business_name, 
      industry, 
      revenue_range, 
      type, 
      goals, 
      avatar_url,
      marketplace_notif: marketplace_notif ?? true,
      community_notif: community_notif ?? true,
      subscription_plan: subscription_plan || 'Worker Bee',
      subscription_renew_date: subscription_plan ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
      honey: 0,
      created_at: new Date() 
    };
    db.business_profiles.push(profile);
  }
  writeDb(db);
  res.json(profile);
});

app.post("/api/profile/subscription", auth, (req: any, res) => {
  const { plan } = req.body;
  const db = readDb();
  const profile = db.business_profiles.find((p: any) => p.user_id === req.user.id);
  if (profile) {
    profile.subscription_plan = plan;
    profile.subscription_renew_date = new Date(Date.now() + 30 * 86400000).toISOString();
    writeDb(db);
    res.json(profile);
  } else {
    res.status(404).json({ message: "Profile not found" });
  }
});

app.post("/api/profile/change-password", auth, async (req: any, res) => {
  const { oldPassword, newPassword } = req.body;
  const db = readDb();
  const user = db.users.find((u: any) => u.id === req.user.id);

  if (!user || !(await bcrypt.compare(oldPassword, user.password_hash))) {
    return res.status(400).json({ message: "Current secret code is incorrect" });
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.updated_at = new Date();
  writeDb(db);
  res.json({ success: true });
});

app.post("/api/profile/honey", auth, (req: any, res) => {
  const { amount, source } = req.body;
  const db = readDb();
  const success = addHoneyReward(db, req.user.id, amount, source || "Manual adjustment");
  if (success) {
    writeDb(db);
    const profile = db.business_profiles.find((p: any) => p.user_id === req.user.id);
    res.json({ success: true, honey: profile.honey, history: profile.honeyHistory });
  } else {
    res.status(404).json({ error: "Profile not found" });
  }
});

// --- Finance Routes ---
app.post("/api/transactions", auth, (req: any, res) => {
  const { type, category, amount, notes, txn_date } = req.body;
  const db = readDb();
  const transaction = { id: generateId("t"), user_id: req.user.id, type, category, amount, notes, txn_date, created_at: new Date() };
  db.transactions.push(transaction);
  writeDb(db);
  res.json(transaction);
});

app.get("/api/transactions", auth, (req: any, res) => {
  const db = readDb();
  const txns = db.transactions.filter((t: any) => t.user_id === req.user.id).sort((a: any, b: any) => new Date(b.txn_date).getTime() - new Date(a.txn_date).getTime());
  res.json(txns);
});

app.put("/api/transactions/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const { type, category, amount, notes, txn_date } = req.body;
  const db = readDb();
  const transaction = db.transactions.find((t: any) => t.id === id && t.user_id === req.user.id);
  if (transaction) {
    transaction.type = type;
    transaction.category = category;
    transaction.amount = amount;
    transaction.notes = notes;
    transaction.txn_date = txn_date;
    transaction.updated_at = new Date();
    writeDb(db);
    res.json(transaction);
  } else {
    res.status(404).json({ message: "Transaction not found" });
  }
});

app.delete("/api/transactions/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.transactions.findIndex((t: any) => t.id === id && t.user_id === req.user.id);
  if (index !== -1) {
    db.transactions.splice(index, 1);
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Transaction not found" });
  }
});

app.get("/api/finance/summary", auth, (req: any, res) => {
  const db = readDb();
  const txns = db.transactions.filter((t: any) => t.user_id === req.user.id);
  const totalIncome = txns.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const totalExpenses = txns.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  res.json({ totalIncome, totalExpenses, profit: totalIncome - totalExpenses });
});

app.get("/api/admin/reset-marketplace", auth, (req: any, res) => {
  const db = readDb();
  console.log("Admin requested marketplace reset...");
  db.marketplace_products = marketplaceProducts; // Use the array defined above
  db.notifications.push({
    id: generateId("notif"),
    user_id: req.user.id,
    title: "Market Regenerated! 🐝",
    message: "The Hive Market has been refreshed with 25+ new premium SME treasures.",
    type: "success",
    read: false,
    createdAt: new Date().toISOString()
  });
  writeDb(db);
  res.json({ success: true, message: "Marketplace regenerated" });
});

// --- Insights Routes ---
app.get("/api/health-score", auth, (req: any, res) => {
  const db = readDb();
  const txns = db.transactions.filter((t: any) => t.user_id === req.user.id);
  const revenue = txns.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const expenses = txns.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const revenueTrendPoints = revenue > 5000 ? 25 : revenue > 1000 ? 18 : 10;
  const expenseControlPoints = expenses <= revenue * 0.7 ? 20 : expenses <= revenue * 0.9 ? 12 : 5;
  const profitMarginPoints = profitMargin >= 20 ? 20 : profitMargin >= 10 ? 14 : profitMargin > 0 ? 8 : 2;
  const score = Math.min(100, revenueTrendPoints + expenseControlPoints + profitMarginPoints + 30); // 30 for other factors

  const result = { score, factors: { revenueTrendPoints, expenseControlPoints, profitMarginPoints, revenue, expenses, profit, profitMargin } };
  db.health_scores.push({ user_id: req.user.id, score, factors_json: result.factors, created_at: new Date() });
  writeDb(db);
  res.json(result);
});

app.get("/api/alerts", auth, (req: any, res) => {
  const db = readDb();
  const txns = db.transactions.filter((t: any) => t.user_id === req.user.id);
  const revenue = txns.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const expenses = txns.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  const alerts = [];
  if (expenses > revenue && revenue > 0) {
    alerts.push({ id: generateId("alt-cf"), alert_type: "cashflow", title: "Expenses are higher than revenue", description: "Your business spent more than it earned.", severity: "high" });
  }
  if (revenue > 0 && expenses / revenue > 0.8) {
    alerts.push({ id: generateId("alt-er"), alert_type: "expense_ratio", title: "Expenses are rising too fast", description: "Your expense-to-revenue ratio is above 80%.", severity: "medium" });
  }
  
  db.risk_alerts = db.risk_alerts.filter((a: any) => a.user_id !== req.user.id || a.resolved);
  alerts.forEach(a => db.risk_alerts.push({ ...a, user_id: req.user.id, created_at: new Date() }));
  writeDb(db);
  res.json(alerts);
});

// --- Task Routes ---
app.get("/api/tasks", auth, (req: any, res) => {
  const db = readDb();
  if (!db.tasks) db.tasks = [];
  const tasks = db.tasks.filter((t: any) => t.user_id === req.user.id);
  res.json(tasks);
});

// --- Notification Routes ---
app.get("/api/notifications", auth, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];
  const notifications = db.notifications
    .filter((n: any) => n.user_id === req.user.id)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(notifications);
});

app.post("/api/notifications/read", auth, (req: any, res) => {
  const db = readDb();
  if (!db.notifications) db.notifications = [];
  db.notifications.forEach((n: any) => {
    if (n.user_id === req.user.id) n.read = true;
  });
  writeDb(db);
  res.json({ success: true });
});

app.post("/api/notifications/:id/read", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const notification = db.notifications.find((n: any) => n.id === id && n.user_id === req.user.id);
  if (notification) {
    notification.read = true;
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Notification not found" });
  }
});

app.post("/api/tasks", auth, (req: any, res) => {
  const { title, description, source } = req.body;
  const db = readDb();
  if (!db.tasks) db.tasks = [];
  const task = {
    id: generateId("tsk"),
    user_id: req.user.id,
    title: sanitizeInput(title),
    description: sanitizeInput(description),
    status: 'pending',
    source: source || 'manual',
    created_at: new Date()
  };
  db.tasks.unshift(task);
  writeDb(db);
  res.json(task);
});

app.put("/api/tasks/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const { status, title, description } = req.body;
  const db = readDb();
  const task = db.tasks.find((t: any) => t.id === id && t.user_id === req.user.id);
  if (task) {
    if (status) task.status = status;
    if (title) task.title = sanitizeInput(title);
    if (description) task.description = sanitizeInput(description);
    task.updated_at = new Date();

    // Reward for completing a task
    if (status === 'completed' && task.status !== 'completed') {
      addHoneyReward(db, req.user.id, 5, `Completed task: ${task.title}`);
    }

    writeDb(db);
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

app.delete("/api/tasks/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.tasks.findIndex((t: any) => t.id === id && t.user_id === req.user.id);
  if (index !== -1) {
    db.tasks.splice(index, 1);
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

app.get("/api/inventory", auth, (req: any, res) => {
  const db = readDb();
  const inventory = (db.inventory || []).filter((i: any) => !i.user_id || i.user_id === req.user.id).map((item: any) => {
    const loc = db.locations?.find((l: any) => l.id === item.location_id);
    return { ...item, location_name: loc ? loc.name : "Unknown" };
  });
  res.json(inventory);
});

app.post("/api/inventory", auth, (req: any, res) => {
  const { sku, name, category, unit, quantity, min_stock, location_id, cost, status } = req.body;
  const db = readDb();
  if (!db.inventory) db.inventory = [];
  const item = {
    id: generateId("inv"),
    user_id: req.user.id,
    sku, name, category, unit, quantity: Number(quantity), min_stock: Number(min_stock), 
    location_id, cost: Number(cost), status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.inventory.push(item);
  writeDb(db);
  io.emit("inventory:created", item);
  res.json(item);
});

app.put("/api/inventory/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const { sku, name, category, unit, quantity, min_stock, location_id, cost, status } = req.body;
  const db = readDb();
  const item = db.inventory.find((i: any) => i.id === id && (!i.user_id || i.user_id === req.user.id));
  if (item) {
    item.sku = sku;
    item.name = name;
    item.category = category;
    item.unit = unit;
    item.quantity = Number(quantity);
    item.min_stock = Number(min_stock);
    item.location_id = location_id;
    item.cost = Number(cost);
    item.status = status;
    item.updated_at = new Date().toISOString();
    writeDb(db);
    res.json(item);
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.delete("/api/inventory/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.inventory.findIndex((i: any) => i.id === id && (!i.user_id || i.user_id === req.user.id));
  if (index !== -1) {
    db.inventory.splice(index, 1);
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});

app.get("/api/locations", auth, (req: any, res) => {
  const db = readDb();
  const locations = (db.locations || []).filter((l: any) => !l.user_id || l.user_id === req.user.id);
  res.json(locations);
});

app.post("/api/locations", auth, (req: any, res) => {
  const { name, warehouse, zone, rack, shelf } = req.body;
  const db = readDb();
  if (!db.locations) db.locations = [];
  const location = { 
    id: generateId("loc"), 
    user_id: req.user.id,
    name, 
    warehouse, 
    zone, 
    rack, 
    shelf, 
    bin: "01", 
    status: "active" 
  };
  db.locations.push(location);
  writeDb(db);
  res.json(location);
});

app.put("/api/locations/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const { name, warehouse, zone, rack, shelf } = req.body;
  const db = readDb();
  const location = db.locations.find((l: any) => l.id === id && (!l.user_id || l.user_id === req.user.id));
  if (location) {
    location.name = name;
    location.warehouse = warehouse;
    location.zone = zone;
    location.rack = rack;
    location.shelf = shelf;
    writeDb(db);
    res.json(location);
  } else {
    res.status(404).json({ message: "Location not found" });
  }
});

app.delete("/api/locations/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.locations.findIndex((l: any) => l.id === id && (!l.user_id || l.user_id === req.user.id));
  if (index !== -1) {
    // Check if any inventory is in this location
    const hasItems = db.inventory.some((i: any) => i.location_id === id);
    if (hasItems) {
      return res.status(400).json({ message: "Cannot delete location with inventory items" });
    }
    db.locations.splice(index, 1);
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Location not found" });
  }
});

app.post("/api/inventory/move", auth, (req: any, res) => {
  const { inventory_id, type, quantity, from_location_id, to_location_id, notes } = req.body;
  const db = readDb();
  const item = db.inventory.find((i: any) => i.id === inventory_id);
  
  if (!item) return res.status(404).json({ message: "Item not found" });

  // Update quantity
  const qtyNum = Number(quantity);
  if (type === 'outbound' || type === 'internal') {
    if (item.quantity < qtyNum) return res.status(400).json({ message: "Insufficient stock" });
    item.quantity -= qtyNum;
  }
  if (type === 'inbound' || type === 'internal' || type === 'adjustment') {
    if (type !== 'internal') {
       item.quantity += qtyNum;
    } else {
       item.quantity += qtyNum; // Move to new location technically means same total, but if we track per location we'd split. 
       // For MVP we assume 1 item = 1 location. Moving updates the location.
       item.location_id = to_location_id;
    }
  }

  item.updated_at = new Date().toISOString();

  const movement = {
    id: generateId("mov"),
    inventory_id,
    type,
    quantity: qtyNum,
    from_location_id,
    to_location_id,
    user_id: req.user.id,
    notes,
    created_at: new Date().toISOString()
  };

  if (!db.stock_movements) db.stock_movements = [];
  db.stock_movements.unshift(movement);
  writeDb(db);

  io.emit("inventory:updated", item);
  io.emit("movement:created", movement);
  
  // Alert if below min stock
  if (item.quantity <= item.min_stock) {
    const alert = {
      id: generateId("notif"),
      type: 'inventory',
      title: 'Low Stock Alert',
      message: `${item.name} (${item.sku}) is below minimum stock level (${item.min_stock}). Current: ${item.quantity}`,
      severity: 'high'
    };
    io.emit("notification:new", alert);
  }

  res.json({ item, movement });
});

app.get("/api/inventory/movements", auth, (req: any, res) => {
  const db = readDb();
  const movements = (db.stock_movements || []).map((m: any) => {
    const item = db.inventory.find((i: any) => i.id === m.inventory_id);
    const user = db.users.find((u: any) => u.id === m.user_id);
    return { ...m, item_name: item ? item.name : "Unknown", user_name: user ? user.name : "Unknown" };
  });
  res.json(movements);
});

// --- Community Routes ---
app.get("/api/community/posts", auth, (req: any, res) => {
  const db = readDb();
  const posts = (db.community_posts || []).map((p: any) => {
    const profile = db.business_profiles.find((bp: any) => bp.user_id === p.user_id);
    const commentsWithAvatars = (p.comments || []).map((c: any) => {
      const cProfile = db.business_profiles.find((bp: any) => bp.user_id === c.user_id);
      return {
        ...c,
        author_avatar: cProfile?.avatar_url || null,
        author_name: cProfile?.business_name || c.author_name
      };
    });

    return { 
      ...p, 
      authorName: profile?.business_name || p.author_name,
      authorAvatar: profile?.avatar_url || null,
      image_url: p.image_url || null,
      comments: commentsWithAvatars
    };
  });
  res.json(posts);
});

app.post("/api/community/posts", auth, (req: any, res) => {
  const { title, content, category, image_url } = req.body;
  const db = readDb();
  if (!db.community_posts) db.community_posts = [];
  
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedContent = sanitizeInput(content);
  
  const profile = db.business_profiles.find((bp: any) => bp.user_id === req.user.id);
  const post = { 
    id: generateId("post"), 
    user_id: req.user.id, 
    author_name: profile?.business_name || req.user.name, 
    title: sanitizedTitle || "Untitled Post", 
    content: sanitizedContent || "No content provided.", 
    category, 
    image_url,
    likes: 0, 
    comments: [], 
    created_at: new Date() 
  };
  
  db.community_posts.unshift(post);
  writeDb(db);
  
  // Real-time broadcast
  io.emit("post:created", post);
  io.emit("notification:new", {
    id: generateId("notif"),
    type: 'community',
    title: 'New Community Post',
    message: `${profile?.business_name || req.user.name} shared a new post: ${title}`
  });

  res.json(post);
});

function addHoneyReward(db: any, userId: string, amount: number, source: string) {
  const profile = db.business_profiles.find((p: any) => p.user_id === userId);
  if (profile) {
    profile.honey = (profile.honey || 0) + amount;
    if (amount > 0) {
      profile.totalHoneyEarned = (profile.totalHoneyEarned || 0) + amount;
    } else {
      profile.totalHoneySpent = (profile.totalHoneySpent || 0) + Math.abs(amount);
    }
    
    const transaction = {
      id: generateId("honey-txn"),
      type: amount > 0 ? 'earned' : 'spent',
      source,
      amount: Math.abs(amount),
      createdAt: new Date().toISOString()
    };
    
    if (!profile.honeyHistory) profile.honeyHistory = [];
    profile.honeyHistory.unshift(transaction);
    profile.updated_at = new Date();
    return true;
  }
  return false;
}

app.post("/api/community/posts/:id/like", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const userId = req.user.id;
  const post = db.community_posts.find((p: any) => p.id.toString() === id.toString());
  
  if (post) {
    if (!post.likedBy) post.likedBy = [];
    
    const likedIndex = post.likedBy.indexOf(userId);
    let liked = false;

    if (likedIndex > -1) {
      // Unlike
      post.likedBy.splice(likedIndex, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
      liked = false;
    } else {
      // Like
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
      liked = true;

      // Reward author if not own post
      if (post.user_id !== userId) {
        addHoneyReward(db, post.user_id, 2, `Like received on post: ${post.title}`);
      }
    }

    writeDb(db);
    io.emit("post:liked", { postId: id, likes: post.likes, likedBy: post.likedBy });
    res.json({ success: true, likes: post.likes, likedBy: post.likedBy, liked });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

app.post("/api/community/posts/:id/accept-answer", auth, (req: any, res) => {
  const { id } = req.params;
  const { commentId } = req.body;
  const db = readDb();
  const post = db.community_posts.find((p: any) => p.id.toString() === id.toString());
  
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.user_id !== req.user.id) return res.status(403).json({ message: "Only author can accept answers" });
  
  const comment = post.comments.find((c: any) => c.id === commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  post.acceptedCommentId = commentId;
  
  // Reward helper
  if (comment.user_id !== req.user.id) {
    addHoneyReward(db, comment.user_id, 15, `Answer accepted on post: ${post.title}`);
  }

  writeDb(db);
  io.emit("post:updated", post);
  res.json({ success: true, post });
});

app.post("/api/community/posts/:id/comments", auth, (req: any, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const db = readDb();
  const post = db.community_posts.find((p: any) => p.id.toString() === id.toString());
  if (post) {
    const sanitizedContent = sanitizeInput(content);
    const profile = db.business_profiles.find((bp: any) => bp.user_id === req.user.id);
    const comment = { 
      id: generateId("cmt"), 
      user_id: req.user.id, 
      author_name: profile?.business_name || req.user.name, 
      content: sanitizedContent || "...", 
      created_at: new Date() 
    };
    if (!post.comments) post.comments = [];
    post.comments.push(comment);
    writeDb(db);
    io.emit("post:updated", post);
    res.json(comment);
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

app.delete("/api/community/posts/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const postIndex = db.community_posts.findIndex((p: any) => p.id.toString() === id.toString());
  if (postIndex > -1) {
    const post = db.community_posts[postIndex];
    // Allow author OR moderator/admin to delete
    const isAdmin = db.users.find((u: any) => u.id === req.user.id)?.role === 'admin';
    if (post.user_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    db.community_posts.splice(postIndex, 1);
    writeDb(db);
    io.emit("post:deleted", id);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Post not found" });
  }
});

// --- Learning Routes ---
app.get("/api/learning/courses", auth, (req: any, res) => {
  const db = readDb();
  res.json(db.courses || []);
});

// --- Chat Routes ---
app.get("/api/chat/sessions", auth, (req: any, res) => {
  const db = readDb();
  if (!db.chat_sessions) db.chat_sessions = {};
  res.json(db.chat_sessions[req.user.id] || []);
});

app.post("/api/chat/sessions", auth, (req: any, res) => {
  const db = readDb();
  if (!db.chat_sessions) db.chat_sessions = {};
  db.chat_sessions[req.user.id] = req.body;
  writeDb(db);
  res.json({ success: true });
});

// --- Marketplace Routes ---
app.get("/api/marketplace/products", auth, (req: any, res) => {
  const db = readDb();
  const products = (db.marketplace_products || []).map((p: any) => {
    const profile = db.business_profiles.find((bp: any) => bp.user_id === p.user_id);
    return {
      ...p,
      seller_name: profile?.business_name || p.seller_name,
      seller_avatar: profile?.avatar_url || null
    };
  });
  res.json(products);
});

app.post("/api/marketplace/products", auth, (req: any, res) => {
  const { name, description, price, category, image_url } = req.body;
  const db = readDb();
  if (!db.marketplace_products) db.marketplace_products = [];
  const profile = db.business_profiles.find((bp: any) => bp.user_id === req.user.id);
  const product = { 
    id: generateId("prod"), 
    user_id: req.user.id, 
    seller_name: profile?.business_name || req.user.name,
    name, 
    description, 
    price: Number(price), 
    category, 
    image_url, 
    created_at: new Date() 
  };
  db.marketplace_products.push(product);
  writeDb(db);
  res.json(product);
});

app.put("/api/marketplace/products/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url } = req.body;
  const db = readDb();
  const product = db.marketplace_products.find((p: any) => p.id === id && p.user_id === req.user.id);
  if (product) {
    product.name = name;
    product.description = description;
    product.price = Number(price);
    product.category = category;
    product.image_url = image_url;
    product.updated_at = new Date();
    writeDb(db);
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

app.delete("/api/marketplace/products/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  const index = db.marketplace_products.findIndex((p: any) => p.id === id && p.user_id === req.user.id);
  if (index !== -1) {
    db.marketplace_products.splice(index, 1);
    writeDb(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

app.get("/api/marketplace/wishlist", auth, (req: any, res) => {
  const db = readDb();
  const wishlist = (db.wishlist || []).filter((w: any) => w.user_id === req.user.id);
  res.json(wishlist);
});

app.post("/api/marketplace/wishlist", auth, (req: any, res) => {
  const { product_id } = req.body;
  const db = readDb();
  if (!db.wishlist) db.wishlist = [];
  const exists = db.wishlist.find((w: any) => w.user_id === req.user.id && w.product_id === product_id);
  if (exists) return res.json(exists);
  
  const product = (db.marketplace_products || []).find((p: any) => p.id === product_id);
  const item = { 
    id: generateId("wsh"), 
    user_id: req.user.id, 
    product_id, 
    product_name: product?.name,
    created_at: new Date() 
  };
  db.wishlist.push(item);
  writeDb(db);
  res.json(item);
});

app.delete("/api/marketplace/wishlist/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  db.wishlist = (db.wishlist || []).filter((w: any) => w.id !== id || w.user_id !== req.user.id);
  writeDb(db);
  res.json({ success: true });
});

// --- Marketing Routes ---
app.get("/api/marketing/saved", auth, (req: any, res) => {
  const db = readDb();
  const saved = (db.saved_marketing || []).filter((m: any) => m.user_id === req.user.id);
  res.json(saved);
});

app.post("/api/marketing/saved", auth, (req: any, res) => {
  const { title, content, type, goal } = req.body;
  const db = readDb();
  if (!db.saved_marketing) db.saved_marketing = [];
  const item = { id: generateId("mkt"), user_id: req.user.id, title, content, type, goal, created_at: new Date() };
  db.saved_marketing.push(item);
  writeDb(db);
  res.json(item);
});

app.delete("/api/marketing/saved/:id", auth, (req: any, res) => {
  const { id } = req.params;
  const db = readDb();
  db.saved_marketing = (db.saved_marketing || []).filter((m: any) => m.id !== id || m.user_id !== req.user.id);
  writeDb(db);
  res.json({ success: true });
});

// --- Vite Middleware ---
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

