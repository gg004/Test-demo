const hideSentive = (body) => {
  let temp = { ...body };
  if (temp.password) delete temp.password;

  return temp;
};
module.exports = function (req, res, next) {
  console.log({
    METHOD: req.method,
    API: req.originalUrl,
    BODY: hideSentive(req.body),
  });
  next();
};
