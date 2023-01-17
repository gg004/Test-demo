const config = require("../config");
const redis = require('redis');

module.exports = class RedisService {
  constructor() {
    this._is_connected = false;

    if (config.is_redis) {
      const client = redis.createClient({
        socket: {
          host: config.redis_host,
          port: config.redis_port,
        },
        password: config.redis_password
      });
      client.on('error', err => {
        console.log('Error ' + err);
      });

      client.on('connect', function () {
        console.log('Connected!');
      });

      this._redis = client;
    } else {
      this._db = {};
      let self = this;
      this._redis = {
        set: function (key, value) {
          self._db[key] = value;
        },
        hSet: function (key, value) {
          self._db[key] = value;
        },
        get: function (key) {
          if (Object.hasOwnProperty.call(self._db, key)) {
            return self._db[key];
          } else {
            return null;
          }
        },
        hGet: function (key) {
          if (Object.hasOwnProperty.call(self._db, key)) {
            return self._db[key];
          } else {
            return null;
          }
        },
        add: function (key) {
          if (Object.hasOwnProperty.call(self._db, key)) {
            self._db[key] = self._db[key] + 1;
          } else {
            return null;
          }
        },
      };
    }
  }

  async getClient() {
    if (this._is_connected) {
      return this._redis;
    } else {
      await this._redis.connect();
      this._is_connected = true;
      return this._redis;
    }
  }
};
