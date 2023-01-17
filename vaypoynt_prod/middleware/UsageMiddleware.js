module.exports = function (req, res, next) {
  console.log('Usage Middleware:', req.originalUrl)
  next()
}