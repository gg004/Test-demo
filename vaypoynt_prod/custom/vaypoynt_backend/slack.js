/**
 * So when we save the new lambda, we save the file path to server and we just read this file.
 * Then we trigger reload of server somehow.
 * @param {*} app
 */
 const ProjectMiddleware = require("../../middleware/ProjectMiddleware");
 const UrlMiddleware = require("../../middleware/UrlMiddleware");
 const HostMiddleware = require("../../middleware/HostMiddleware");
 const TokenMiddleware = require("../../middleware/TokenMiddleware");
 const { sqlDateFormat, sqlDateTimeFormat } = require("../../services/UtilService");
 const middlewares = [
    ProjectMiddleware,
    UrlMiddleware,
    HostMiddleware,
    TokenMiddleware()
    // PermissionMiddleware,
    // RateLimitMiddleware,
    // LogMiddleware,
    // UsageMiddleware
    // CheckProjectMiddleware,
    // AnalyticMiddleware,
    // RoleMiddleware
  ];

 const { WebClient } = require("@slack/web-api");
const client = new WebClient();

const axios = require("axios");
let BackendSDK = require("../../core/BackendSDK");
let config = require("../../config");
let sdk = new BackendSDK();
module.exports = function (app) {
  app.get("/v3/api/custom/vaypoynt/slack/callback", async function (req, res) {
    try {
      const response = await client.oauth.v2.access({
        client_id: "4353658102135.4368127139011",
        client_secret: "e46d79082b67b12772a44bdad7ba64dd",
        code: req.query.code
      });

      const identity = await client.users.identity({
        token: response.authed_user.access_token
      });

      // At this point you can assume the user has logged in successfully with their account.
      res
        .status(200)
        .send(
          `<html><body><p>You have successfully logged in with your slack account! Here are the details:</p><p>Response: ${JSON.stringify(
            response
          )}</p><p>Identity: ${JSON.stringify(identity)}</p></body></html>`
        );
    } catch (eek) {
      console.log(eek);
      res.status(500).send(`<html><body><p>Something went wrong!</p><p>${JSON.stringify(eek)}</p>`);
    }
  });

  app.post("/v3/api/custom/vaypoynt/slack", async function (req, res) {
    try {
      let currentDate = new Date();
      currentDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
      console.log(req.body);
      await client.views.open({
        trigger_id: req.body.trigger_id,
        token: "xoxb-4353658102135-4362030422598-TTuxpvtXn59Atvqm1p3nc17R",
        view: {
          title: {
            type: "plain_text",
            text: "Enter Details"
          },
          submit: {
            type: "plain_text",
            text: "Book"
          },
          type: "modal",
          blocks: [
            {
              type: "input",
              element: {
                type: "conversations_select",
                action_id: "conversations_select_action_id",
                default_to_current_conversation: true,
                response_url_enabled: true,
                placeholder: {
                  type: "plain_text",
                  text: "Select a conversation where you want to recieve confirmation",
                  emoji: true
                }
              },
              label: {
                type: "plain_text",
                text: "Conversation",
                emoji: true
              },
              block_id: "conversations_select_block"
            },
            {
              type: "input",
              block_id: "status_type_block",
              element: {
                action_id: "status_type_action_id",
                type: "static_select",
                placeholder: {
                  type: "plain_text",
                  text: "Select type"
                },
                options: [
                  {
                    text: {
                      type: "plain_text",
                      text: "Office"
                    },
                    value: "0"
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "WFH"
                    },
                    value: "1"
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Vacation"
                    },
                    value: "2"
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Holiday"
                    },
                    value: "3"
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Sick Day"
                    },
                    value: "4"
                  },
                  {
                    text: {
                      type: "plain_text",
                      text: "Meeting"
                    },
                    value: "5"
                  }
                ]
              },
              label: {
                type: "plain_text",
                text: "Type",
                emoji: true
              }
            },
            {
              type: "input",
              element: {
                type: "number_input",
                is_decimal_allowed: false,
                action_id: "plain_text_input-action",
                placeholder: {
                  type: "plain_text",
                  text: "Select a floor",
                  emoji: true
                },
                initial_value: "0"
              },

              label: {
                type: "plain_text",
                text: "Floor",
                emoji: true
              },
              block_id: "floor_block"
            },
            {
              type: "input",
              element: {
                type: "number_input",
                is_decimal_allowed: false,
                action_id: "plain_text_input-action",
                placeholder: {
                  type: "plain_text",
                  text: "Select a desk",
                  emoji: true
                },
                initial_value: "0"
              },
              label: {
                type: "plain_text",
                text: "Desk No",
                emoji: true
              },
              block_id: "desk_block"
            },
            {
              type: "input",
              element: {
                type: "datepicker",
                initial_date: currentDate,
                placeholder: {
                  type: "plain_text",
                  text: "Select a date",
                  emoji: true
                },
                action_id: "datepicker-action"
              },
              label: {
                type: "plain_text",
                text: "Start Date",
                emoji: true
              },
              block_id: "date_block"
            },
            {
              type: "input",
              element: {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Select time",
                  emoji: true
                },
                action_id: "timepicker-action"
              },
              label: {
                type: "plain_text",
                text: "Start Time",
                emoji: true
              },
              block_id: "start_block"
            },
            {
              type: "input",
              element: {
                type: "timepicker",
                placeholder: {
                  type: "plain_text",
                  text: "Select time",
                  emoji: true
                },
                action_id: "timepicker-action"
              },
              label: {
                type: "plain_text",
                text: "End Time",
                emoji: true
              },
              block_id: "end_block"
            }
          ]
        }
      });
      res.status(200).send();
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });

  app.post("/v3/api/custom/vaypoynt/slack/interaction", async function (req, res) {
    try {
      res.status(200).send();

      let d = JSON.parse(req.body.payload);

      let desk_data = d.view.state.values;

      sdk.setDatabase(config);
      sdk.setProjectId("vaypoynt");

      let employee = await sdk.rawQuery("SELECT * FROM vaypoynt_employee_profile WHERE slack_username = '" + d.user.username + "'");

      let status_type = parseInt(desk_data.status_type_block["status_type_action_id"]["selected_option"]["value"]);
      let floor = parseInt(desk_data.floor_block["plain_text_input-action"]["value"]);
      let start_time = desk_data.start_block["timepicker-action"]["selected_time"];
      let start_date = desk_data.date_block["datepicker-action"]["selected_date"];
      let end_time = desk_data.end_block["timepicker-action"]["selected_time"];
      let desk_number = parseInt(desk_data.desk_block["plain_text_input-action"]["value"]);
      const [year, month, day] = start_date.split("-");
      let [hh, mm] = start_time.split(":");

      start_time = new Date(+year, +month - 1, +day, +hh + 5, +mm);
      let [hh_end, mm_end] = end_time.split(":");
      end_time = new Date(+year, +month - 1, +day, +hh_end + 5, +mm_end);

      let info = {};
      if (status_type == 0) {
        if (desk_number == 0 || floor == 0) {
          axios.post(d.response_urls[0].response_url, {
            text: "Please choose a valid Floor and Desk number."
          });
          return;
        }
        info = {
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          floor: floor,
          start_time: sqlDateTimeFormat(start_time),
          end_time: sqlDateTimeFormat(end_time),
          desk_number: desk_number,
          status_type: 0,
          user_id: employee[0]["user_id"],
          company_id: employee[0]["company_id"],
          department_id: employee[0]["department_id"]
        };

        let desk_tickets = await sdk.rawQuery(
          `SELECT COUNT(vaypoynt_desk_ticket.start) as count_start, vaypoynt_desk_ticket.end as end FROM vaypoynt_desk_ticket Left JOIN vaypoynt_company_profile ON vaypoynt_desk_ticket.user_id=vaypoynt_company_profile.user_id WHERE vaypoynt_company_profile.id=${employee[0].company_id} and floor=${floor} and status=1 and ${desk_number} BETWEEN vaypoynt_desk_ticket.start AND vaypoynt_desk_ticket.end`
        );
        if (desk_tickets[0].count_start < 1) {
          axios.post(d.response_urls[0].response_url, {
            text: "Desk or Floor not available. Please try again"
          });
          return;
        }
        let r = await sdk.rawQuery(
          `SELECT COUNT(*) as count_desk_hotelling FROM vaypoynt_desk_hotelling WHERE company_id=${employee[0].company_id} and department_id=${
            employee[0].department_id
          } and desk_number=${desk_number} and '${sqlDateTimeFormat(start_time)}' BETWEEN start_time AND end_time`
        );

        if (r[0].count_desk_hotelling > 0) {
          axios.post(d.response_urls[0].response_url, {
            text: "Desk not available on this timing. Please try again"
          });
          return;
        }
      } else {
        info = {
          create_at: sqlDateFormat(new Date()),
          update_at: sqlDateTimeFormat(new Date()),
          floor: null,
          start_time: sqlDateTimeFormat(start_time),
          end_time: sqlDateTimeFormat(end_time),
          desk_number: null,
          status_type: status_type,
          user_id: employee[0]["user_id"],
          company_id: employee[0]["company_id"],
          department_id: employee[0]["department_id"]
        };
      }

      sdk.setTable("desk_hotelling");
      await sdk.insert(info);
      axios.post(d.response_urls[0].response_url, {
        text: "Your booking is scheduled."
      });
      return;
    } catch (err) {
      console.error(err);
      res.status(404);
      res.json({
        error: true,
        message: err.message
      });
    }
  });
};
