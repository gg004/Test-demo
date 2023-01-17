const { Sequelize, QueryTypes } = require("sequelize");

class MkdSqlAdapterSetting {
  constructor(databaseName, user, password, hostname, port) {
    this.databaseName = databaseName;
    this.user = user;
    this.password = password;
    this.hostname = hostname;
    this.port = port;
    this._connection = createSequelizeConnection(databaseName, user, password, hostname, port);
  }

  getConnection() {
    if (!this._connection) {
      this._connection = createSequelizeConnection(this.databaseName, this.user, this.password, this.hostname, this.port);
    }
    return this._connection;
  }
}

function createSequelizeConnection(databaseName, user, password, hostname, port) {
  return new Sequelize(databaseName, user, password, {
    dialect: "mariadb",
    host: hostname,
    port: port,
    logging: console.log,
    timezone: "+00:00",
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 60000
    },
    define: {
      timestamps: false,
      underscoredAll: true,
      underscored: true
    }
  });
}
module.exports = class BackendSDK {
  constructor() {
    this._dbConnection = null;
    this._table = "";
    this._projectId = "";
    this._secret = "";
  }

  createInstance(config) {
    let classObj = new MkdSqlAdapterSetting(config.databaseName, config.user, config.password, config.hostname, config.port);
    return classObj;
  }

  setDatabase(config) {
    if (!this._dbConnection) {
      this._dbConnection = this.createInstance(config).getConnection();
    }
    return this._dbConnection;
  }

  getDatabase() {
    return this._dbConnection;
  }

  setTable(table) {
    this._table = this._projectId + "_" + table;
  }

  getTable() {
    return this._table;
  }

  setProjectId(projectId) {
    this._projectId = projectId;
  }

  getProjectId() {
    return this._projectId;
  }

  setSecret(secret) {
    this._secret = secret;
  }

  getSecret() {
    return this._secret;
  }

  async join(table1, table2, joinId1, joinId2, selectStr, where) {
    try {
      if (selectStr.length < 1) {
        selectStr = " * ";
      }

      const namespaceTable1 = this._projectId + "_" + table1;
      const namespaceTable2 = this._projectId + "_" + table2;

      let sql =
        "SELECT " +
        selectStr +
        " FROM " +
        namespaceTable1 +
        " " +
        // table1 +
        " INNER JOIN " +
        namespaceTable2 +
        " " +
        // table2 +
        " ON " +
        `${namespaceTable1}.${joinId1}` +
        " = " +
        `${namespaceTable2}.${joinId2}` +
        " WHERE ";
      let rows = [];
      for (let i = 0; i < where.length; i++) {
        const element = where[i];
        rows.push(element);
      }

      if (rows.length < 1) {
        rows = [" 1 "];
      }

      sql += rows.join(" AND ");
      console.log("sql", sql);
      // console.log('bind', bind);
      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async joinPaginate(table1, table2, joinId1, joinId2, selectStr, where, page, limit, sortField, sortDirection) {
    try {
      if (selectStr.length < 1) {
        selectStr = " * ";
      }

      const namespaceTable1 = this._projectId + "_" + table1;
      const namespaceTable2 = this._projectId + "_" + table2;

      let sql =
        "SELECT " +
        selectStr +
        " FROM " +
        namespaceTable1 +
        " " +
        // table1 +
        " INNER JOIN " +
        namespaceTable2 +
        " " +
        // table2 +
        " ON " +
        `${namespaceTable1}.${joinId1}` +
        " = " +
        `${namespaceTable2}.${joinId2}` +
        " WHERE ";
      let rows = [];
      for (let i = 0; i < where.length; i++) {
        const element = where[i];
        rows.push(element);
      }

      if (rows.length < 1) {
        rows = [" 1 "];
      }

      sql += rows.join(" AND ");

      const offset = page * limit;
      sql += ` LIMIT ${offset} , ${limit}`;

      console.log("sql", sql);
      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async forceSync() {
    await this._dbConnection.sync({ force: true });
  }

  async joinPaginateStr(table1, table2, joinId1, joinId2, selectStr, where, page, limit, orderBy, direction) {
    try {
      const namespaceTable1 = this._projectId + "_" + table1;
      const namespaceTable2 = this._projectId + "_" + table2;

      let sql =
        "SELECT " +
        selectStr +
        " FROM " +
        namespaceTable1 +
        " " +
        table1 +
        " INNER JOIN " +
        namespaceTable2 +
        " " +
        table2 +
        " ON " +
        `${table1}.${joinId1}` +
        " = " +
        `${table2}.${joinId2}` +
        " WHERE ";

      if (!Array.isArray(where)) {
        throw new Error("Wrong parameter. Expecting array");
      }
      let count = where.length;

      if (count === 0) {
        sql += " 1";
      }

      sql += where.join(" AND ");

      if (orderBy && direction) {
        sql += ` ORDER BY ${orderBy} ${direction}`;
      }

      const offset = page * limit;

      sql += ` LIMIT ${offset} , ${limit}`;
      console.log("sql", sql);

      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Part: Join Multiple Tables
  removeProperties(result, properties) {
    result.forEach((el) => {
      properties.forEach((prop) => {
        delete el[prop];
      });
    });

    return result;
  }

  async joinMultiPaginateStr(tables, joinIds, selectStr, where, page, limit, orderBy, direction) {
    try {
      const namespaceTable1 = tables[0] ? this._projectId + "_" + tables[0] : "";
      const namespaceTable2 = tables[1] ? this._projectId + "_" + tables[1] : "";
      const namespaceTable3 = tables[2] ? this._projectId + "_" + tables[2] : "";

      if (tables.length === 3 && (namespaceTable1 === "" || namespaceTable2 === "" || namespaceTable3 === "")) {
        throw new Error("Wrong parameter. Empty tables.");
      }
      if (tables.length === 2 && (namespaceTable1 === "" || namespaceTable2 === "")) {
        throw new Error("Wrong parameter. Empty tables.");
      }

      if (tables.length === 3) {
        var sql =
          "SELECT " +
          selectStr +
          " FROM " +
          namespaceTable1 +
          " " +
          // tables[0] +
          " LEFT JOIN " +
          namespaceTable2 +
          " " +
          // tables[1] +
          " ON " +
          `${namespaceTable1}.${joinIds[0]}` +
          " = " +
          `${namespaceTable2}.${joinIds[1]}` +
          " LEFT JOIN " +
          namespaceTable3 +
          " " +
          // tables[2] +
          " ON " +
          `${namespaceTable1}.${joinIds[0]}` +
          " = " +
          `${namespaceTable3}.${joinIds[0]}` +
          " WHERE ";
      } else if (tables.length === 2) {
        var sql =
          "SELECT " +
          selectStr +
          " FROM " +
          namespaceTable1 +
          " " +
          // tables[0] +
          " LEFT JOIN " +
          namespaceTable2 +
          " " +
          // tables[1] +
          " ON " +
          `${namespaceTable1}.${joinIds[0]}` +
          " = " +
          `${namespaceTable2}.${joinIds[1]}` +
          " WHERE ";
      } else if (tables.length === 1) {
        var sql = "SELECT " + selectStr + " FROM " + namespaceTable1 + " " /* + tables[0] */ + " WHERE ";
      } else {
        throw new Error("Wrong parameter. No table found.");
      }

      if (!Array.isArray(where)) {
        throw new Error("Wrong parameter. Expecting array");
      }

      let count = where.length;

      if (count === 0) {
        sql += " 1";
      }

      sql += where.join(" AND ");

      if (orderBy && direction) {
        sql += ` ORDER BY ${orderBy} ${direction}`;
      }

      const offset = page * limit;

      sql += ` LIMIT ${offset} , ${limit}`;

      console.log("sql", sql);

      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return this.removeProperties(result, ["password"]);
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async joinCount(table1, table2, joinId1, joinId2, where) {
    try {
      const namespaceTable1 = this._projectId + "_" + table1;
      const namespaceTable2 = this._projectId + "_" + table2;

      let countSql =
        "SELECT count(*) as num FROM " +
        namespaceTable1 +
        " INNER JOIN " +
        namespaceTable2 +
        " " +
        // table2 +
        " ON " +
        `${namespaceTable1}.${joinId1}` +
        " = " +
        `${namespaceTable2}.${joinId2}` +
        " WHERE ";

      let rows = [];
      for (let i = 0; i < where.length; i++) {
        const element = where[i];
        rows.push(element);
      }

      if (rows.length < 1) {
        rows = [" 1 "];
      }

      countSql += rows.join(" AND ");
      console.log("countSql", countSql);

      const countResult = await this._dbConnection.query(countSql, {
        type: QueryTypes.SELECT
      });

      let total = 0;
      if (countResult.length > 0) {
        total = countResult[0].num;
      }

      return total;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async get(where, selectStr = "*", orderBy = "id", direction = "DESC", customWhere = null) {
    try {
      let sql = "SELECT " + selectStr + " FROM " + this._table + " WHERE ";
      let rows = [];
      let count = 1;
      let bind = [];
      for (const key in where) {
        if (Object.hasOwnProperty.call(where, key)) {
          const element = where[key];
          rows.push(`\`${key}\` = $${count}`);
          count++;
          bind.push(element);
        }
      }

      if (count == 1) {
        sql += " 1";
      }

      sql += rows.join(" AND ");
      if (customWhere) sql += " and " + customWhere + " ";
      sql += ` ORDER BY \`${orderBy}\` ${direction}`;
      console.log("sql", sql);
      console.log("bind", bind);
      const result = await this._dbConnection.query(sql, {
        bind: bind,
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async paginate(where, selectStr = "*", page, limit, order, direction, customWhere) {
    try {
      let sql = "SELECT " + selectStr + " FROM " + this._table + " WHERE ";
      let rows = [];
      let count = 1;
      let bind = [];
      for (const key in where) {
        if (Object.hasOwnProperty.call(where, key)) {
          const element = where[key];
          rows.push(`${key} = $${count}`);
          count++;
          bind.push(element);
        }
      }

      if (count == 1) {
        sql += " 1";
      }

      sql += rows.join(" AND ");

      if (customWhere) sql += " and " + customWhere + " ";

      if (order) {
        sql += ` order by ${order} ${direction ? direction : "ASC"} `;
      }

      const offset = (page - 1) * limit;

      sql += ` LIMIT ${offset} , ${limit}`;
      console.log("sql", sql);
      // console.log('bind', bind);

      const result = await this._dbConnection.query(sql, {
        bind: bind,
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async paginateStr(where, selectStr = "*", page, limit, order, direction) {
    try {
      let sql = "SELECT " + selectStr + " FROM " + this._table + " WHERE ";
      if (!Array.isArray(where)) {
        throw new Error("Wrong parameter. Expecting array");
      }
      let count = where.length;

      if (count === 0) {
        sql += " 1";
      }

      sql += where.join(" AND ");
      const offset = (page - 1) * limit;

      sql += ` LIMIT ${offset} , ${limit}`;
      console.log("sql", sql);

      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async joinCountStr(table1, table2, joinId1, joinId2, where) {
    try {
      const namespaceTable1 = this._projectId + "_" + table1;
      const namespaceTable2 = this._projectId + "_" + table2;

      let sql =
        "SELECT COUNT(*) as num FROM " +
        namespaceTable1 +
        " " +
        table1 +
        " INNER JOIN " +
        namespaceTable2 +
        " " +
        table2 +
        " ON " +
        `${table1}.${joinId1}` +
        " = " +
        `${table2}.${joinId2}` +
        " WHERE ";

      if (!Array.isArray(where)) {
        throw new Error("Wrong parameter. Expecting array");
      }
      let count = where.length;

      if (count === 0) {
        sql += " 1";
      }

      sql += where.join(" AND ");
      console.log(sql);
      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result[0].num;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async joinMultiCountStr(tables, joinIds, where) {
    try {
      const namespaceTable1 = tables[0] ? this._projectId + "_" + tables[0] : "";
      const namespaceTable2 = tables[1] ? this._projectId + "_" + tables[1] : "";
      const namespaceTable3 = tables[2] ? this._projectId + "_" + tables[2] : "";
      console.log(namespaceTable1);

      if (tables.length === 3 && (namespaceTable1 === "" || namespaceTable2 === "" || namespaceTable3 === "")) {
        throw new Error("Wrong parameter. Empty tables.");
      }
      if (tables.length === 2 && (namespaceTable1 === "" || namespaceTable2 === "")) {
        throw new Error("Wrong parameter. Empty tables.");
      }

      if (tables.length === 3) {
        var sql =
          "SELECT COUNT(*) as num FROM " +
          namespaceTable1 +
          " " +
          // tables[0] +
          " LEFT JOIN " +
          namespaceTable2 +
          " " +
          // tables[1] +
          " ON " +
          `${namespaceTable1}.${joinIds[0]}` +
          " = " +
          `${namespaceTable2}.${joinIds[1]}` +
          " LEFT JOIN " +
          namespaceTable3 +
          " " +
          // tables[2] +
          " ON " +
          `${namespaceTable1}.${joinIds[0]}` +
          " = " +
          `${namespaceTable3}.${joinIds[0]}` +
          " WHERE ";
      } else if (tables.length === 2) {
        var sql =
          "SELECT COUNT(*) as num FROM " +
          namespaceTable1 +
          " " +
          // tables[0] +
          " LEFT JOIN " +
          namespaceTable2 +
          " " +
          // tables[1] +
          " ON " +
          `${namespaceTable1}.${joinIds[0]}` +
          " = " +
          `${namespaceTable2}.${joinIds[1]}` +
          " WHERE ";
      } else if (tables.length === 1) {
        var sql = "SELECT COUNT(*) as num FROM " + namespaceTable1 + " " /* + tables[0] */ + " WHERE ";
      } else {
        throw new Error("Wrong parameter. No table found.");
      }

      if (!Array.isArray(where)) {
        throw new Error("Wrong parameter. Expecting array");
      }

      let count = where.length;

      if (count === 0) {
        sql += " 1";
      }

      sql += where.join(" AND ");
      console.log(sql);
      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result[0].num;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async countStr(where) {
    try {
      let sql = "SELECT COUNT(*) as num FROM " + this._table + " WHERE ";
      if (!Array.isArray(where)) {
        throw new Error("Wrong parameter. Expecting array");
      }
      let count = where.length;

      if (count === 0) {
        sql += " 1";
      }

      sql += where.join(" AND ");
      console.log(sql);
      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result[0].num;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async count(where) {
    try {
      let sql = "SELECT COUNT(*) as num FROM " + this._table + " WHERE ";
      let rows = [];
      let count = 1;
      let bind = [];
      for (const key in where) {
        if (Object.hasOwnProperty.call(where, key)) {
          const element = where[key];
          rows.push(`${key} = $${count}`);
          count++;
          bind.push(element);
        }
      }
      if (count == 1) {
        sql += " 1";
      }
      sql += rows.join(" AND ");
      console.log(sql);
      const result = await this._dbConnection.query(sql, {
        bind: bind,
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result[0].num;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async countCustom(where) {
    try {
      let sql = "SELECT COUNT(*) as num FROM " + this._table + " WHERE " + where;
      let rows = [];
      let count = 1;
      let bind = [];

      console.log(sql);
      const result = await this._dbConnection.query(sql, {
        bind: bind,
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result[0].num;
      } else {
        return 0;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getStr(where, selectStr = "*") {
    try {
      let sql = "SELECT " + selectStr + " FROM " + this._table + " WHERE ";
      let rows = [];
      for (let i = 0; i < where.length; i++) {
        const element = where[i];
        rows.push(element);
      }

      sql += rows.join(" AND ");
      // console.log('sql', sql);
      // console.log('bind', bind);
      const result = await this._dbConnection.query(sql, {
        type: QueryTypes.SELECT
      });

      if (result.length > 0) {
        return result;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async insert(payload) {
    try {
      const fields = Object.keys(payload);
      const questionMarks = [];
      for (let i = 0; i < fields.length; i++) {
        questionMarks.push("?");
      }

      let sql = "INSERT INTO " + this._table + " (" + fields.join(",") + ") VALUES (" + questionMarks.join(",") + ");";
      let bind = [];
      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
          const element = payload[key];
          bind.push(element);
        }
      }
      // console.log('sql', sql);
      const result = await this._dbConnection.query(sql, {
        replacements: bind,
        type: Sequelize.QueryTypes.INSERT
      });

      if (result.length == 2) {
        return result[0];
      } else {
        return null;
      }
    } catch (error) {
      console.log("INSERT ERROR", error);
      throw new Error(error.message);
    }
  }

  async update(payload, id) {
    try {
      let sql = "UPDATE " + this._table + " SET ";
      let rows = [];
      let bind = [];

      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
          const element = payload[key];
          rows.push(`${key} = ?`);
          bind.push(element);
        }
      }
      sql += rows.join(" , ");
      sql += " WHERE id = " + id;
      console.log("sql", sql);
      const result = await this._dbConnection.query(sql, {
        replacements: bind
      });

      if (result) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Point: Update Record by Condition
  async updateWhere(payload, condition) {
    try {
      let sql = "UPDATE " + this._table + " SET ";
      let setRows = [];
      let bind = [];

      // Part: Constructing SET Clause
      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
          const element = payload[key];
          setRows.push(`${key} = ?`);
          bind.push(element);
        }
      }

      sql += setRows.join(" , ");
      sql += " WHERE ";

      // Part: Constructing WHERE Clause
      const whereRows = [];
      for (const key in condition) {
        if (Object.hasOwnProperty.call(condition, key)) {
          const element = condition[key];
          whereRows.push(`${key} = ?`);
          bind.push(element);
        }
      }

      sql += whereRows.join(" AND ");

      const result = await this._dbConnection.query(sql, {
        replacements: bind
      });

      if (result) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async delete(payload, id) {
    try {
      let sql = "DELETE FROM " + this._table + " WHERE ";
      let rows = ["id = ?"];
      let bind = [id];

      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
          const element = payload[key];
          rows.push(`${key} = ?`);
          bind.push(element);
        }
      }

      sql += rows.join(" AND ");
      // console.log('sql', sql);
      const result = await this._dbConnection.query(sql, {
        replacements: bind
      });

      if (result) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteWhere(payload) {
    try {
      let sql = "DELETE FROM " + this._table + " WHERE ";
      let rows = [];
      let bind = [];

      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
          const element = payload[key];
          rows.push(`${key} = ?`);
          bind.push(element);
        }
      }

      sql += rows.join(" AND ");
      // console.log('sql', sql);
      const result = await this._dbConnection.query(sql, {
        replacements: bind
      });

      if (result) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async rawQuery(sql) {
    const result = await this._dbConnection.query(sql, {
      type: QueryTypes.SELECT
    });

    if (result.length > 0) {
      return result;
    } else {
      return [];
    }
  }

  whitelistField(data, keys) {
    let payload = {};
    keys.forEach((key) => {
      if (data[key]) {
        payload[key] = data[key];
      }
    });

    return payload;
  }

  blacklistField(data, keys) {
    keys.forEach((key) => {
      if (data[key]) {
        delete data[key];
      }
    });

    return data;
  }
};
