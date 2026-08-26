import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import AppError from '../utils/AppError.js'

const MAX_FILE_BYTES = 25 * 1024 * 1024
const ALLOWED = new Map([
  ['application/pdf', { ext: 'pdf', extensions: ['.pdf'], magic: (b) => b.subarray(0, 4).toString() === '%PDF' }],
  ['image/jpeg', { ext: 'jpg', extensions: ['.jpg', '.jpeg'], magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff }],
  ['image/png', { ext: 'png', extensions: ['.png'], magic: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) }],
  ['image/webp', { ext: 'webp', extensions: ['.webp'], magic: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' }],
  ['image/gif', { ext: 'gif', extensions: ['.gif'], magic: (b) => ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString()) }],
  ['video/mp4', { ext: 'mp4', extensions: ['.mp4'], magic: (b) => b.subarray(4, 8).toString() === 'ftyp' }],
  ['video/webm', { ext: 'webm', extensions: ['.webm'], magic: (b) => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) }],
  ['audio/mpeg', { ext: 'mp3', extensions: ['.mp3'], magic: (b) => b.subarray(0, 3).toString() === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) }],
  ['audio/wav', { ext: 'wav', extensions: ['.wav'], magic: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WAVE' }],
])

function parseDisposition(value) {
  const name = /name="([^"]+)"/i.exec(value)?.[1]
  const filename = /filename="([^"]*)"/i.exec(value)?.[1]
  return { name, filename }
}

export function uploadSingleFile({ fieldName = 'file', maxBytes = MAX_FILE_BYTES } = {}) {
  return async (req, _res, next) => {
    if (!String(req.headers['content-type'] || '').startsWith('multipart/form-data;')) return next()
    const boundary =
      /boundary=(?:"([^"]+)"|([^;]+))/i.exec(req.headers['content-type'])?.[1] ||
      /boundary=(?:"([^"]+)"|([^;]+))/i.exec(req.headers['content-type'])?.[2]
    if (!boundary) return next(new AppError(400, 'Multipart boundary is missing.', 'INVALID_UPLOAD'))

    const chunks = []
    let total = 0
    try {
      for await (const chunk of req) {
        total += chunk.length
        if (total > maxBytes + 2 * 1024 * 1024) throw new AppError(413, 'Upload is too large.', 'UPLOAD_TOO_LARGE')
        chunks.push(chunk)
      }
      const body = Buffer.concat(chunks)
      const marker = Buffer.from(`--${boundary}`)
      const parts = []
      let cursor = body.indexOf(marker)
      while (cursor !== -1) {
        const nextMarker = body.indexOf(marker, cursor + marker.length)
        if (nextMarker === -1) break
        let part = body.subarray(cursor + marker.length)
        if (part.subarray(0, 2).equals(Buffer.from('--'))) break
        if (part.subarray(0, 2).equals(Buffer.from('\r\n'))) part = part.subarray(2)
        const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))
        if (headerEnd === -1) {
          cursor = nextMarker
          continue
        }
        const headersText = part.subarray(0, headerEnd).toString('utf8')
        let content = part.subarray(headerEnd + 4)
        if (content.subarray(-2).equals(Buffer.from('\r\n'))) content = content.subarray(0, -2)
        const disposition =
          headersText.split(/\r\n/).find((line) => line.toLowerCase().startsWith('content-disposition:')) || ''
        const { name, filename } = parseDisposition(disposition)
        const contentType =
          headersText
            .split(/\r\n/)
            .find((line) => line.toLowerCase().startsWith('content-type:'))
            ?.split(':')
            .slice(1)
            .join(':')
            .trim() || 'application/octet-stream'
        parts.push({ name, filename, contentType, content })
        cursor = nextMarker
      }

      const file = parts.find((part) => part.name === fieldName && part.filename)
      if (!file) return next(new AppError(400, `Multipart field '${fieldName}' is required.`, 'FILE_REQUIRED'))
      if (!file.content.length || file.content.length > maxBytes) {
        return next(new AppError(413, 'Upload is empty or too large.', 'UPLOAD_TOO_LARGE'))
      }
      const spec = ALLOWED.get(file.contentType.toLowerCase())
      if (!spec) return next(new AppError(415, `Unsupported file type: ${file.contentType}`, 'UNSUPPORTED_FILE_TYPE'))
      const extension = path.extname(file.filename || '').toLowerCase()
      if (!spec.extensions.includes(extension)) {
        return next(new AppError(415, 'The file extension does not match its declared MIME type.', 'INVALID_FILE_EXTENSION'))
      }
      if (!spec.magic(file.content)) {
        return next(new AppError(415, 'The file signature does not match its declared MIME type.', 'INVALID_FILE_SIGNATURE'))
      }

      const safeOriginalName =
        path
          .basename(file.filename)
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .slice(0, 180) || `upload.${spec.ext}`
      const storedName = `${crypto.randomUUID()}.${spec.ext}`
      const uploadDir = req.app.locals.uploadDir || path.resolve(process.env.UPLOAD_DIR || './uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      await fs.writeFile(path.join(uploadDir, storedName), file.content, { flag: 'wx' })
      req.uploadedFile = {
        assetKey: storedName,
        url: `${req.protocol}://${req.get('host')}/uploads/${storedName}`,
        mimeType: file.contentType.toLowerCase(),
        sizeBytes: file.content.length,
        originalName: safeOriginalName,
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
