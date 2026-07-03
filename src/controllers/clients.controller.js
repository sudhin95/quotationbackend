const clientsModel = require("../models/clients.model");
const url = require("url");
const moment = require("moment");
// const validatorClass = require("../middleware/validator");
// const functionsClass = require("../middleware/functions");
// const { uploadProfileImg } = require("../middleware/upload");
// const { getexistData, decrypt } = require("../middleware/functions");
// const authMiddleware = require("../middleware/auth");
// const dateTime = require("node-datetime");
// const date = require("date-and-time");
// const functionClass = require("../middleware/functions");
const { Console } = require("console");
const { el } = require("date-fns/locale");

exports.getAllClients = (req, res) => {
  clientsModel.getAllClients(req.params, (err, data) => {
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
        return_message: "Clients List",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};

exports.addClients = (req, res) => {
  clientsModel.addClients(req.body, (err, data) => {
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
        return_message: "Client added successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: [],
      });
    }
  });
};

exports.updateClients = (req, res) => {
  clientsModel.updateClients(req.params.id, req.body, (err, data) => {
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
        return_message: "Client updated successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: [],
      });
    }
  });
};
exports.deleteClients = (req, res) => {
  clientsModel.deleteClients(req.params.id, (err, data) => {
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
        return_message: "Client deleted successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: [],
      });
    }
  });
};

