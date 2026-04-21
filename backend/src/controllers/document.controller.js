const Company             = require('../models/Company')
const { uploadToDrive, deleteFromDrive } = require('../config/googleDrive')

const DOC_FIELDS = {
  nib_doc:   'NIB',
  sk_doc:    'SK Kemenkumham',
  akta_doc:  'Akta Pendirian Usaha',
}

// ── POST /api/companies/employer/documents/:docType ────────
exports.uploadDocument = async (req, res, next) => {
  try {
    const { docType } = req.params

    if (!DOC_FIELDS[docType]) {
      return res.status(400).json({ success: false, message: 'Tipe dokumen tidak valid.' })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File tidak ditemukan.' })
    }

    const company = await Company.findOne({ owner: req.user._id })
    if (!company) {
      return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan.' })
    }

    // Delete old file from Drive if exists
    const oldFileId = company.documents?.[docType]?.fileId
    if (oldFileId) {
      await deleteFromDrive(oldFileId)
    }

    // Build filename: docType_companySlug_timestamp.ext
    const ext      = req.file.originalname.split('.').pop()
    const filename = `${docType}_${company.slug}_${Date.now()}.${ext}`

    // Upload to Google Drive
    const { fileId, viewUrl } = await uploadToDrive(
      req.file.buffer,
      filename,
      req.file.mimetype
    )

    // Save to Company.documents
    await Company.findOneAndUpdate(
      { owner: req.user._id },
      { $set: { [`documents.${docType}`]: { fileId, viewUrl, uploadedAt: new Date() } } },
      { new: true }
    )

    res.json({
      success: true,
      message: `${DOC_FIELDS[docType]} berhasil diupload.`,
      data: { fileId, viewUrl },
    })
  } catch (err) { next(err) }
}

// ── DELETE /api/companies/employer/documents/:docType ──────
exports.deleteDocument = async (req, res, next) => {
  try {
    const { docType } = req.params

    if (!DOC_FIELDS[docType]) {
      return res.status(400).json({ success: false, message: 'Tipe dokumen tidak valid.' })
    }

    const company = await Company.findOne({ owner: req.user._id })
    if (!company) {
      return res.status(404).json({ success: false, message: 'Perusahaan tidak ditemukan.' })
    }

    const fileId = company.documents?.[docType]?.fileId
    if (fileId) {
      await deleteFromDrive(fileId)
    }

    await Company.findOneAndUpdate(
      { owner: req.user._id },
      { $unset: { [`documents.${docType}`]: '' } }
    )

    res.json({ success: true, message: `${DOC_FIELDS[docType]} berhasil dihapus.` })
  } catch (err) { next(err) }
}