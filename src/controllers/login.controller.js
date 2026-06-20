const loginModel = require("../models/login.model");
const url = require("url");
const moment = require("moment");
const jwt = require("jsonwebtoken");
// const validatorClass = require("../middleware/validator");
// const functionsClass = require("../middleware/functions");
// const { uploadProfileImg } = require("../middleware/upload");
// const { getexistData, decrypt } = require("../middleware/functions");
// const authMiddleware = require("../middleware/auth");
// const dateTime = require("node-datetime");
// const date = require("date-and-time");
// const functionClass = require("../middleware/functions");
const { Console } = require("console");

exports.getLoginUser = (req, res) => {

    let resp = {
        username: req.body.username,
        password: req.body.password,
    };
  
  loginModel.checkUserValid(resp,(err,data)=>{

      if (err || data.length == 0) {
        if (err.kind === "not_found") {

            let dataResp = {
                return_status: false,
                return_code: 56301,
                return_message:
                err.message || `Not found user with this username or password`,
            };
            res.status(404).send({ header: dataResp, body: [] });
          // res.status(404).send({
          //   message: "Not found user with this username or password",
          // });
        } else {
          res.status(500).send({
            message: err,
          });
        }
      }else{
        
            let token = jwt.sign(resp, "BLS2026", { expiresIn: 86400 });

            let dataTokenUpdatearr = {
                iUserId: data.user_id,
                sUserName: req.body.username,
                sToken: token,
            };
            loginModel.updateLoginSession(dataTokenUpdatearr, (err, dataResp) => {
            if (err) {
            let dataResp = {
                return_status: false,
                return_code: 56301,
                return_message:
                err.message || `Some error occurred while retrieving content.`,
            };
            res.status(500).send({ header: dataResp, body: [] });
            } else {
                let dataNew = {
                        return_status: true,
                        return_code: 123,
                        return_message: "success",
                        return_data: data,
                        auth_token: token,
                        };
                    res.status(200).send({ header: dataNew, body: dataNew });
                    }
            });

         }

    })

};

exports.getSideMenus = (req, res) => {
  loginModel.getAllSideMenus(req.params, (err, data) => {
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
        return_message: "Side Menu List",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};

