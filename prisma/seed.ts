import { PrismaClient, ProductStatus, NewsletterStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEV_PASSWORD = "DevPassword123!";

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=ffd5dc,c0aede,d1d4f9,b6e3f4`;
const palette = ["ff5a5f", "7b3ff2", "ffd166", "06d6a0", "118ab2", "ef476f", "f78c6b", "8338ec", "3a86ff"];
const thumb = (seed: string, color: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=${color}`;
const screenshot = (seed: string) => `https://picsum.photos/seed/${seed}/1200/700`;

const CATEGORIES = [
  { slug: "saas", name: "SaaS", emoji: "⚡" },
  { slug: "mobile-app", name: "Mobile App", emoji: "📱" },
  { slug: "developer-tools", name: "Developer Tools", emoji: "🛠️" },
  { slug: "produktivitas", name: "Produktivitas", emoji: "🧠" },
  { slug: "ecommerce", name: "Ecommerce", emoji: "🛍️" },
  { slug: "edukasi", name: "Edukasi", emoji: "📚" },
  { slug: "kesehatan", name: "Kesehatan", emoji: "💚" },
  { slug: "keuangan", name: "Keuangan", emoji: "💰" },
  { slug: "lainnya", name: "Lainnya", emoji: "✨" },
];

const USERS = [
  { username: "rifqi", name: "Rifqi Pratama", bio: "Building tools for Indonesian creators ☕", twitter: "rifqi", website: "rifqi.dev" },
  { username: "sari", name: "Sari Wulandari", bio: "Product designer · ex-Tokopedia", twitter: "sariw" },
  { username: "andre", name: "Andre Santoso", bio: "Indie hacker from Bandung 🚀", twitter: "andresan" },
  { username: "dewi", name: "Dewi Kusuma", bio: "Maker of small useful things." },
  { username: "budi", name: "Budi Hartono", bio: "Fintech nerd. Coffee addict.", twitter: "budih" },
  { username: "intan", name: "Intan Permata", bio: "Edtech founder. Mom of 2." },
  { username: "yoga", name: "Yoga Pradipta", bio: "Mobile devs unite 📱", twitter: "yogap" },
  { username: "maya", name: "Maya Anggraini", bio: "Healthtech & wellness", website: "maya.id" },
  { username: "fajar", name: "Fajar Nugroho", bio: "Open source enjoyer", twitter: "fajarn" },
  { username: "lia", name: "Lia Marlina", bio: "Ecommerce growth lead" },
];

const productSeeds = [
  { name: "Warungku", tagline: "POS sederhana untuk warung lokal", description: "Warungku membantu pemilik warung mengelola stok, transaksi, dan laporan harian — semua dari ponsel.", category: "saas", tags: ["pos", "umkm", "retail"], launchDate: "2026-06-26", website: "https://warungku.id", upvotes: 412, comments: 38, maker: "rifqi" },
  { name: "Kopiloop", tagline: "Marketplace biji kopi specialty", description: "Temukan biji kopi specialty dari roaster terbaik Indonesia.", category: "ecommerce", tags: ["coffee", "marketplace"], launchDate: "2026-06-26", website: "https://kopiloop.com", upvotes: 356, comments: 27, maker: "andre" },
  { name: "Notari", tagline: "AI note-taking untuk meeting bahasa Indonesia", description: "Transkrip otomatis, ringkasan, dan action items dari setiap meeting kamu.", category: "produktivitas", tags: ["ai", "meeting", "notes"], launchDate: "2026-06-26", website: "https://notari.app", upvotes: 298, comments: 22, maker: "sari" },
  { name: "Skillfa", tagline: "Belajar coding dengan mentor Indonesia", description: "Platform mentoring 1-on-1 dengan engineer dari startup top.", category: "edukasi", tags: ["coding", "mentor"], launchDate: "2026-06-26", website: "https://skillfa.id", upvotes: 245, comments: 19, maker: "intan" },
  { name: "Sehatin", tagline: "Tracker kesehatan harian untuk keluarga", description: "Pantau tekanan darah, gula, dan resep keluarga di satu app.", category: "kesehatan", tags: ["health", "family"], launchDate: "2026-06-26", website: "https://sehatin.id", upvotes: 198, comments: 14, maker: "maya" },
  { name: "Duitku Pro", tagline: "Budget planner sederhana ala Jepang", description: "Metode Kakeibo dalam app modern.", category: "keuangan", tags: ["budget", "finance"], launchDate: "2026-06-25", website: "https://duitku.app", upvotes: 487, comments: 41, maker: "budi" },
  { name: "DevID Stack", tagline: "Boilerplate Next.js untuk dev Indonesia", description: "Starter kit lengkap dengan auth, payments lokal, dan i18n.", category: "developer-tools", tags: ["nextjs", "boilerplate"], launchDate: "2026-06-25", website: "https://devid.dev", upvotes: 421, comments: 33, maker: "fajar" },
  { name: "Tugasin", tagline: "Task manager keyboard-first", description: "Inspired by Linear. Cepat, ringan, dan gratis untuk tim kecil.", category: "produktivitas", tags: ["tasks", "team"], launchDate: "2026-06-25", website: "https://tugasin.com", upvotes: 312, comments: 24, maker: "rifqi" },
  { name: "Pesanin", tagline: "WhatsApp commerce automation", description: "Otomatisasi order via WA.", category: "ecommerce", tags: ["whatsapp", "commerce"], launchDate: "2026-06-25", website: "https://pesanin.id", upvotes: 278, comments: 20, maker: "lia" },
  { name: "Snapku", tagline: "Photo editor mobile untuk seller online", description: "Edit foto produk dalam 3 detik.", category: "mobile-app", tags: ["photo", "seller"], launchDate: "2026-06-25", website: "https://snapku.app", upvotes: 234, comments: 16, maker: "yoga" },
  { name: "Bahas", tagline: "Forum diskusi developer Indonesia", description: "Tempat ngobrol soal tech, karir, dan startup lokal.", category: "developer-tools", tags: ["community"], launchDate: "2026-06-24", website: "https://bahas.dev", upvotes: 389, comments: 52, maker: "fajar" },
  { name: "Resepku", tagline: "Resep masakan Indonesia + meal planner", description: "10.000+ resep nusantara dengan meal planner mingguan.", category: "lainnya", tags: ["food", "recipe"], launchDate: "2026-06-24", website: "https://resepku.id", upvotes: 267, comments: 28, maker: "dewi" },
  { name: "Lapakin", tagline: "Storefront builder no-code", description: "Bikin toko online tanpa coding.", category: "ecommerce", tags: ["no-code", "store"], launchDate: "2026-06-24", website: "https://lapakin.com", upvotes: 198, comments: 17, maker: "lia" },
  { name: "Mindful.id", tagline: "Meditasi suara Bahasa Indonesia", description: "Sesi mindfulness harian dipandu instruktur lokal.", category: "kesehatan", tags: ["meditation", "audio"], launchDate: "2026-06-24", website: "https://mindful.id", upvotes: 156, comments: 11, maker: "maya" },
  { name: "Jadwalin", tagline: "Booking link ala Calendly versi lokal", description: "Schedule meeting dengan zona waktu WIB/WITA/WIT.", category: "saas", tags: ["scheduling"], launchDate: "2026-06-24", website: "https://jadwalin.app", upvotes: 213, comments: 15, maker: "sari" },
  { name: "Coderbase", tagline: "Database tutorial coding Indonesia", description: "1000+ tutorial gratis dari developer berpengalaman.", category: "edukasi", tags: ["coding", "tutorial"], launchDate: "2026-06-23", website: "https://coderbase.id", upvotes: 345, comments: 30, maker: "fajar" },
  { name: "Invoiceku", tagline: "Invoice & pajak untuk freelancer", description: "Bikin invoice PPN/PPh otomatis.", category: "keuangan", tags: ["invoice", "freelance"], launchDate: "2026-06-23", website: "https://invoiceku.com", upvotes: 289, comments: 22, maker: "budi" },
  { name: "Klipboard", tagline: "Clipboard manager open source", description: "History clipboard cross-device.", category: "developer-tools", tags: ["utility"], launchDate: "2026-06-23", website: "https://klipboard.dev", upvotes: 178, comments: 12, maker: "rifqi" },
  { name: "Belanjain", tagline: "Grocery list pintar untuk keluarga", description: "Share grocery list real-time dengan pasangan.", category: "mobile-app", tags: ["grocery", "family"], launchDate: "2026-06-23", website: "https://belanjain.app", upvotes: 145, comments: 9, maker: "dewi" },
  { name: "Pitch Deck.id", tagline: "Template pitch deck untuk startup lokal", description: "Template Figma & Keynote teruji di YC dan East Ventures.", category: "saas", tags: ["pitch", "design"], launchDate: "2026-06-22", website: "https://pitchdeck.id", upvotes: 412, comments: 38, maker: "sari" },
  { name: "Linkin Bio", tagline: "Linktree alternative dengan analytics", description: "Bio link cantik plus analytics mendalam.", category: "produktivitas", tags: ["bio", "creator"], launchDate: "2026-06-22", website: "https://linkin.bio", upvotes: 234, comments: 18, maker: "andre" },
  { name: "Sertifikat.io", tagline: "Generate sertifikat event massal", description: "Upload CSV, dapat ribuan sertifikat dalam hitungan detik.", category: "edukasi", tags: ["certificate"], launchDate: "2026-06-22", website: "https://sertifikat.io", upvotes: 167, comments: 13, maker: "intan" },
  { name: "Antrian", tagline: "Sistem antrian untuk klinik kecil", description: "Pasien ambil nomor lewat WhatsApp.", category: "kesehatan", tags: ["clinic", "queue"], launchDate: "2026-06-22", website: "https://antrian.app", upvotes: 198, comments: 15, maker: "maya" },
  { name: "Kuitansi", tagline: "Bukti pembayaran digital sederhana", description: "Kirim kuitansi profesional via link.", category: "keuangan", tags: ["receipt"], launchDate: "2026-06-21", website: "https://kuitansi.id", upvotes: 134, comments: 8, maker: "budi" },
  { name: "Designku", tagline: "Marketplace desainer lokal", description: "Hire desainer Indonesia terbaik.", category: "lainnya", tags: ["design", "freelance"], launchDate: "2026-06-21", website: "https://designku.com", upvotes: 256, comments: 21, maker: "andre" },
  { name: "Voicenote ID", tagline: "Voice note dengan transkrip otomatis", description: "Rekam ide, dapat teks instan dalam Bahasa Indonesia.", category: "mobile-app", tags: ["voice", "ai"], launchDate: "2026-06-21", website: "https://voicenote.id", upvotes: 189, comments: 14, maker: "yoga" },
  { name: "RoutineOS", tagline: "Habit tracker minimalis", description: "Bangun kebiasaan baik dengan streak dan reminder cerdas.", category: "produktivitas", tags: ["habit"], launchDate: "2026-06-21", website: "https://routine.app", upvotes: 312, comments: 26, maker: "rifqi" },
  { name: "Storeflow", tagline: "Analytics untuk Shopee & Tokopedia seller", description: "Dashboard satu layar untuk semua marketplace kamu.", category: "ecommerce", tags: ["analytics"], launchDate: "2026-06-20", website: "https://storeflow.id", upvotes: 423, comments: 35, maker: "lia" },
  { name: "Loglib", tagline: "Privacy-first web analytics", description: "Alternatif Google Analytics tanpa cookie banner.", category: "developer-tools", tags: ["analytics"], launchDate: "2026-06-20", website: "https://loglib.io", upvotes: 367, comments: 29, maker: "fajar" },
  { name: "Tabungin", tagline: "Goal-based savings app", description: "Nabung untuk tujuan spesifik dengan auto-debit.", category: "keuangan", tags: ["savings"], launchDate: "2026-06-20", website: "https://tabungin.id", upvotes: 245, comments: 19, maker: "budi" },
];

const PENDING = [
  { id: "p1", slug: "tanyain", name: "Tanyain", tagline: "FAQ bot untuk customer service", description: "Bot WhatsApp yang menjawab pertanyaan customer otomatis.", category: "saas", tags: ["bot", "cs"], launchDate: "2026-06-28", website: "https://tanyain.id", maker: "andre" },
  { id: "p2", slug: "rapatin", name: "Rapatin", tagline: "Meeting room booking sederhana", description: "Booking ruang rapat kantor via Slack atau web.", category: "produktivitas", tags: ["meeting"], launchDate: "2026-06-28", website: "https://rapatin.app", maker: "sari" },
  { id: "p3", slug: "kelasin", name: "Kelasin", tagline: "LMS untuk kursus offline", description: "Manajemen kelas, absensi, dan pembayaran untuk lembaga kursus.", category: "edukasi", tags: ["lms"], launchDate: "2026-06-29", website: "https://kelasin.id", maker: "intan" },
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);

  for (const c of CATEGORIES) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c });
  }

  const userIds: Record<string, string> = {};
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { username: u.username },
      create: {
        email: `${u.username}@stackd.id`,
        username: u.username,
        name: u.name,
        bio: u.bio,
        twitter: u.twitter ?? null,
        website: u.website ?? null,
        avatarUrl: avatar(u.username),
        passwordHash: hash,
        emailVerified: new Date(),
        roles: { create: [{ role: Role.user }, { role: Role.maker }] },
      },
      update: {
        name: u.name,
        bio: u.bio,
        avatarUrl: avatar(u.username),
        passwordHash: hash,
      },
    });
    userIds[u.username] = user.id;
  }

  const admin = await prisma.user.upsert({
    where: { username: "stackdadmin" },
    create: {
      email: "admin@stackd.id",
      username: "stackdadmin",
      name: "Stackd Admin",
      bio: "Platform admin",
      avatarUrl: avatar("admin"),
      passwordHash: hash,
      emailVerified: new Date(),
      roles: { create: [{ role: Role.user }, { role: Role.admin }] },
    },
    update: { passwordHash: hash },
  });
  userIds.admin = admin.id;

  // Voter pool for upvote counts (max 50 per product for dev performance)
  const voterIds: string[] = [];
  for (let i = 1; i <= 50; i++) {
    const username = `voter${i}`;
    const voter = await prisma.user.upsert({
      where: { username },
      create: {
        email: `${username}@seed.stackd.id`,
        username,
        name: `Voter ${i}`,
        passwordHash: hash,
        emailVerified: new Date(),
        roles: { create: [{ role: Role.user }] },
      },
      update: {},
    });
    voterIds.push(voter.id);
  }

  const commentTexts = [
    "Keren banget! Sudah aku coba dan UI-nya smooth 🔥",
    "Congrats on the launch! Penasaran pricing-nya gimana?",
    "Sebagai user existing, fitur baru ini game changer.",
    "Ide bagus. Saran: tambahkan integrasi dengan WhatsApp.",
    "Wah, ini yang aku tunggu-tunggu. Auto upvote!",
    "Sudah pakai 2 minggu, recommended buat tim kecil.",
    "Onboarding-nya friendly. Good job tim!",
    "Apakah ada free tier untuk solo founder?",
  ];

  let productIndex = 0;
  for (let i = 0; i < productSeeds.length; i++) {
    const p = productSeeds[i];
    const id = String(i + 1);
    const slug = slugify(p.name);
    const launchDate = new Date(p.launchDate);
    const publishedAt = new Date(p.launchDate);

    await prisma.product.upsert({
      where: { id },
      create: {
        id,
        slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        thumbnailUrl: thumb(p.name, palette[i % palette.length]),
        screenshotUrls: [screenshot(p.name + "1"), screenshot(p.name + "2"), screenshot(p.name + "3")],
        categoryId: p.category,
        tags: p.tags,
        launchDate,
        website: p.website,
        makerId: userIds[p.maker],
        status: ProductStatus.approved,
        publishedAt,
      },
      update: {
        name: p.name,
        status: ProductStatus.approved,
        publishedAt,
      },
    });

    const voteCount = Math.min(p.upvotes, 50);
    await prisma.vote.deleteMany({ where: { productId: id } });
    for (let v = 0; v < voteCount; v++) {
      await prisma.vote.create({
        data: { userId: voterIds[v], productId: id },
      }).catch(() => {});
    }

    const commentCount = Math.min(p.comments, 5);
    await prisma.comment.deleteMany({ where: { productId: id } });
    for (let c = 0; c < commentCount; c++) {
      const authorUsername = USERS[(productIndex + c) % USERS.length].username;
      await prisma.comment.create({
        data: {
          productId: id,
          authorId: userIds[authorUsername],
          text: commentTexts[(productIndex + c) % commentTexts.length],
          createdAt: new Date(Date.now() - (c + 1) * 3600000),
        },
      });
    }
    productIndex++;
  }

  for (const p of PENDING) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        thumbnailUrl: thumb(p.name, "06d6a0"),
        screenshotUrls: [screenshot(p.slug + "1")],
        categoryId: p.category,
        tags: p.tags,
        launchDate: new Date(p.launchDate),
        website: p.website,
        makerId: userIds[p.maker],
        status: ProductStatus.pending,
        publishedAt: null,
      },
      update: { status: ProductStatus.pending, publishedAt: null },
    });
  }

  await prisma.newsletter.upsert({
    where: { id: "n4" },
    create: {
      id: "n4",
      slug: "issue-4-ai-tools-made-in-indonesia",
      title: "Issue #4 — AI tools made in Indonesia",
      coverImageUrl: "https://picsum.photos/seed/nl4/1200/600",
      shortDescription: "Notari, Voicenote ID, dan 8 produk AI dari Jakarta hingga Surabaya.",
      content: "Minggu ini kami sorot gelombang baru AI tools buatan Indonesia...",
      featuredProductIds: ["3", "25"],
      publishDate: new Date("2026-06-26"),
      status: NewsletterStatus.published,
    },
    update: { status: NewsletterStatus.published },
  });

  await prisma.newsletter.upsert({
    where: { id: "n5" },
    create: {
      id: "n5",
      slug: "issue-5-fintech-deep-dive",
      title: "Issue #5 — Fintech deep dive",
      coverImageUrl: "https://picsum.photos/seed/nl5/1200/600",
      shortDescription: "Draft — outline dan produk pilihan minggu ini.",
      content: "Outline...",
      featuredProductIds: ["6"],
      publishDate: new Date("2026-07-10"),
      status: NewsletterStatus.draft,
    },
    update: {},
  });

  console.log("Seed complete. Login: rifqi@stackd.id / DevPassword123!");
  console.log("Admin: admin@stackd.id / DevPassword123!");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
