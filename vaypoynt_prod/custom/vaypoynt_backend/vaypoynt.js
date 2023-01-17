/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
 module.exports = function (app) {
    app.get("/v2/api/custom/vaypoynt/health", function (req, res) {
      try {
        return res.status(200).json({ message: "Sample OK" });
      } catch (err) {
        console.error(err);
        res.status(404);
        res.json({
          message: err.message,
        });
      }
    });

 }