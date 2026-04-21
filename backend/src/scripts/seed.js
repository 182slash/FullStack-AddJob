/**
 * AddJob Database Seeder
 * Run: node src/scripts/seed.js
 * Run (reset): node src/scripts/seed.js --reset
 */
require('dotenv').config()
const mongoose  = require('mongoose')
const bcrypt    = require('bcryptjs')
const User      = require('../models/User')
const Company   = require('../models/Company')
const Job       = require('../models/Job')
const Article   = require('../models/Article')

const RESET = process.argv.includes('--reset')

const SEED_USERS = [
  { name:'Admin AddJob',      email:'admin@addjob.id',      password:'Admin@12345', role:'admin',    isVerified:true },
  { name:'Budi Santoso',      email:'seeker@example.com',   password:'Seeker@123',  role:'seeker',   isVerified:true },
  { name:'Siti Rahayu',       email:'seeker2@example.com',  password:'Seeker@123',  role:'seeker',   isVerified:true },
  { name:'PT Teknologi Maju', email:'employer@example.com', password:'Employer@123',role:'employer', isVerified:true },
  { name:'CV Karya Nusantara',email:'employer2@example.com',password:'Employer@123',role:'employer', isVerified:true },
]

const CATEGORIES = ['Teknologi Informasi','Marketing & Sales','Keuangan & Akuntansi','Desain & Kreatif','HR & Rekrutmen','Operasional']

const COMPANIES_DATA = [
  {
    name:'PT Teknologi Maju', industry:'Teknologi', size:'51-200', type:'startup',
    location:'Jakarta Selatan', website:'https://tekno-maju.id',
    description:'Perusahaan teknologi terdepan di Indonesia yang berfokus pada pengembangan solusi digital inovatif untuk bisnis lokal dan regional.',
    culture:'Kami percaya inovasi lahir dari keberagaman. Tim kami terdiri dari individu bersemangat yang tidak takut gagal dan terus belajar.',
    isVerified: true,
  },
  {
    name:'CV Karya Nusantara', industry:'E-Commerce', size:'11-50', type:'startup',
    location:'Bandung', website:'https://karyanusantara.co.id',
    description:'Platform e-commerce lokal yang menghubungkan UMKM Indonesia dengan jutaan konsumen.',
    culture:'Startup culture: fast-paced, flat hierarchy, dan growth mindset adalah DNA kami.',
    isVerified: false,
  },
]

const makeJobs = (company, postedBy) => [
  {
    title: 'Senior React Developer',
    description: 'Kami mencari React Developer berpengalaman untuk memimpin pengembangan frontend aplikasi web skala enterprise. Anda akan bekerja langsung dengan CTO dan tim produk.',
    requirements: 'Minimal 3 tahun pengalaman dengan React.js\nMenguasai TypeScript, Redux Toolkit, React Query\nPengalaman dengan CI/CD (GitHub Actions)\nFamiliar dengan testing (Jest, RTL)',
    benefits: 'BPJS Kesehatan & Ketenagakerjaan\nLaptop MacBook Pro\nFlexible working hours\nAnggaran belajar Rp 3 juta/tahun\nBonus performa tahunan',
    category: 'Teknologi Informasi', type: 'fulltime', workMode: 'hybrid',
    location: 'Jakarta Selatan', experience: '3-5', remote: false,
    salaryMin: 12000000, salaryMax: 20000000,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    tags: ['frontend', 'react', 'typescript'],
    isActive: true, isFeatured: true, isUrgent: false,
    company, postedBy,
  },
  {
    title: 'Product Manager',
    description: 'Bergabunglah sebagai Product Manager dan pimpin roadmap produk kami. Anda akan berkolaborasi lintas tim untuk menghadirkan fitur yang dicintai jutaan pengguna.',
    requirements: 'Minimal 2 tahun pengalaman sebagai Product Manager\nKemampuan analisis data yang kuat\nPengalaman dengan Agile/Scrum\nKomunikasi yang excellent',
    benefits: 'BPJS Kesehatan & Ketenagakerjaan\nEquity/ESOP\nRemote-friendly\nAsuransi jiwa',
    category: 'Teknologi Informasi', type: 'fulltime', workMode: 'remote',
    location: 'Jakarta', experience: '1-2', remote: true,
    salaryMin: 15000000, salaryMax: 25000000,
    skills: ['Product Roadmap','Analytics','Agile','Figma'],
    tags: ['product','management','agile'],
    isActive: true, isFeatured: true, isUrgent: true,
    company, postedBy,
  },
  {
    title: 'Digital Marketing Specialist',
    description: 'Kami butuh talenta marketing digital yang kreatif dan data-driven untuk mendrive pertumbuhan organik dan paid acquisition kami.',
    requirements: 'Pengalaman 1-3 tahun di digital marketing\nMenguasai Google Ads, Meta Ads\nFamiliar dengan Google Analytics 4\nPengalaman SEO on-page dan off-page',
    benefits: 'BPJS\nBudget iklan dikelola sendiri\nKomisi performance\nWFH 2x seminggu',
    category: 'Marketing & Sales', type: 'fulltime', workMode: 'hybrid',
    location: 'Jakarta Utara', experience: '1-2', remote: false,
    salaryMin: 7000000, salaryMax: 12000000,
    skills: ['Google Ads','Meta Ads','SEO','Content Marketing'],
    tags: ['marketing','digital','ads'],
    isActive: true, isFeatured: false,
    company, postedBy,
  },
  {
    title: 'Backend Engineer (Node.js)',
    description: 'Kembangkan API dan microservices yang mendukung platform kami yang terus berkembang. Anda akan merancang arsitektur yang scalable dan maintainable.',
    requirements: 'Minimal 2 tahun pengalaman Node.js\nMenguasai Express/Fastify, MongoDB/PostgreSQL\nPengalaman dengan Docker dan Kubernetes\nFamiliar dengan AWS atau GCP',
    benefits: 'BPJS Kesehatan & Ketenagakerjaan\nLaptop standar engineering\nCloud credits untuk eksperimen\nKuliah S2 dibiayai (syarat berlaku)',
    category: 'Teknologi Informasi', type: 'fulltime', workMode: 'onsite',
    location: 'Jakarta Selatan', experience: '1-2', remote: false,
    salaryMin: 10000000, salaryMax: 18000000,
    skills: ['Node.js','MongoDB','Docker','AWS'],
    tags: ['backend','nodejs','api'],
    isActive: true, isFeatured: false,
    company, postedBy,
  },
  {
    title: 'UI/UX Designer',
    description: 'Ciptakan pengalaman pengguna yang luar biasa untuk jutaan pengguna platform kami. Bergabunglah dengan tim design yang passionate dan berdampak nyata.',
    requirements: 'Portfolio kuat dengan studi kasus UI/UX\nMenguasai Figma, Miro, Adobe XD\nPengalaman user research\nPemahaman dasar HTML/CSS',
    benefits: 'BPJS\nLangganan Figma & Adobe\nBudget pembelian font & asset\nDesign retreat tahunan',
    category: 'Desain & Kreatif', type: 'fulltime', workMode: 'hybrid',
    location: 'Jakarta', experience: '1-2', remote: false,
    salaryMin: 8000000, salaryMax: 14000000,
    skills: ['Figma','User Research','Prototyping','Design Systems'],
    tags: ['design','ux','ui'],
    isActive: true, isFeatured: true,
    company, postedBy,
  },
  {
    title: 'Content Writer & SEO Specialist',
    description: 'Produksi konten berkualitas tinggi yang menarik, informatif, dan dioptimasi untuk mesin pencari. Anda akan menjadi suara brand kami.',
    requirements: 'Pengalaman minimal 1 tahun sebagai content writer\nMemahami dasar SEO dan keyword research\nKemampuan menulis yang kuat dalam Bahasa Indonesia\nFamiliar dengan WordPress atau CMS serupa',
    benefits: 'BPJS\nWFH penuh (remote)\nInternet allowance Rp 300.000/bulan\nFlexible hours',
    category: 'Marketing & Sales', type: 'parttime', workMode: 'remote',
    location: 'Remote', experience: 'fresh', remote: true,
    salaryMin: 3000000, salaryMax: 6000000,
    skills: ['SEO','Content Writing','WordPress','Keyword Research'],
    tags: ['content','seo','remote','part-time'],
    isActive: true, isFeatured: false,
    company, postedBy,
  },
]

const ARTICLES_DATA = [
  {
    title: '10 Tips Ampuh Lolos Interview Kerja di Perusahaan Top Indonesia',
    slug: 'tips-lolos-interview-kerja',
    excerpt: 'Persiapkan diri Anda dengan strategi wawancara terbukti yang digunakan kandidat sukses masuk Gojek, Tokopedia, dan startup unicorn lainnya.',
    content: `Interview kerja bisa menjadi momen yang menegangkan. Namun dengan persiapan tepat, Anda bisa tampil percaya diri.

**1. Riset Perusahaan Secara Mendalam**
Sebelum interview, pelajari bisnis, nilai, dan budaya perusahaan. Kunjungi website, baca berita terkini, dan pelajari profil LinkedIn perusahaan.

**2. Gunakan Metode STAR**
Situation, Task, Action, Result — gunakan kerangka ini untuk menjawab pertanyaan behavioral.

**3. Siapkan Pertanyaan Balik**
Interview adalah proses dua arah. Siapkan 3-5 pertanyaan yang menunjukkan ketertarikan Anda terhadap perusahaan.

**4. Perhatikan Bahasa Tubuh**
Jabat tangan kuat, kontak mata natural, dan postur tegap menunjukkan kepercayaan diri.

**5. Tiba Lebih Awal**
Datang 10-15 menit sebelum jadwal menunjukkan profesionalisme dan memberi Anda waktu untuk menenangkan diri.`,
    category: 'interview', tags: ['interview','tips','karir'], readTime: 5, isPublished: true, publishedAt: new Date(),
  },
  {
    title: 'Cara Membuat CV ATS-Friendly yang Lolos Seleksi Otomatis',
    slug: 'cv-ats-friendly',
    excerpt: '90% perusahaan besar menggunakan ATS untuk menyaring lamaran. Pelajari cara membuat CV yang lolos filter otomatis sekaligus menarik perhatian HRD.',
    content: `ATS (Applicant Tracking System) adalah software yang menyaring ribuan CV sebelum HRD melihatnya.

**Apa itu ATS?**
ATS membaca CV Anda dan mencari kata kunci yang sesuai dengan job description. CV yang tidak menggunakan kata kunci yang tepat akan langsung ditolak — bahkan sebelum manusia membacanya.

**Tips CV ATS-Friendly:**
1. Gunakan format PDF atau Word sederhana — hindari tabel, gambar, dan kolom ganda
2. Masukkan kata kunci dari job description secara natural
3. Gunakan heading standar: Pengalaman Kerja, Pendidikan, Skill
4. Tuliskan nama lengkap tools dan teknologi (bukan singkatan)
5. Cantumkan hasil kerja dengan angka yang spesifik

**Format yang Disarankan:**
- Font: Arial, Calibri, atau Times New Roman ukuran 10-12pt
- Margin: 1 inch di semua sisi
- Panjang: 1-2 halaman maksimal`,
    category: 'resume', tags: ['cv','resume','ats'], readTime: 6, isPublished: true, publishedAt: new Date(),
  },
  {
    title: 'Panduan Negosiasi Gaji: Cara Minta Gaji Lebih Tinggi Tanpa Kehilangan Tawaran',
    slug: 'panduan-negosiasi-gaji',
    excerpt: 'Banyak kandidat menerima tawaran pertama begitu saja. Padahal 70% perekrut berharap kandidat bernegosiasi. Begini caranya.',
    content: `Negosiasi gaji adalah keterampilan yang bisa dipelajari dan dipraktikkan.

**Riset Terlebih Dahulu**
Gunakan Glassdoor, LinkedIn Salary, atau survei gaji industri untuk mengetahui range gaji posisi yang Anda lamar.

**Timing yang Tepat**
Tunggu sampai perusahaan memberikan tawaran resmi sebelum menyebut angka. Jangan buru-buru menyebut ekspektasi gaji di awal proses.

**Cara Merespons Tawaran**
Jangan langsung setuju atau menolak. Ucapkan terima kasih dan minta waktu 24-48 jam untuk mempertimbangkan.

**Formula Negosiasi:**
"Saya sangat antusias dengan tawaran ini. Berdasarkan riset pasar dan pengalaman saya, saya berharap bisa mendiskusikan angka di kisaran [X]. Apakah ada fleksibilitas di sini?"

**Yang Bisa Dinegosiasikan Selain Gaji:**
- Bonus joining
- Work from home policy
- Jadwal mulai kerja
- Anggaran pengembangan diri`,
    category: 'salary', tags: ['gaji','negosiasi','karir'], readTime: 7, isPublished: true, publishedAt: new Date(),
  },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    if (RESET) {
      await Promise.all([
        User.deleteMany({}),
        Company.deleteMany({}),
        Job.deleteMany({}),
        Article.deleteMany({}),
      ])
      console.log('🗑️  All existing data cleared')
    }

    // Users
    const createdUsers = []
    for (const u of SEED_USERS) {
      const existing = await User.findOne({ email: u.email })
      if (existing) { createdUsers.push(existing); continue }
      const user = await User.create(u)
      createdUsers.push(user)
    }
    console.log(`👥 Users: ${createdUsers.length} created/found`)

    const [admin, seeker1, seeker2, employer1, employer2] = createdUsers

    // Companies
    const createdCompanies = []
    for (let i = 0; i < COMPANIES_DATA.length; i++) {
      const empUser = i === 0 ? employer1 : employer2
      const existing = await Company.findOne({ owner: empUser._id })
      if (existing) { createdCompanies.push(existing); continue }
      const company = await Company.create({ ...COMPANIES_DATA[i], owner: empUser._id })
      await User.findByIdAndUpdate(empUser._id, { company: company._id })
      createdCompanies.push(company)
    }
    console.log(`🏢 Companies: ${createdCompanies.length} created/found`)

    // Jobs
    let jobCount = 0
    for (let i = 0; i < createdCompanies.length; i++) {
      const company  = createdCompanies[i]
      const employer = i === 0 ? employer1 : employer2
      const jobs     = makeJobs(company._id, employer._id)
      for (const jobData of jobs) {
        const existing = await Job.findOne({ title: jobData.title, company: company._id })
        if (!existing) {
          await Job.create(jobData)
          jobCount++
        }
      }
      await Company.findByIdAndUpdate(company._id, { 'stats.totalJobs': jobs.length, 'stats.activeJobs': jobs.length })
    }
    console.log(`💼 Jobs: ${jobCount} created`)

    // Articles
    let artCount = 0
    for (const art of ARTICLES_DATA) {
      const existing = await Article.findOne({ slug: art.slug })
      if (!existing) {
        await Article.create({ ...art, author: admin._id })
        artCount++
      }
    }
    console.log(`📰 Articles: ${artCount} created`)

    console.log('\n🌱 Seed complete!')
    console.log('─────────────────────────────')
    console.log('Test accounts:')
    console.log('  Admin:    admin@addjob.id       / Admin@12345')
    console.log('  Seeker:   seeker@example.com    / Seeker@123')
    console.log('  Employer: employer@example.com  / Employer@123')
    console.log('─────────────────────────────')

    await mongoose.disconnect()
    process.exit(0)
  } catch (err) {
    console.error('❌ Seed failed:', err.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seed()
