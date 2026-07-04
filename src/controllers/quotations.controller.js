const quotationsModel = require("../models/quotations.model");
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

exports.getAllQuotations = (req, res) => {
  quotationsModel.getAllQuotations(req.params, (err, data) => {
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
        return_message: "Quotations List",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};
exports.addQuotations = (req, res) => {
  quotationsModel.addQuotations(req.body, (err, data) => {
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
        return_message: "Quotation added successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: [],
      });
    }
  });
};
exports.updateQuotations = (req, res) => {
  quotationsModel.updateQuotations(req.params.id, req.body, (err, data) => {
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
        return_message: "Quotation updated successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: [],
      });
    }
  });
};

exports.getQuotationsById = (req, res) => {
  quotationsModel.getQuotationsById(req.params.id, (err, data) => {
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
        return_message: "Quotation details retrieved successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};
exports.deleteQuotations = (req, res) => {
  quotationsModel.deleteQuotations(req.params.id, (err, data) => {
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
        return_message: "Quotation deleted successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: [],
      });
    }
  });
};
exports.getAllQuotationItems = (req, res) => {
  quotationsModel.getAllQuotationItems(req.params.id, (err, data) => {
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
        return_message: "Quotation items retrieved successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};
exports.generateQuotationDraft = (req, res) => {
  console.log("req.body", req.body);
  quotationsModel.generateQuotationDraft(req.body, (err, data) => {
    if (err) {
      var dataResp = {
        return_status: true,
        return_code: 55332,
        return_message:
          err.message || "Some error occurred while retrieving Support.",
      };
      res.status(err.status).send({
        header: dataResp,
        body: [],
      });
    } else {
      let dataResp = {
        return_status: true,
        return_code: 55333,
        return_message: "Quotation items retrieved successfully",
      };
      res.status(200).send({
        header: dataResp,
        body: data,
      });
    }
  });
};


