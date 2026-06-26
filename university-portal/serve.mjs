import { createServer } from 'node:http'

const port = process.env.PORT || 3000

const { default: handler } = await import('./dist/server/server.js')

createServer(async (req, res) => {
  const origin = `http://localhost:${port}`
  const url = new URL(req.url || '/', origin)

  const reqHeaders = new Headers()
  for (const [key, val] of Object.entries(req.headers)) {
    if (val) reqHeaders.set(key, Array.isArray(val) ? val.join(', ') : val)
  }

  let body = null
  if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    body = Buffer.concat(chunks)
  }

  const webReq = new Request(url, {
    method: req.method || 'GET',
    headers: reqHeaders,
    body: body?.length ? body : undefined
  })

  const webRes = await handler.fetch(webReq)

  res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()))
  const ab = await webRes.arrayBuffer()
  res.end(Buffer.from(ab))
}).listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
