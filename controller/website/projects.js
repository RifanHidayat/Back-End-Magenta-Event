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

controller.createProject = async function (req, res) {
  var projectNumber = req.body.project_number;
  let projectCreatedDate = req.body.project_created_date;
  var projectStartDate = req.body.project_start_date;
  var projectEndDate = req.body.project_end_date;
  var eventCustomer = req.body.event_customer;
  var eventPic = req.body.event_pic;
  var description = req.body.description;
  var latitude = req.body.latitude;
  var longitude = req.body.longtitude;
  var grandTotal = req.body.total_project_cost;
  var QuotationId = req.body.id_quotation;
  var quotationNumber = req.body.quotation_number;
  var status = req.body.status;
  var location = req.body.location;
  var quotations = req.body.quotations;
  console.log(quotationNumber);
  let projects = await model.projects
    .create({
      project_number: projectNumber,
      project_created_date: projectCreatedDate,
      project_start_date: projectStartDate,
      project_end_date: projectEndDate,
      event_customer: eventCustomer,
      event_pic: eventPic,
      description: description,
      latitude: latitude,
      longitude: longitude,
      grand_total: grandTotal,
      id_quotation: QuotationId.toString(),
      quotation_number: quotationNumber,
      status: status,
      location: location,
    })
    .then((response) => {
      console.log(response.id);
      console.log(quotations);
      //transaction project
      model.projectTransactions
        .create({
          date: projectCreatedDate,
          description: description,
          amount: grandTotal,
          type: "in",
          project_id: response.id,
          connection_id: response.id,
          connection_table: response.connection_table,
        })
        .then((responseTransaction) => {
          s;
          res.status(200).json({
            code: 200,
            message: "Data has been save",
          });
        })
        .catch((error) => {});
    })
    .catch((e) => {
      res.status(404).json({
        code: 404,
        messahe: `${e}`,
      });
    });
  try {
  } catch {}

  //console.log("tes", projects.id);
};

controller.createProjectMetaprint = async function (req, res) {
  var projectNumber = req.body.project_number;
  let projectCreatedDate = req.body.project_created_date;
  var projectStartDate = req.body.project_start_date;
  var projectEndDate = req.body.project_end_date;
  var eventCustomer = req.body.event_customer;
  var eventPic = req.body.event_pic;
  var description = req.body.description;
  var latitude = req.body.latitude;
  var longitude = req.body.longtitude;
  var grandTotal = req.body.total_project_cost;
  var QuotationId = req.body.id_quotation;
  var quotationNumber = req.body.quotation_number;
  var status = req.body.status;
  var location = req.body.location;
  var quotations = req.body.quotations;
  console.log(quotationNumber);
  let projects = await model.projects
    .create({
      project_number: projectNumber,
      project_created_date: projectCreatedDate,
      project_start_date: projectStartDate,
      project_end_date: projectEndDate,
      event_customer: eventCustomer,
      event_pic: eventPic,
      description: description,
      latitude: latitude,
      longitude: longitude,
      grand_total: grandTotal,
      id_quotation: QuotationId.toString(),
      quotation_number: quotationNumber,
      status: status,
      location: location,
    })
    .then((response) => {
      console.log(response.id);
      console.log(quotations);
      //transaction project
      model.projectTransactions
        .create({
          date: projectCreatedDate,
          description: description,
          amount: grandTotal,
          type: "in",
          project_id: response.id,
          connection_id: response.id,
          connection_table: response.connection_table,
        })
        .then((responseTransaction) => {
          s;
          res.status(200).json({
            code: 200,
            message: "Data has been save",
          });
        })
        .catch((error) => {});
    })
    .catch((e) => {
      res.status(404).json({
        code: 404,
        messahe: `${e}`,
      });
    });
  try {
  } catch {}

  //console.log("tes", projects.id);
};

module.exports = controller;
