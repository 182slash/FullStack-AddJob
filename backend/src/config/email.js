const nodemailer = require('nodemailer')

// ── Transporter ───────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  })

// ── Base HTML template ────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#F5F7FA; color:#1A1A2E; }
    .wrapper { max-width:600px; margin:0 auto; padding:24px; }
    .card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
    .header { background:linear-gradient(135deg,#1B6FC8,#21CBF3); padding:32px 36px; text-align:center; }
    .header h1 { color:#fff; font-size:24px; font-weight:800; letter-spacing:-0.5px; }
    .header p  { color:rgba(255,255,255,0.85); margin-top:6px; font-size:14px; }
    .body { padding:36px; }
    .body h2 { font-size:20px; font-weight:700; margin-bottom:12px; }
    .body p  { font-size:15px; line-height:1.7; color:#444; margin-bottom:16px; }
    .btn { display:inline-block; padding:13px 28px; background:linear-gradient(135deg,#1B6FC8,#2196F3);
           color:#fff; text-decoration:none; border-radius:8px; font-weight:700; font-size:15px; margin:8px 0; }
    .info-box { background:#F0F7FF; border-left:4px solid #1B6FC8; padding:14px 18px; border-radius:6px; margin:16px 0; }
    .info-box p { margin:0; color:#1557A3; font-size:14px; font-weight:600; }
    .badge { display:inline-block; padding:4px 12px; border-radius:99px; font-size:13px; font-weight:700; }
    .badge-success { background:#E8F5E9; color:#2E7D32; }
    .badge-pending { background:#FFF8E1; color:#F57F17; }
    .badge-rejected { background:#FFEBEE; color:#C62828; }
    .divider { height:1px; background:#F0F0F0; margin:24px 0; }
    .footer { padding:20px 36px; text-align:center; background:#FAFAFA; border-top:1px solid #F0F0F0; }
    .footer p { font-size:12px; color:#90A4AE; line-height:1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>AddJob</h1>
        <p>Portal Karir & Lowongan Kerja Terpercaya</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>Email ini dikirim otomatis. Harap tidak membalas pesan ini.<br>
           © ${new Date().getFullYear()} AddJob · <a href="https://addjob.id" style="color:#1B6FC8;">addjob.id</a></p>
      </div>
    </div>
  </div>
</body>
</html>`

// ── Email senders ─────────────────────────────────────────
const CLIENT_URL = process.env.CLIENT_URL || 'https://addjob.id'

const send = async (to, subject, html) => {
  if (process.env.NODE_ENV === 'test') return // Skip in test env
  const t = createTransporter()
  await t.sendMail({
    from: `"AddJob" <${process.env.EMAIL_USER || 'noreply@addjob.id'}>`,
    to, subject, html,
  })
}

// 1. Email verification
exports.sendVerificationEmail = async (user, token) => {
  const url = `${CLIENT_URL}/verify-email/${token}`
  await send(user.email, 'Verifikasi Email AddJob', baseTemplate(`
    <h2>Verifikasi Email Anda</h2>
    <p>Halo <strong>${user.name}</strong>,</p>
    <p>Terima kasih telah mendaftar di AddJob. Klik tombol di bawah untuk memverifikasi alamat email Anda.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${url}" class="btn">Verifikasi Email Saya</a>
    </div>
    <div class="info-box"><p>Link ini berlaku selama 24 jam.</p></div>
    <div class="divider"></div>
    <p style="font-size:13px;color:#90A4AE">Jika Anda tidak mendaftar di AddJob, abaikan email ini.</p>
  `))
}

// 2. Password reset
exports.sendPasswordResetEmail = async (user, token) => {
  const url = `${CLIENT_URL}/reset-password/${token}`
  await send(user.email, 'Reset Password AddJob', baseTemplate(`
    <h2>Reset Password</h2>
    <p>Halo <strong>${user.name}</strong>,</p>
    <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk melanjutkan.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${url}" class="btn">Reset Password</a>
    </div>
    <div class="info-box"><p>Link ini berlaku selama 30 menit.</p></div>
    <div class="divider"></div>
    <p style="font-size:13px;color:#90A4AE">Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tetap aman.</p>
  `))
}

// 3. Application submitted (to seeker)
exports.sendApplicationConfirmation = async (seeker, job, company) => {
  await send(seeker.email, `Lamaran Dikirim — ${job.title}`, baseTemplate(`
    <h2>Lamaran Berhasil Dikirim! 🎉</h2>
    <p>Halo <strong>${seeker.name}</strong>,</p>
    <p>Lamaran Anda untuk posisi berikut telah berhasil diterima:</p>
    <div class="info-box">
      <p>📋 ${job.title}</p>
      <p style="margin-top:6px;color:#607D8B">🏢 ${company.name} · 📍 ${job.location || ''}</p>
    </div>
    <p>Kami akan memberi tahu Anda melalui email jika ada pembaruan status dari perekrut. Pantau lamaran Anda di dashboard.</p>
    <div style="text-align:center;margin:28px 0">
      <a href="${CLIENT_URL}/seeker/applications" class="btn">Lihat Status Lamaran</a>
    </div>
    <div class="divider"></div>
    <p>Tetap semangat dan teruslah melamar! 💪</p>
  `))
}

// 4. New application (to employer)
exports.sendNewApplicationNotification = async (employer, applicant, job) => {
  await send(employer.email, `Pelamar Baru — ${job.title}`, baseTemplate(`
    <h2>Ada Pelamar Baru! 📬</h2>
    <p>Halo,</p>
    <p>Lowongan <strong>${job.title}</strong> mendapatkan pelamar baru:</p>
    <div class="info-box">
      <p>👤 ${applicant.name}</p>
      <p style="margin-top:6px;color:#607D8B">✉️ ${applicant.email}</p>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="${CLIENT_URL}/employer/applicants/${job._id}" class="btn">Lihat Pelamar</a>
    </div>
  `))
}

// 5. Application status update (to seeker)
exports.sendStatusUpdateEmail = async (seeker, application, job) => {
  const STATUS_LABELS = {
    reviewed:  'Lamaran Anda Sedang Ditinjau',
    shortlist: 'Selamat! Anda Masuk Shortlist 🎯',
    interview: 'Anda Diundang Interview! 🎉',
    offered:   'Selamat! Anda Mendapat Tawaran Kerja 🎊',
    hired:     'Selamat! Anda Diterima Bekerja! 🎊',
    rejected:  'Update Status Lamaran',
  }

  const STATUS_BADGE = {
    shortlist: 'badge-success', interview: 'badge-success',
    offered: 'badge-success', hired: 'badge-success',
    rejected: 'badge-rejected', reviewed: 'badge-pending',
  }

  const label  = STATUS_LABELS[application.status]  || 'Status Lamaran Diperbarui'
  const badge  = STATUS_BADGE[application.status]   || 'badge-pending'

  await send(seeker.email, `${label} — ${job.title}`, baseTemplate(`
    <h2>${label}</h2>
    <p>Halo <strong>${seeker.name}</strong>,</p>
    <p>Ada pembaruan status untuk lamaran Anda:</p>
    <div class="info-box">
      <p>📋 ${job.title}</p>
      <p style="margin-top:8px">Status: <span class="badge ${badge}">${application.status.toUpperCase()}</span></p>
    </div>
    ${application.statusHistory?.at(-1)?.note ? `<p><strong>Catatan dari perekrut:</strong><br>${application.statusHistory.at(-1).note}</p>` : ''}
    <div style="text-align:center;margin:28px 0">
      <a href="${CLIENT_URL}/seeker/applications" class="btn">Lihat Detail</a>
    </div>
  `))
}
