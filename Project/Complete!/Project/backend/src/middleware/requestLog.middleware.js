export function requestLog(req, res, next) {
  const started = Date.now()
  res.on('finish', () => {
    const durationMs = Date.now() - started
    console.log(JSON.stringify({ type: 'http_request', method: req.method, path: req.originalUrl, status: res.statusCode, durationMs }))
  })
  next()
}

export default { requestLog }
