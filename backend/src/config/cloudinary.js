const cloudinary    = require('cloudinary').v2
const multer        = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'addjob/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
    resource_type:   'image',
  },
})

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'addjob/resumes',
    allowed_formats: ['pdf', 'doc', 'docx'],
    resource_type:   'raw',
    use_filename:    true,
    unique_filename: true,
  },
})

const fileSizeFilter = (maxMB) => ({ fileSize: maxMB * 1024 * 1024 })

const imageTypeFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|jpg)$/.test(file.mimetype)) return cb(null, true)
  cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'), false)
}

const resumeTypeFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (allowed.includes(file.mimetype)) return cb(null, true)
  cb(new Error('Format CV tidak didukung. Gunakan PDF atau DOC/DOCX.'), false)
}

exports.uploadImage  = multer({ storage: imageStorage,  limits: fileSizeFilter(3), fileFilter: imageTypeFilter })
exports.uploadResume = multer({ storage: resumeStorage, limits: fileSizeFilter(5), fileFilter: resumeTypeFilter })

exports.deleteFile = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (err) {
    console.error('Cloudinary delete error:', err.message)
  }
}

exports.cloudinary = cloudinary
