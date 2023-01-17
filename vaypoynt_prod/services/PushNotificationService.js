const config = require('../config');
const serverKey = config.firebaseServerKey
const Fcm = require("fcm-node");
const { sqlDateFormat, sqlDateTimeFormat, notifDate } = require("./UtilService");
const fcm = new Fcm(serverKey);

module.exports = {

	sendNotification : async function (fcmToken, topic, message) {
		try{
			fcm.send({
				to: fcmToken,
				notification: {
				  title: topic,
				  body: message,
				  priority: "high",
				  content_available: true
				}
			}, async (err, res)=>{
				if (err) {
					console.error(err);
				} else {
					console.log('*** Push Notification Response: ', res);
				}
			})
			return true;
		} catch(err) {
			console.error(err);
			return err.message;
		}
	}
}