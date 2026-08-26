import * as helpService from '../services/help.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parsePagination } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'

export const listHelp = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { articles, meta } = await helpService.listPublishedHelp({
    q: req.query.q,
    category: req.query.category,
    page,
    limit,
    skip,
  })
  res.json({ data: { articles, meta } })
})

export const getHelp = asyncHandler(async (req, res) =>
  res.json({ data: { article: await helpService.getPublishedHelp(req.params.slug) } }),
)

export const adminList = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  let published
  if (req.query.published !== undefined) {
    if (!['true', 'false'].includes(req.query.published)) {
      throw new AppError(400, 'published must be true or false.', 'VALIDATION_ERROR')
    }
    published = req.query.published === 'true'
  }
  const result = await helpService.listAllHelp({ q: req.query.q, published, page, limit, skip })
  res.json({ data: result })
})

export const create = asyncHandler(async (req, res) =>
  res.status(201).json({ data: { article: await helpService.createHelp(req.user.id, req.body) } }),
)

export const update = asyncHandler(async (req, res) =>
  res.json({ data: { article: await helpService.updateHelp(req.user.id, req.params.id, req.body) } }),
)

export const remove = asyncHandler(async (req, res) => {
  await helpService.deleteHelp(req.user.id, req.params.id)
  res.status(204).send()
})

export default {
  listHelp,
  getHelp,
  adminList,
  create,
  update,
  remove,
}
