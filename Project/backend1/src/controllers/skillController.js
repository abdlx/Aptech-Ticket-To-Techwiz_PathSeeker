import { Skill } from '../models/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/skills?q=java
export const listSkills = asyncHandler(async (req, res) => {
  const { q } = req.query
  const filter = { active: true }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { aliases: { $regex: q, $options: 'i' } },
    ]
  }

  const skills = await Skill.find(filter).sort({ name: 1 }).limit(50)
  res.status(200).json({ skills })
})