import crypto from 'node:crypto'

export function requestContext(req, res, next) {
  const requestId = req.get('x-request-id')?.slice(0, 128) || crypto.randomUUID()
  const startedAt = Date.now()

  req.requestId = requestId
  res.setHeader('x-request-id', requestId)
  res.on('finish', () => {
    const record = {
      level: res.statusCode >= 500 ? 'error' : 'info',
      event: 'http_request',
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    }
    console.log(JSON.stringify(record))
  })
  next()
}

export default requestContext
