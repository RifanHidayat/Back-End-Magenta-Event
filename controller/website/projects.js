const model = require("../../model/index");
const { Op, where } = require("sequelize");
const controller = {};

controller.getProjects = async function (req, res) {
  try {
    let limit = parseInt(req.query.record);
    let page = parseInt(req.query.page);
    let start = 0 + page * limit;
    let end = page * limit;
    console.log(limit);
    console.log(page);
    let projects = await model.projects.findAndCountAll({
      limit: limit,
      offset: start,
    });
    let countFiltered = projects.count;
    let pagination = {};
    pagination.totalRow = projects.count;
    pagination.totalPage = Math.ceil(countFiltered / limit);

    if (end < countFiltered) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (start > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.status(200).json({
      code: 200,
      pagination,
      data: projects.rows,
    });

    // await model.projects.findAll({}).then((result) => {
    //   if (result.length > 0) {
    //     res.status(200).json({
    //       code: 200,

    //       data: result,
    //     });
    //   } else {
    //     res.status(200).json({
    //       message: "empty data",
    //       data: [],
    //     });
    //   }
    // });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: `${error}`,
    });
  }
};

controller.closeProjects = async function (req, res) {
  try {
    await model.projects
      .update(
        {
          status: "closed",
        },
        {
          where: {
            id: req.params.id,
          },
        }
      )
      .then((result) => {
        res.status(200).json({
          code: 200,
          message: "Data has been updated",
          data: result,
        });
      });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error + "",
    });
  }
};

module.exports = controller;
