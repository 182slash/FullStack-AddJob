const { google } = require('googleapis')
const { Readable } = require('stream')

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key:  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
})

const drive = google.drive({ version: 'v3', auth })

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID

/**
 * Upload a file buffer to Google Drive
 * @param {Buffer} buffer - file buffer
 * @param {string} filename - file name to store
 * @param {string} mimeType - file mime type
 * @returns {{ fileId, viewUrl }}
 */
const uploadToDrive = async (buffer, filename, mimeType) => {
  const stream = Readable.from(buffer)

  const res = await drive.files.create({
    requestBody: {
      name:    filename,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  })

  // Make file publicly viewable
  await drive.permissions.create({
    fileId:    res.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  return {
    fileId:  res.data.id,
    viewUrl: res.data.webViewLink,
  }
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId
 */
const deleteFromDrive = async (fileId) => {
  try {
    await drive.files.delete({ fileId })
  } catch (e) {
    console.warn('Drive delete failed:', e.message)
  }
}

module.exports = { uploadToDrive, deleteFromDrive }