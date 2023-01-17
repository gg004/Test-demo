/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
module.exports = function (app) {

  app.get("/v2/api/custom/health", function (req, res) {
    try {
      return res.status(200).json({ message: "V2 OK" });
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        message: err.message,
      });
    }
  });

  return [
    {
      method: "GET",
      name: "Health Sample",
      url: "/v2/api/custom/sample/health",
      successPayload: "{error: false, role: 'admin', token: 'jwt token', expire_at: 60, user_id: 1}",
      queryBody: [{ code: "role", state: "projectId~secret" }],
      needToken: false,
      errors: [
        {
          name: "403",
          query: [{ key: "state", value: "projectId~secret" }],
          response: '{"error": true, "failure": "access token", "message": "Something went wrong"}',
        },
        {
          name: "403",
          query: [{ key: "state", value: "projectId~secret" }],
          response: '{"error": true, "failure": "me", "message": "Something went wrong"}',
        },
      ],
    }
  ];
}