// Wraps an async Express route/controller so rejected promises reach the
// centralized error middleware instead of crashing the process.
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default asyncHandler