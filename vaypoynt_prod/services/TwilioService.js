const config = require("../config");
const accountSid = config.twilio.account_sid;
const authToken = config.twilio.auth_token;
const client = require("twilio")(accountSid, authToken);
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const twilioApiKey = config.twilio_client.account_sid;
const twilioApiSecret = config.twilio_client.secret_key;

/**
 * twilio service
 */
module.exports = {
  async createAccessToken(obj) {
    try {
      const identity = obj.user ? obj.user : "user";
      const videoGrant = new VideoGrant({
        room: obj.room ? obj.room : "meeting room",
      });
      const token = new AccessToken(accountSid, twilioApiKey, twilioApiSecret, {
        identity: identity,
      });
      token.addGrant(videoGrant);
      return {
        error: false,
        message: "OK",
        data: token.toJwt(),
      };
    } catch (err) {
      return {
        error: true,
        message: err,
      };
    }
  },
  async createRoom(obj) {
    // obj = {
    //   uniqueName: "DailyStandup",
    //  or
    // recordParticipantsOnConnect: true,
    // statusCallback: 'http://example.org',
    // type: 'group',
    // uniqueName: 'DailyStandup'
    // or
    //  audioOnly: true,
    // type: 'group' || 'go'
    // or
    // emptyRoomTimeout: 60       default is min, so 60 min
    //
    //};
    try {
      const room = await client.video.rooms.create(obj);
      console.log(room);
      //.then(room => console.log(room.sid));
      return {
        error: false,
        message: "OK",
        data: room,
      };
    } catch (error) {
      return {
        error: true,
        message: "Something went wrong",
      };
    }
  },
  async fetchAllRooms(obj) {
    try {
      const rooms = await client.video.rooms.list({
        status: "completed",
        limit: 20,
      });
      //          .then(rooms => rooms.forEach(r => console.log(r.sid)));
      return {
        error: false,
        message: "OK",
        data: rooms,
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  },
  async fetchRoomBySid(obj) {
    try {
      const room = await client.video.rooms(obj.sid).fetch();
      //          .then(rooms => rooms.forEach(r => console.log(r.sid)));
      return {
        error: false,
        message: "OK",
        data: room,
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  },
  async fetchRoomByName(obj) {
    try {
      const room = await client.video.rooms(obj.name).fetch();
      //          .then(rooms => rooms.forEach(r => console.log(r.sid)));
      return {
        error: false,
        message: "OK",
        data: room,
      };
    } catch (error) {
      return {
        error: true,
        message: error.message,
      };
    }
  },
  async fetchActiveRooms(obj) {
    try {
      return {
        error: false,
        message: "OK",
      };
    } catch (error) {
      return {
        error: true,
        message: "Something went wrong",
      };
    }
  },
  async endRoom(obj) {
    try {
      const room = awaitclient.video
        .rooms(obj.sid)
        .update({ status: "completed" });

      //  .then(room => console.log(room.uniqueName));
      console.log(room);
      return {
        error: false,
        message: "OK",
        data: room,
      };
    } catch (error) {
      return {
        error: true,
        message: "Something went wrong",
      };
    }
  },
};
