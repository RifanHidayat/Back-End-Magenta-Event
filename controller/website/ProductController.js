const model = require("../../model/index");
const { Op, where } = require("sequelize");
const controller = {};

controller.show = async function (req, res) {
  try {
    await model.products
      .findAll({})
      .then((response) => {
        if (response.length > 0) {
          res.status(200).json({
            code: 200,
            error: false,
            message: "successfully",
            data: response,
          });
        } else {
          res.status(200).json({
            code: 200,
            error: false,

            message: "successfully",
            data: [],
          });
        }
      })
      .catch((e) => {
        res.status(504).json({
          code: 404,
          error: false,
          data: [],
          message: `${e}`,
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};

controller.create = async function (req, res) {
  let code = req.body.code;
  let name = req.body.name;
  let purchase_price = req.body.purchase_price;
  let selling_pirce = req.body.selling_price;
  let stock = req.body.stock;

  try {
    await model.products
      .create({
        code: code,
        name: name,
        purchase_price: purchase_price,
        selling_price: selling_pirce,
        stock: stock,
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been saved",
          data: response,
        });
      })
      .catch((e) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};

controller.update = async function (req, res) {
  let name = req.body.name;
  let purchase_price = req.body.purchase_price;
  let selling_pirce = req.body.selling_price;
  let stock = req.body.stock;

  let id = req.params.id;

  try {
    await model.products
      .update(
        {
          name: name,
          purchase_price: purchase_price,
          selling_price: selling_pirce,
          stock: stock,
        },
        {
          where: { id: id },
        }
      )
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been saved",
          data: response,
        });
      })
      .catch((e) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};

controller.destroy = async function (req, res) {
  try {
    let id = req.params.id;
    await model.products
      .destroy({
        where: { id: id },
      })
      .then((response) => {
        res.status(200).json({
          code: 200,
          error: false,
          message: "Data has been deleted",
          data: response,
        });
      })
      .catch((error) => {
        res.status(404).json({
          code: 404,
          error: true,
          message: `${e}`,
          data: [],
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: true,
      message: `${e}`,
      data: [],
    });
  }
};
controller.detail = async function (req, res) {
  try {
    let id = req.params.id;
    await model.products
      .findAll({
        where: {
          id: id,
        },
      })
      .then((response) => {
        if (response.length > 0) {
          res.status(200).json({
            code: 200,
            error: false,
            message: "successfully",
            data: response[0],
          });
        } else {
          res.status(200).json({
            code: 200,
            error: false,

            message: "successfully",
            data: [],
          });
        }
      })
      .catch((e) => {
        res.status(504).json({
          code: 404,
          error: false,
          data: [],
          message: `${e}`,
        });
      });
  } catch (e) {
    res.status(404).json({
      code: 404,
      error: false,
      data: [],
      message: `${e}`,
    });
  }
};

module.exports = controller;
