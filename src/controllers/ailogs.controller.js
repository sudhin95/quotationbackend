const AILogsModel = require("../models/ailogs.model");
const url = require("url");
const moment = require("moment");
const { Console } = require("console");
const { el } = require("date-fns/locale");

exports.getAllAILogs = (req, res) => {
  AILogsModel.getAllAILogs(req.params, (err, data) => {
    if (err) {
      let dataResp = {
        return_status: true,
        return_code: 55332,
        return_message:
          err.message || "Some error occurred while retrieving Support.",
      };
      res.status(500).send({
        header: dataResp,
        body: [],
      });
    } else {
      let dataResp = {
        return_status: true,
        return_code: 55333,
        return_message: "AILogs List",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};