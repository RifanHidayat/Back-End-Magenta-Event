const model = require("../../model/index");
const controller = {};
const dateFormat = require("dateformat");

const CJClient = require("node-collection-json");
var List = require("collections/list");
controller.show = async function (req, res) {
  try {
    await model.quotationPO
      .findAll()

      .then((response) => {
        var dataQuotationPO = [];
        response.map((item, index) => {
          var data = {
            value: item["id"],
            label: item["code"],
            amount: item["amount"],
          };
          dataQuotationPO.push(data);
        });

        if (response.length > 0) {
          res.status(200).json({
            code: 200,
            data: dataQuotationPO,
          });
        } else {
          res.status(200).json({
            message: "empty data",
            data: [],
          });
        }
      });
  } catch (e) {
    res.status(200).json({
      message: e + "",
    });
  }
};

controller.transactions = async function (req, res) {
  var totalin;
  var totalOut;
  var totalbalance;

  try {
    await model.quotationPO
      .findAll({
        include: [
          { model: model.transactionTB, where: { id_pictb: req.params.id } },
        ],
      })
      .then((response) => {
        // response.forEach((item) => {
        //   item["balance"] = 0;
        // });

        res.status(200).json({
          code: 200,
          data: response,
        });
      })
      .catch((error) => {
        res.status(404).json({
          code: 404,
          message: error,
        });
      });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error,
    });
  }
};

controller.balance = async function (req, res) {
  try {
    await model.transactionTB
      .findAll({
        where: {
          quotationPoId: req.params.quotation_po_id,
          id_pictb: req.params.pictb_id,
        },
      })

      .then((response) => {
        var balance = response.reduce(
          (a, b) => (b.type == "in" ? a + b.amount : a - b.amount),
          0
        );

        res.status(200).json({
          code: 200,
          data: balance,
        });
      });
  } catch (error) {
    res.status(404).json({
      code: 404,
      data: error,
    });
  }
};

controller.detail = async function (req, res) {
  try {
    await model.quotationPO
      .findAll({
        where: { id: req.params.id },
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          data: response,
        });
      })
      .catch((error) => {});
  } catch (error) {}
};

module.exports = controller;
