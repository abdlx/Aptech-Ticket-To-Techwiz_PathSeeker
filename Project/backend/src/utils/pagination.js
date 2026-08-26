// Shared query-string -> pagination options parser used by every list
// endpoint (careers, resources, multimedia, stories, admin lists, etc.).
export function parsePagination(query, { defaultLimit = 20, maxLimit = 50 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildPaginationMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export default { parsePagination, buildPaginationMeta }