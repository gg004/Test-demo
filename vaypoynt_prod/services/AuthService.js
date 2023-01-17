const JwtService = require("./JwtService");
const PasswordService = require("./PasswordService");
const { sqlDateFormat, sqlDateTimeFormat } = require("./UtilService");

module.exports = class AuthService {
  constructor() { }

  async login(sdk, projectId, email, password, role) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("user");

    try {
      const exist = await sdk.get({
        email: email,
        role,
        role
      });

      if (exist.length > 0) {
        const hashPassword = exist[0].password;
        const passwordValid = await PasswordService.compareHash(password, hashPassword);

        if (!passwordValid) {
          throw new Error("Invalid Password");
        }

        return exist[0];
      } else {
        throw new Error("User does not exist");
      }
    } catch (error) {
      console.log("error", error);
      return error.message;
    }
  }

  async register(sdk, projectId, email, password, role, verify = 0) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("user");
    try {
      const exist = await sdk.get({
        email: email
      });

      if (exist.length > 0) {
        throw new Error("User exists");
      } else {
        const hashPassword = await PasswordService.hash(password);
        const result = await sdk.insert({
          email: email,
          password: hashPassword,
          role: role,
          verify: verify,
          status: 1,
          type: 0,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date())
        });

        sdk.setTable("profile");

        await sdk.insert({
          user_id: result,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date())
        });

        return result;
      }
    } catch (error) {
      return error.message;
    }
  }

  async googleLogin(sdk, projectId, user, tokens, role, company_id) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("user");

    try {
      const exist = await sdk.get({
        email: user.email,
        oauth: "google"
      });

      if (exist.length > 0) {
        if (company_id && exist[0].company_id !== company_id) {
          throw new Error("This account is not associated with this company");
        }
        return exist[0].id;
      } else {
        const result = await sdk.insert({
          oauth: "google",
          email: user.email ? user.email : "na",
          password: " ",
          role: role,
          first_name: user.given_name ? user.given_name : " ",
          last_name: user.family_name ? user.family_name : " ",
          verify: 1,
          status: 1,
          type: 1,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          ...(company_id && { company_id })
        });

        sdk.setTable("profile");

        await sdk.insert({
          user_id: result,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date())
        });

        sdk.setTable("token");

        await sdk.insert({
          user_id: result,
          token: tokens.access_token,
          type: 1,
          data: JSON.stringify({ user, tokens }),
          status: 1,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          expire_at: sqlDateTimeFormat(new Date(tokens.expiry_date))
        });

        return result;
      }
    } catch (error) {
      return error.message;
    }
  }

  async appleLogin(sdk, projectId, user, tokens, role, company_id) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("user");

    const exist = await sdk.get({
      email: user.email,
      oauth: "apple"
    });

    if (exist.length > 0) {
      if (exist[0].role != role) throw new Error("Unauthorized");
      if (company_id && exist[0].company_id !== company_id) {
        throw new Error("This account is not associated with this company");
      }
      return exist[0].id;
    } else {
      const result = await sdk.insert({
        oauth: "apple",
        email: user.email,
        password: " ",
        role: role,
        first_name: user.first_name ? user.first_name : " ",
        last_name: user.last_name ? user.last_name : " ",
        verify: 1,
        status: 1,
        type: 1,
        create_at: sqlDateFormat(new Date()),
        ...(company_id && { company_id }),
        update_at: sqlDateTimeFormat(new Date())
      });

      sdk.setTable("profile");

      await sdk.insert({
        user_id: result,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date())
      });

      return result;
    }
  }

  async facebookLogin(sdk, projectId, user, tokens, role, company_id) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("user");

    try {
      const exist = await sdk.get({
        email: user.email,
        oauth: "facebook"
      });

      if (exist.length > 0) {
        if (company_id && exist[0].company_id !== company_id) {
          throw new Error("This account is not associated with this company");
        }
        return exist[0].id;
      } else {
        const result = await sdk.insert({
          oauth: "facebook",
          email: user.email ? user.email : "na",
          password: " ",
          role: role,
          first_name: user.first_name ? user.first_name : " ",
          last_name: user.last_name ? user.last_name : " ",
          verify: 1,
          status: 1,
          type: 1,
          ...(company_id && { company_id }),
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date())
        });

        sdk.setTable("profile");

        await sdk.insert({
          user_id: result,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date())
        });

        sdk.setTable("token");

        await sdk.insert({
          user_id: result,
          token: tokens.access_token,
          type: 1,
          data: JSON.stringify({ user, tokens }),
          status: 1,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          expire_at: sqlDateTimeFormat(new Date(new Date().setSeconds(tokens.expires_in)))
        });
        return result;
      }
    } catch (error) {
      return error.message;
    }
  }

  async getRole(sdk, projectId, role) {
    sdk.getDatabase();
    sdk.setTable("role");
    sdk.setProjectId(projectId);

    try {
      const exist = await sdk.get({
        name: role
      });

      if (exist) {
        return exist[0].name;
      } else {
        throw new Error("Role does not exist");
      }
    } catch (error) {
      console.log("error", error);
      return error.message;
    }
  }

  async forgot(sdk, projectId, email, userId) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("token");

    try {
      let tomorrow = new Date();
      tomorrow.setHours(new Date().getHours() + 24);
      const code = Math.floor(Math.random() * 1000000);
      const token = JwtService.generateString(50);
      const payload = {
        token: token,
        type: 0,
        data: '{"email": "' + email + '", "token": "' + token + '", "code": "' + code + '"}',
        user_id: userId,
        status: 1,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        expire_at: sqlDateTimeFormat(tomorrow)
      };
      const result = await sdk.insert(payload);
      return { ...payload, code, token };
    } catch (error) {
      return error.message;
    }
  }

  async mobileForgot(sdk, projectId, email, userId) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("token");

    try {
      let tomorrow = new Date();
      tomorrow.setHours(new Date().getHours() + 1);
      const code = Math.floor(Math.random() * 1000000);
      const token = JwtService.generateString(50);
      const payload = {
        token: code,
        type: 0,
        data: '{"email": "' + email + '", "token": "' + token + '", "code": "' + code + '"}',
        user_id: userId,
        status: 1,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        expire_at: sqlDateTimeFormat(tomorrow)
      };
      const result = await sdk.insert(payload);
      return { ...payload, code, token: code };
    } catch (error) {
      return error.message;
    }
  }

  async mobileVerify(sdk, projectId, email) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("token");

    try {
      let tomorrow = new Date();
      tomorrow.setHours(new Date().getHours() + 1);
      const code = Math.floor(Math.random() * 1000000);
      const payload = {
        token: code,
        type: 5,
        data: '{"email": "' + email + '", "code": "' + code + '"}',
        user_id: 0,
        status: 1,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        expire_at: sqlDateTimeFormat(tomorrow)
      };
      const result = await sdk.insert(payload);

      return { ...payload, code, token: code };
    } catch (error) {
      return error.message;
    }
  }

  async reset(sdk, projectId, token, password) {
    sdk.getDatabase();
    sdk.setTable("user");
    sdk.setProjectId(projectId);

    try {
      const exist = await sdk.get({
        id: token.user_id
      });

      if (exist) {
        const hashPassword = await PasswordService.hash(password);
        await sdk.update(
          {
            password: hashPassword,
            update_at: sqlDateTimeFormat(new Date())
          },
          exist[0].id
        );

        if (exist[0].id) {
          sdk.setTable("token");
          await sdk.delete({}, token.id);
          return exist[0].id;
        } else {
          throw new Error("Password Update Failed");
        }
      } else {
        throw new Error("Invalid User");
      }
    } catch (error) {
      console.log("error", error);
      return error.message;
    }
  }

  async saveRefreshToken(sdk, projectId, user_id, token, expireDate) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);

    try {
      sdk.setTable("token");
      const result = await sdk.insert({
        user_id: user_id,
        token: token,
        type: 2,
        data: JSON.stringify({ user_id, token }),
        status: 1,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        expire_at: sqlDateTimeFormat(expireDate)
      });
      return result;
    } catch (error) {
      return error.message;
    }
  }

  async checkRefreshToken(sdk, projectId, userId, token) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("token");

    try {
      const exist = await sdk.get({
        user_id: userId,
        token: token,
        type: 2,
        status: 1
      });

      if (exist) {
        return exist[0];
      } else {
        throw new Error("Invalid Token");
      }
    } catch (error) {
      return error.message;
    }
  }

  async updateRefreshToken(sdk, projectId, oldToken, newToken, expireDate) {
    sdk.getDatabase();
    sdk.setProjectId(projectId);
    sdk.setTable("token");

    try {
      const exist = await sdk.get({
        token: oldToken,
        type: 2,
        status: 1
      });

      if (exist) {
        // change old token status to 0
        await sdk.update(
          {
            status: 0,
            update_at: sqlDateTimeFormat(new Date())
          },
          exist[0].id
        );

        // insert new token
        const result = await sdk.insert({
          user_id: exist[0].user_id,
          token: newToken,
          type: 2,
          data: JSON.stringify({ user_id, token: newToken }),
          status: 1,
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          expire_at: sqlDateTimeFormat(expireDate)
        });

        return result;
      } else {
        throw new Error("Invalid Token");
      }
    } catch (error) {
      return error.message;
    }
  }
};
