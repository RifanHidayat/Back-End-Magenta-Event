const model = require("../../model/index");
const controller = {};

controller.manage = async function (req, res) {
  try {
    await model.outTransactions
      .findAll({
        include: [{ model: model.quotationPO }],
        where: { pictb_id_source: req.params.pictb_id },
      })

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

module.exports = controller;
