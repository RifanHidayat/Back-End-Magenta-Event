const model = require("../../model/index");
const { Op } = require("sequelize");
const controller = {};

var AWS = require("aws-sdk");
const dateFormat = require("dateformat");
require("dotenv/config");

AWS.config.update({ region: "ap-southeast-1" });
const fs = require("fs");
const uuid = require("uuid");

const { urlToHttpOptions } = require("url");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

controller.create = async function (req, res) {
  try {
    var path = "";
    if (
      req.body.image == null ||
      req.body.image == "" ||
      req.body.image == "null"
    ) {
    } else {
      const image = `data:image/png;base64,${req.body.image}`;

      const base64Data = new Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      const type = image.split(";")[0].split("/")[1];
      const timestamp = new Date().getTime();
      path = `${timestamp}_transaction_mobile.${type}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `eo/transactions/${path}`,
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64", // required
        ContentType: `image/${type}`,
      };

      try {
        await s3.upload(params).promise();
      } catch (error) {
        console.log(error);
      }
    }
    await model.transaction_project
      .create({
        date: dateFormat(req.body.date, "yyyy-mm-dd"),
        amount: req.body.amount,
        description: req.body.description,
        image: req.body.image != null ? path : "",
        type: "out",
        status: req.body.status,
        account_id: req.body.account_id,
        project_id: req.body.project_id,
      })
      .then((result) => {
        if (req.body.status == "approved") {
          try {
            // console.log(result.id)
            model.transaction_project_lr
              .create({
                date: req.body.date,
                amount: req.body.amount,
                description: req.body.description,
                project_id: req.body.project_id,
                type: "out",
                connection_id: result.id,
                connection_table: "budget_transaction_project",
              })
              .then((result) => {
                res.status(200).json({
                  code: 200,
                  message: "Data has been save",
                  data: result,
                });
              });
            // // console.log(result.id)
            //  let transaction_id=`${result.id}_${req.body.project_number}`
            //  model.accounts.create({
            //      date:req.body.date,
            //      amount:req.body.amount,
            //      description:`${req.body.project_number}/${req.body.description}`,
            //      image:req.body.image,
            //      type:'in',
            //      transaction_id:transaction_id,
            //      account_id:req.body.account_id
            //  })
            //  .then((result)=>{
            //      res.status(200).json({
            //      code:200,
            //      message:"Data has been save",
            //      data:result
            //  })
            //  })
          } catch (error) {
            res.status(404).json({
              code: 404,
              message: error + "",
            });
          }
        } else {
          res.status(200).json({
            code: 200,
            message: "Data has been save",
            data: result,
          });
        }
      });
  } catch (error) {
    console.log(process.env.AWS_BUCKET_NAME);
    console.log(process.env.AWS_ID);
    console.log(process.env.AWS_SECRET);
    console.log(error);
    res.status(404).json({
      code: 404,
      message: error + "",
    });
  }
};

controller.delete = async function (req, res) {
  try {
    await model.transaction_project
      .destroy({
        where: {
          id: req.params.id,
        },
      })
      .then((result) => {
        try {
          model.accounts
            .destroy({
              where: {
                transaction_id: `${req.params.id}_${req.params.project_number}`,
              },
            })
            .then((result) => {
              res.status(200).json({
                code: 200,
                message: "Data has been deleted",
              });
            });
        } catch (error) {
          res.status(404).json({
            code: 404,
            message: error,
          });
        }
      });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error,
    });
  }
};

controller.update = async function (req, res) {
  try {
    var path = req.body.path;

    if (
      req.body.image == null ||
      req.body.image == "" ||
      req.body.image == "null"
    ) {
    } else {
      const image = `data:image/png;base64,${req.body.image}`;
      console.log("masuk sini", req.body.image);
      const base64Data = new Buffer.from(
        image.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );

      const type = image.split(";")[0].split("/")[1];

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `eo/transactions/${path}`,
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64", // required
        ContentType: `image/${type}`,
      };

      try {
        await s3.upload(params).promise();
      } catch (error) {
        console.log(error);
      }
    }

    await model.transaction_project
      .update(
        {
          date: req.body.date,
          amount: req.body.amount,
          description: req.body.description,
          image: path,
          type: "out",
          status: req.body.status,
          account_id: req.body.account_id,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      )
      .then((result) => {
        //transaction_id =id_project_number

        if (req.body.status != "pending") {
          try {
            // console.log(result.id)
            let transaction_id = `${req.params.id}_${req.body.project_number}`;
            model.accounts
              .update(
                {
                  date: req.body.date,
                  amount: req.body.amount,
                  description: `${req.body.project_number}/${req.body.description}`,
                  image: req.body.image,
                  type: "in",
                  account_id: req.body.account_id,
                },
                {
                  where: {
                    transaction_id: transaction_id,
                  },
                }
              )
              .then((result) => {
                res.status(200).json({
                  code: 200,
                  message: "Data has been save",
                  data: result,
                });
              });
          } catch (error) {
            res.status(404).json({
              code: 404,
              message: error + "",
            });
          }
        } else {
          res.status(200).json({
            code: 200,
            message: "Data has been save",
            data: result,
          });
        }
      });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error + "",
    });
  }
};

controller.approval = async function (req, res) {
  try {
    await model.transaction_project
      .update(
        {
          status: req.body.status,
        },
        {
          where: {
            id: req.params.id,
          },
        }
      )
      .then((result) => {
        console.log(req.params.id);
        try {
          // console.log(result.id)
          let transaction_id = `${req.params.id}_${req.body.project_number}`;
          model.accounts
            .create({
              date: req.body.date,
              amount: req.body.amount,
              description: `${req.body.project_number}/${req.body.description}`,
              image: req.body.image,
              type: "in",
              account_id: req.body.account_id,
              transaction_id: transaction_id,
            })
            .then((result) => {
              res.status(200).json({
                code: 200,
                message: "Data has been save",
                data: result,
              });
            });
        } catch (error) {
          res.status(404).json({
            code: 404,
            message: error + "",
          });
        }
      });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error + "",
    });
  }
};

module.exports = controller;
