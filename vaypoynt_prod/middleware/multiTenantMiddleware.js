exports.checkUserCompanyAdmin = (sdk) => async (req, res, next) => {
  try {
    sdk.setProjectId(req.projectId);
    sdk.getDatabase();
    sdk.setTable("user");

    const { user_id } = req;
    const { id } = req.params;

    const user = (await sdk.get({ id: user_id }))[0];
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    sdk.setTable("company_admin");

    const is_company_admin = (await sdk.get({ user_id, company_id: id }))[0];
    if (!is_company_admin && req.role != "admin") {
      return res.status(403).json({ error: true, message: "You are not allowed to perform this action" });
    }

    next();
  } catch (e) {
    res.status(401).json({ error: true, code: 401, message: "Something went wrong" });
  }
};
