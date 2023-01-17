const ProjectMiddleware = require("../middleware/ProjectMiddleware");
const UrlMiddleware = require("../middleware/UrlMiddleware");
const HostMiddleware = require("../middleware/HostMiddleware");
const TokenMiddleware = require("../middleware/TokenMiddleware");
const { sqlDateFormat, sqlDateTimeFormat } = require("../services/UtilService");

const middlewares = [
  ProjectMiddleware,
  UrlMiddleware,
  HostMiddleware,
  TokenMiddleware()
  // RateLimitMiddleware,
  // LogMiddleware,
  // UsageMiddleware
  // CheckProjectMiddleware,
  // AnalyticMiddleware,
  // RoleMiddleware
];

module.exports = function (app) {
  app.get("/v3/api/lambda/realtime/room/poll", middlewares, async function (req, res) {
    let client = req.app.get("subscriber");
    let room = req.query.room;
    let user_id = req.query.user_id;
    const startTime = new Date().getTime();
    let messageTriggered = false;
    let timer;

    //We assume user going send room
    try {
      timer = setTimeout(() => {
        if (!messageTriggered) {
          const endTime = new Date().getTime();
          clearTimeout(timer);
          res.status(408).json({ error: true, message: "TIMEOUT", diff: (endTime - startTime) / 1000 });
          return;
        }
      }, 60000);

      await client.subscribe(req.projectId + "_chat_" + user_id, async (data) => {
        const endTime = new Date().getTime();
        await client.unsubscribe(req.projectId + "_chat_" + user_id);
        clearTimeout(timer);
        messageTriggered = true;
        const payloadReceived = JSON.parse(data);
        return timer && res.status(200).json({ message: payloadReceived.message, user_id: payloadReceived.user_id, diff: (endTime - startTime) / 1000 });
      });

      // await client.subscribe(req.projectId + '_' + room, async (data) => {
      //   const endTime = new Date().getTime();
      //   await client.unsubscribe(req.projectId + '_' + room);
      //   clearTimeout(timer);
      //   messageTriggered = true;
      //   const payloadReceived = JSON.parse(data);
      //   return res.status(200).json({ message: payloadReceived.message, user_id: payloadReceived.user_id, diff: (endTime - startTime) / 1000 });
      // });

      return;
    } catch (error) {
      console.log("Poll Error", error);
      clearTimeout(timer);
      const endTime = new Date().getTime();
      res.status(500).json({ error: true, message: "Something went wrong", diff: (endTime - startTime) / 1000 });
      return;
    }
  });

  app.post("/v3/api/lambda/realtime/search", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("chat");

      if (!req.body.room_id) {
        return res.status(403).json({
          error: true,
          message: "Room is required",
          validation: [{ field: "room_id", message: "Room is required" }]
        });
      }
      if (!req.body.search) {
        return res.status(403).json({
          error: true,
          message: "Search is required",
          validation: [{ field: "search", message: "Search is required" }]
        });
      }

      // let result = await sdk.get({
      //   room_id: req.body.room_id,
      // });
      let result = await sdk.getStr([`room_id = ${req.body.room_id} `, ` chat like '%${req.body.search}%' `]);

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }
      return res.status(200).json({
        error: false,
        list: result
      });
    } catch (err) {
      console.log("error ", err);
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/lambda/realtime/send", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      let client = req.app.get("publisher");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("chat");
      let id = 0;
      let room_id = 0;

      if (!req.body.room_id) {
        return res.status(403).json({
          error: true,
          message: "Room is required",
          validation: [{ field: "room_id", message: "Room is required" }]
        });
      }

      if (!req.body.user_id) {
        return res.status(403).json({
          error: true,
          message: "User is required",
          validation: [{ field: "user_id", message: "User is required" }]
        });
      }

      if (!req.body.message) {
        return res.status(403).json({
          error: true,
          message: "Message is required",
          validation: [{ field: "message", message: "Message is required" }]
        });
      }

      const new_chat = {
        message: req.body.message,
        user_id: req.body.user_id,
        is_image: req.body.is_image ? true : false,
        timestamp: new Date().getTime(),
        thread: []
      };
      const chatResult = await sdk.insert({
        room_id: req.body.room_id,
        unread: 1,
        chat: JSON.stringify(new_chat),
        create_at: sqlDateFormat(new Date(req.body.date)),
        update_at: sqlDateTimeFormat(new Date(req.body.date))
      });

      sdk.setTable("room");

      const roomResult = await sdk.get({
        id: req.body.room_id
      });

      let payload = {
        unread: 1,
        update_at: sqlDateTimeFormat(new Date())
      };

      console.log(roomResult);

      if (req.body.user_id == roomResult[0].user_id) {
        payload.user_update_at = sqlDateTimeFormat(new Date());
      } else {
        payload.other_user_update_at = sqlDateTimeFormat(new Date());
      }

      await sdk.update(payload, room_id);

      await client.publish(
        req.projectId + "_chat_" + (req.user_id == roomResult[0].user_id ? roomResult[0].other_user_id : roomResult[0].user_id),
        JSON.stringify({ message: req.body.message, user_id: req.body.user_id })
      );
      //await client.publish(req.projectId + '_' + room_id, JSON.stringify({ message: req.body.message, user_id: req.body.user_id }));

      return res.status(200).json({
        error: false,
        message: "Updated"
      });
    } catch (err) {
      console.log(err);
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.get("/v3/api/lambda/realtime/online", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("room");

      if (!req.query.room_id) {
        return res.status(403).json({
          error: true,
          message: "Room is required",
          validation: [{ field: "room_id", message: "Room is required" }]
        });
      }

      if (!req.query.online_user_id) {
        return res.status(403).json({
          error: true,
          message: "User is required",
          validation: [{ field: "online_user_id", message: "User is required" }]
        });
      }

      const result = await sdk.get({
        id: req.query.room_id
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(403).json({
          error: true,
          message: "Room does not exist"
        });
      }

      if (!(result[0].user_id == req.user_id || result[0].other_user_id == req.user_id)) {
        return res.status(403).json({
          error: true,
          message: "Invalid Room"
        });
      }

      const currentTime = new Date().getTime();
      let otherTime;
      if (req.query.online_user_id == result.user_id) {
        otherTime = new Date(result[0].user_update_at).getTime();
      } else {
        otherTime = new Date(result[0].other_user_update_at).getTime();
      }

      return res.status(200).json({
        error: false,
        message: currentTime - otherTime < 900000
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/lambda/realtime/chat", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("chat");

      if (!req.body.room_id) {
        return res.status(403).json({
          error: true,
          message: "Room is required",
          validation: [{ field: "room_id", message: "Room is required" }]
        });
      }

      let result = await sdk.get({
        room_id: req.body.room_id
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length) result = result.map((r) => JSON.parse(r.chat));
      return res.status(200).json({
        error: false,
        model: result
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.get("/v3/api/lambda/realtime/room", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("room");

      if (!req.query.room_id) {
        return res.status(403).json({
          error: true,
          message: "Room is required",
          validation: [{ field: "room_id", message: "Room is required" }]
        });
      }

      const result = await sdk.get({
        id: req.query.room_id
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(403).json({
          error: true,
          message: "Room does not exist"
        });
      }

      if (!(result[0].user_id == req.user_id || result[0].other_user_id == req.user_id)) {
        return res.status(403).json({
          error: true,
          message: "Invalid Room"
        });
      }

      return res.status(200).json({
        error: false,
        model: result[0]
      });
    } catch (err) {
      res.status(403);
      res.json({
        message: err.message
      });
    }
  });

  app.get("/v3/api/lambda/realtime/room/all", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("room");

      if (!req.query.other_user_id) {
        return res.status(403).json({
          error: true,
          message: "Other User is required",
          validation: [{ field: "other_user_id", message: "Other User is required" }]
        });
      }

      const result = await sdk.get({
        other_user_id: req.query.other_user_id
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      if (result.length != 1) {
        return res.status(403).json({
          error: true,
          message: "Room does not exist"
        });
      }

      let data = [];
      for (let i = 0; i < result.length; i++) {
        sdk.setTable("user");
        const user = await sdk.get(
          {
            id: result[i].user_id
          },
          "id, role, first_name, last_name, email, photo"
        );

        if (user.length > 0) {
          let details = { ...result[i] };
          details.first_name = user.first_name;
          details.last_name = user.last_name;
          details.email = user.email;
          details.photo = user.photo;
          data.push(details);
        }
      }

      return res.status(200).json({
        error: false,
        list: data
      });
    } catch (err) {
      res.status(403);
      res.json({
        message: err.message
      });
    }
  });
  app.get("/v3/api/lambda/realtime/room/my", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("room");
      let finalResult = [];
      const result = await sdk.get({
        user_id: req.user_id
      });
      const result2 = await sdk.get({
        other_user_id: req.user_id
      });
      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      finalResult = result;

      if (typeof result2 == "string") {
        return res.status(403).json({
          error: true,
          message: result2
        });
      }
      if (result2.length) {
        finalResult = finalResult.concat(
          result2.map((i) => {
            return {
              ...i,
              other_user_id: i.user_id,
              user_id: req.user_id
            };
          })
        );
      }

      const messages = await sdk.rawQuery(
        `SELECT ergo_chat.* FROM ergo_chat LEFT JOIN ergo_room ON ergo_chat.room_id = ergo_room.id WHERE (ergo_room.user_id = ${req.user_id} OR ergo_room.other_user_id = ${req.user_id}) AND ergo_chat.unread = 1 ORDER BY ergo_chat.create_at DESC`
      );

      let data = [];
      for (let i = 0; i < finalResult.length; i++) {
        sdk.setTable("user");
        const user = await sdk.get(
          {
            id: finalResult[i].other_user_id
          },
          "id, role, first_name, last_name, email, photo"
        );

        console.log("user is ", user);

        if (user.length > 0) {
          let details = { ...finalResult[i], unread: undefined, chat_id: undefined };
          details.first_name = user[0].first_name;
          details.last_name = user[0].last_name;
          details.email = user[0].email;
          details.photo = user[0].photo;
          data.push(details);
        }
      }

      return res.status(200).json({
        error: false,
        list: data,
        messages
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/lambda/realtime/room", middlewares, async function (req, res) {
    try {
      let sdk = req.app.get("sdk");
      sdk.getDatabase();
      sdk.setProjectId(req.projectId);
      sdk.setTable("room");

      if (!req.body.user_id) {
        return res.status(403).json({
          error: true,
          message: "User is required",
          validation: [{ field: "user_id", message: "User is required" }]
        });
      }

      if (!req.body.other_user_id) {
        return res.status(403).json({
          error: true,
          message: "User is required",
          validation: [{ field: "other_user_id", message: "User is required" }]
        });
      }

      const result = await sdk.insert({
        user_id: req.body.user_id,
        other_user_id: req.body.other_user_id,
        chat_id: -1,
        unread: 0,
        create_at: sqlDateFormat(new Date()),
        update_at: sqlDateTimeFormat(new Date()),
        user_update_at: sqlDateTimeFormat(new Date()),
        other_user_update_at: sqlDateTimeFormat(new Date())
      });

      if (typeof result == "string") {
        return res.status(403).json({
          error: true,
          message: result
        });
      }

      return res.status(200).json({
        error: false,
        room_id: result,
        chat_id: -1
      });
    } catch (err) {
      res.status(403);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
  return [
    {
      method: "GET",
      name: "Poll API",
      url: "/v3/api/lambda/realtime/room/poll",
      queryBody: "{'user_id' : 1,'room' : 5 }",
      successPayload: '{"message": "message text","user_id": 2, "diff": 300}',
      errors: [
        {
          name: "408",
          queryBody: "{'user_id' : 1,'room' : 5 }",
          response: '{"error": true,"message": "TIMEOUT", diff: 300}'
        },
        {
          name: "500",
          queryBody: "{'user_id' : 1,'room' : 5 }",
          response: '{"error":true, "message": "Something went wrong", diff: 300}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Message Search API",
      url: "/v3/api/lambda/realtime/search",
      successBody: "{'room_id' : 1, 'user_id':5, 'search': 'hi'}",
      successPayload: '{"error": false,"list": [{"id": 1, chat: "hi Sam", room_id: 1},{"id": 33, chat: "hi rob", room_id: 1}]}',
      errors: [
        {
          name: "403",
          body: "{ 'search': 'hi'}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "room_id", "message": "Room is required" }]}'
        },
        {
          name: "403",
          body: "{ 'room_id': 2}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "search", "message": "Search is required" }]}'
        },
        {
          name: "403",
          body: "{ 'room_id': 2, 'search': 'hi'}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Message Send API",
      url: "/v3/api/lambda/realtime/send",
      successBody: "{'room_id' : 1, 'user_id': 5, 'message': 'hello', 'is_image' : true}",
      successPayload: '{"error": false,"message": "updated"}',
      errors: [
        {
          name: "403",
          body: "{'user_id': 5, 'message': 'hello', 'is_image' : true}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "room_id", "message": "Room is required" }]}'
        },
        {
          name: "403",
          body: "{'user_id': 5, 'message': 'hello', 'is_image' : true}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "user_id", "message": "User is required" }]}'
        },
        {
          name: "403",
          body: "{'room_id' : 1, 'user_id': 5, 'is_image' : true}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "message", "message": "Message is required" }]}'
        },
        {
          name: "403",
          body: "{'room_id' : 1, 'user_id': 5, 'message': 'hello', 'is_image' : true}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "GET",
      name: "User Online API",
      url: "/v3/api/lambda/realtime/online",
      queryBody: "{'room_id' : 1, 'user_id': 5}",
      successPayload: '{"error": false,"message": 3000}',
      errors: [
        {
          name: "403",
          queryBody: "{'user_id': 5}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "room_id", "message": "Room is required" }]}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1, 'user_id': 5}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "user_id", "message": "User is required" }]}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1, 'user_id': 5}",
          response: '{"error": true,"message": "Room does not exist"}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1, 'user_id': 5}",
          response: '{"error": true,"message": "Invalid Room"}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1, 'user_id': 5}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Chat API",
      url: "/v3/api/lambda/realtime/chat",
      successBody: "{'room_id' : 1}",
      successPayload: '{"error": false,"model": [{"message":"hi","user_id":5,"is_image":false,"timestamp":1657562452686,"thread":[]}]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "room_id", "message": "Room is required" }]}'
        },
        {
          name: "403",
          body: "{'room_id' : 1, 'user_id': 5}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "GET",
      name: "Room API",
      url: "/v3/api/lambda/realtime/room",
      queryBody: "{'room_id' : 1}",
      successPayload:
        '{"error": false,"model":{id": 1,"user_id": 1,"other_user_id": 3,"chat_id": 1,"unread": 1,"create_at": "2022-07-07T04:00:00.000Z","update_at": "2022-07-11T11:13:44.000Z","user_update_at": "2022-07-11T11:13:44.000Z","other_user_update_at": "2022-07-11T11:12:56.000Z"}}',
      errors: [
        {
          name: "403",
          queryBody: "",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "room_id", "message": "Room is required" }]}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1}",
          response: '{"error": true,"message": "Room does not exist"}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1}",
          response: '{"error": true,"message": "Invalid room"}'
        },
        {
          name: "403",
          queryBody: "{'room_id' : 1, 'user_id': 5}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "GET",
      name: "Room All API",
      url: "/v3/api/lambda/realtime/room/all",
      queryBody: "{'other_user_id' : 1}",
      successPayload:
        '{"error": false,"list":[{"id": 2,"user_id": 1,"other_user_id": 4,"chat_id": 2,"unread": 1,"create_at": "2022-07-07T04:00:00.000Z","update_at": "2022-07-11T11:13:07.000Z","user_update_at": "2022-07-11T11:13:07.000Z","other_user_update_at": "2022-07-08T21:09:31.000Z"}]}',
      errors: [
        {
          name: "403",
          queryBody: "",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "other_user_id", "message": "Other user is required" }]}'
        },
        {
          name: "403",
          queryBody: "{'other_user_id' : 1}",
          response: '{"error": true,"message": "Room does not exist"}'
        },
        {
          name: "403",
          queryBody: "{'other_user_id' : 5}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "GET",
      name: "My Room API",
      url: "/v3/api/lambda/realtime/room/my",
      successBody: "",
      successPayload:
        '{"error": false,"list":[{"id": 6,"user_id": 1,"other_user_id": 7,"chat_id": -1,"unread": 0,"create_at": "2022-07-07","update_at": "2022-07-11T11:13:35.000Z","user_update_at": "2022-07-11T10:27:00.000Z","other_user_update_at": "2022-07-11T11:13:35.000Z","first_name": "admin","last_name": "seven","email": "adminlibrary7@manaknight.com","photo": null},]}',
      errors: [
        {
          name: "403",
          body: "",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    },
    {
      method: "POST",
      name: "Room API",
      url: "/v3/api/lambda/realtime/room",
      successBody: "{ 'user_id':1, 'other_user_id' : 4}",
      successPayload: '{"room_id": 7, "chat_id": -1}',
      errors: [
        {
          name: "403",
          body: "{ 'other_user_id' : 4}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "user_id", "message": "User is required" }]}'
        },
        {
          name: "403",
          body: "{ 'other_user_id' : 4}}",
          response: '{"error": true,"message": "Invalid Credentials","validation": [{ "field": "other_user_id", "message": "User is required" }]}'
        },
        {
          name: "403",
          body: "{ 'user_id':1, 'other_user_id' : 4}",
          response: '{"error": true,"message": "other error messages"}'
        }
      ],
      needToken: true
    }
  ];
};
