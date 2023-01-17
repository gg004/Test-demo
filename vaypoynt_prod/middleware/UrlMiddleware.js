module.exports = function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}