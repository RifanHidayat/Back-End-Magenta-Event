const model = require("../../model/index");
const controller = {};
const dateFormat = require("dateformat");
const collect = require("collect.js");

controller.manage = async function (req, res) {
  try {
    await model.transactionTB
      .findAll({
        include: [{ model: model.quotationPO }],
        where: {
          connection_table: "add",
          id_pictb: req.params.pictb_id,
        },
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          data: response,
        });
      })
      .catch((error) => {
        res.status(400).json({
          code: 400,
          data: error,
        });
      });
  } catch {}
};

controller.create = async function (req, res) {
  try {
    const amount = req.body.amount;
    const date = req.body.date;
    const description = req.body.description;
    const pictbId = req.body.pictb_id;
    const quotationpoId = req.body.quotationpo_id;
    const connectionTable = "add";
    const connectionId = 0;

    await model.transactionTB
      .create({
        date: dateFormat(date, "yyyy-mm-dd"),
        description: description,
        amount: amount,
        type: "in",
        id_pictb: pictbId,
        quotationPoId: quotationpoId,
        connection_id: connectionId,
        connection_table: connectionTable,
      })
      .then((result) => {
        res.status(200).json({
          code: 200,
          message: "Data has been save",
          data: result,
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      message: e + "",
    });
  }
};

controller.update = async function (req, res) {};
controller.destroy = async function (req, res) {
  try {
    console.log(req.params.id);
    await model.transactionTB
      .destroy({
        where: {
          id: req.params.id,
        },
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          message: "Data has been deleted",
        });
      })
      .catch((error) => {
        res.status(404).json({
          code: 404,
          message: e + "",
        });
      });
  } catch (e) {}
};

controller.show = async function (req, res) {
  try {
    await model.transactionTB
      .findAll()

      .then((response) => {
        if (response.length > 0) {
          res.status(200).json({
            code: 200,
            data: response,
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

controller.balance = async function (req, res) {
  try {
    await model.transactionTB.findAll().then((response) => {
      // let balance = 0;

      res.status(200).json({
        code: 200,
        data: response,
      });
    });
  } catch (e) {
    res.status(200).json({
      message: e + "",
    });
  }
};

controller.transactions = async function (req, res) {
  try {
    await model.transactionTB
      .findAll({
        where: {
          id_pictb: req.params.pictb_id,
          quotationPoId: req.params.quotation_po_id,
        },
      })
      .then((response) => {
        let newRes = [];
        let balance = 0;
        response.map((item) => {
          item.type == "in"
            ? (balance += item.amount)
            : (balance -= item.amount);
          var data = {
            id: item.id,
            date: item.date,
            description: item.description,
            amount: item.amount,
            type: item.type,
            id_pictb: item.id_pictb,
            quotationPoId: item.quotationPoId,
            balance: balance,
          };
          newRes.push(data);
        });

        res.status(200).json({
          code: 200,
          data: newRes,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      message: error,
    });
  }
};

module.exports = controller;
