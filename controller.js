"user strict";

var response = require("./response");
var connection = require("./connection");
var connection_hrd = require("./connection_hrd");
const conn = require("./connection");
var dateFormat = require("dateformat");
const faktur = require("./model/website/faktur");

exports.index = function (req, res) {
  response.ok("aplikasi berjalan", res);
};
//SELECT * FROM quotations JOIN projects ON quotations.id NOT IN (projects.id_quotation)
//show data quotation
exports.getAllDataQuotations = function (req, res) {
  connection.query(
    "SELECT * FROM projects",
    function (error, projects, fields) {
      if (error) {
        console.log(error);
      } else {
        if (projects.length <= 0) {
          connection.query(
            "SELECT * FROM quotations  WHERE status=?",
            ["Final"],
            function (error, rows, fields) {
              if (error) {
                console.log(error);
              } else {
                response.ok(rows, res);
              }
            }
          );
        } else {
          // SELECT  * ,quotations.id as id, quotations.quotation_number,quotations.grand_total as grand_total,projects.status as project_status FROM quotations LEFT JOIN projects ON quotations.id IN (projects.id_quotation) where quotations.status=? AND (projects.status=? OR projects.status is null)",["Final","rejected
          connection.query(
            "SELECT * ,quotations.id as id, quotations.grand_total as grand_total, quotations.quotation_number  as quotation_number FROM quotations LEFT JOIN projects ON projects.id=quotations.project_id WHERE quotations.status='Final' AND (project_number is null OR projects.status !='approved')",
            function (error, rows, fields) {
              if (error) {
                console.log(error);
              } else {
                rows.map((value) => {});
                response.ok(rows, res);
              }
            }
          );
        }
        // response.ok(rows,res)
      }
    }
  );
};

//show data project
exports.getAllDataProjects = async function (req, res) {
  let data_projects = [];
  connection.query(
    "SELECT * FROM projects ORDER BY id DESC",
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //response.ok(rows,res)
        rows.map((value, index) => {
          connection.query(
            "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out from budget_transaction_project where project_id=? AND (budget_transaction_project.status is null OR status!='pending')",
            [value.id],
            function (error, budget_project, fields) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "SELECT COUNT (*) as total FROM budget_transaction_project where project_id=? AND status=? ",
                  [value.id, "pending"],
                  function (error, total_pending) {
                    if (error) {
                      console.log(error);
                    } else {
                      connection.query(
                        "SELECT COUNT(*) as total_task_completed FROM tasks where status=? AND project_id=?",
                        ["completed", value.id],
                        function (error, total_task) {
                          if (error) {
                            console.log(error);
                          } else {
                            connection.query(
                              "SELECT *  FROM tasks where project_id=?",
                              [value.id],
                              function (error, tasks, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  var budget = {
                                    total_in: budget_project[0].total_in,
                                    balance:
                                      budget_project.length <= 0
                                        ? null
                                        : budget_project[0].total_in -
                                          budget_project[0].total_out,
                                    total_out: budget_project[0].total_out,
                                    status_pending: total_pending[0].total,
                                  };

                                  var data = {
                                    id: value.id,
                                    project_number: value.project_number,
                                    quotation_number: value.quotation_number,
                                    project_created_date:
                                      value.project_created_date,
                                    project_start_date:
                                      value.project_start_date,
                                    project_end_date: value.project_end_date,
                                    event_customer: value.event_customer,
                                    event_pic: value.event_pic,
                                    description: value.description,
                                    longtitude: value.longtitude,
                                    latitude: value.latitude,
                                    grand_total: value.grand_total,
                                    status: value.status,
                                    total_task_completed:
                                      total_task[0].total_task_completed,
                                    total_all_task: tasks.length,
                                    members: JSON.parse(value.members),
                                    budget: budget,
                                    task: tasks,
                                  };
                                  data_projects.push(data);
                                  if (index + 1 >= rows.length) {
                                    response.ok(data_projects, res);
                                  }
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        });
      }
      // response.ok(data_projects,res)
    }
  );
};

//show data project
exports.getAllDataProjectsByEmployees = async function (req, res) {
  let data_projects = [];
  const status = req.params.status;
  const employee_id = req.params.employee_id;

  let limit = parseInt(req.query.record) || 5;
  let page = parseInt(req.query.page) || 1;
  let start = 0 + (page - 1) * limit;
  let end = page * limit;

  connection.query(
    "SELECT * ,member_project.status as status_member,projects.status as status,projects.id as id  FROM projects JOIN member_project ON member_project.project_id=projects.id WHERE projects.status=? AND employee_id IN (?) ORDER BY projects.id DESC LiMIT ? OFFSET ?",
    [status, employee_id, limit, start],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        if (rows.length > 0) {
          //response.ok(rows,res)
          rows.map((value, index) => {
            connection.query(
              "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out from budget_transaction_project where project_id=?",
              [value.id],
              function (error, budget_project, fields) {
                if (error) {
                  console.log(error);
                } else {
                  connection.query(
                    "SELECT COUNT(*) as total_task_completed FROM tasks where status=? AND project_id=?",
                    ["completed", value.id],
                    function (error, total_task) {
                      if (error) {
                        console.log(error);
                      } else {
                        connection.query(
                          "SELECT *  FROM tasks where project_id=?",
                          [value.id],
                          function (error, tasks, fields) {
                            if (error) {
                              console.log(error);
                            } else {
                              var budget = {
                                total_in: budget_project[0].total_in,
                                balance:
                                  budget_project.length <= 0
                                    ? null
                                    : budget_project[0].total_in -
                                      budget_project[0].total_out,
                                total_out: budget_project[0].total_out,
                              };

                              var data = {
                                id: value.id,
                                project_number: value.project_number,
                                quotation_number: value.quotation_number,
                                project_created_date:
                                  value.project_created_date,
                                project_start_date: value.project_start_date,
                                project_end_date: value.project_end_date,
                                event_customer: value.event_customer,
                                event_pic: value.event_pic,
                                description: value.description,
                                longtitude: value.longtitude,
                                latitude: value.latitude,
                                grand_total: value.grand_total,
                                status: value.status,
                                total_task_completed:
                                  total_task[0].total_task_completed,
                                total_all_task: tasks.length,
                                members: JSON.parse(value.members),
                                budget: budget,
                                task: tasks,
                                status: value.status,
                              };
                              data_projects.push(data);
                              if (index + 1 >= rows.length) {
                                response.ok(data_projects, res);
                              }
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          });
        } else {
          response.ok(rows, res);
        }
      }
      // response.ok(data_projects,res)
    }
  );
};

exports.getAllDataProjectsStatus = function (req, res) {
  var status = req.params.status;
  connection.query(
    "SELECT * FROM projects where status=? ORDER BY id DESC ",
    [status],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

//insert data  projects
exports.createDataProjects = function (req, res) {
  var project_number = req.body.project_number;
  let project_created_date = req.body.project_created_date;
  var project_start_date = req.body.project_start_date;
  var project_end_date = req.body.project_end_date;
  var event_customer = req.body.event_customer;
  var event_pic = req.body.event_pic;
  var description = req.body.description;
  var latitude = req.body.latitude;
  var longitude = req.body.longtitude;
  var grand_total = req.body.total_project_cost;
  var id_quotation = req.body.id_quotation;
  var quotation_number = req.body.quotation_number;
  var status = req.body.status;
  var quotations = req.body.quotations;
  console.log(id_quotation);

  connection.query(
    "INSERT INTO projects(project_number,project_created_date,project_start_date,project_end_date,event_customer,  event_pic,description,latitude,longtitude,grand_total,id_quotation,quotation_number,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      project_number,
      project_created_date,
      project_start_date,
      project_end_date,
      event_customer,
      event_pic,
      description,
      latitude,
      longitude,
      grand_total,
      id_quotation.toString(),
      quotation_number,
      status,
    ],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been saved", res);
        // var id=rows['insertId'];
        // id_quotation.map((value,index)=>{
        //     connection.query("UPDATE quotations SET project_id=? WHERE id=?",[id,value],function(error,rows){

        //         if (error){
        //             console.log(error)

        //         }else{
        //             if (index+1>=id_quotation.length){
        //                 response.ok("Data has been saved",res);

        //             }

        //         }

        //     })
        //    })
      }
    }
  );
};

//delete project by id
exports.deleteProject = function (req, res) {
  var id = req.params.id;
  connection.query(
    "DELETE FROM projects WHERE id=?",
    [id],
    (error, rows, fields) => {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "DELETE FROM budget_project WHERE project_id=?",
          [id],
          (error, rows, fields) => {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "DELETE FROM budget_transaction_project WHERE project_id=?",
                [id],
                (error, rows, fields) => {
                  if (error) {
                    console.log(error);
                  } else {
                    connection.query(
                      "DELETE FROM tasks WHERE project_id=?",
                      [id],
                      (error, rows, fields) => {
                        if (error) {
                          console.log(error);
                        } else {
                          response.ok("Data has been deleted", res);
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getDetailProject = function (req, res) {
  var id = req.params.id;
  var data;
  var data_tranasctions = [];
  connection.query(
    "SELECT * FROM projects where id=? ",
    [id],
    (error, rows, fields) => {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          `SELECT * FROM quotations WHERE id IN (${rows[0]["id_quotation"]})`,
          (error, quotations, fields) => {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "SELECT * FROM budget_project JOIN budget_transaction_project ON budget_project.project_id=budget_transaction_project.project_id where budget_project.project_id=?",
                [id],
                function (error, budgets, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    connection.query(
                      "SELECT * FROM budget_transaction_project where project_id=?",
                      [id],
                      function (error, transaction_project, fields) {
                        if (error) {
                        } else {
                          connection.query(
                            "SELECT * FROM tasks where project_id=?",
                            [id],
                            function (error, tasks, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                if (budgets.length > 0) {
                                  connection.query(
                                    "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out from budget_transaction_project where project_id=?",
                                    [id],
                                    function (error, total) {
                                      if (error) {
                                      } else {
                                        transaction_project.map(
                                          (values, index) => {
                                            connection_hrd.query(
                                              "SELECT * FROM bank_accounts where id=?",
                                              [values.account_id],
                                              function (
                                                error,
                                                accounts,
                                                fields
                                              ) {
                                                if (error) {
                                                  console.log(error);
                                                } else {
                                                  data = {
                                                    id: values.id,
                                                    date: values.date,
                                                    amount: values.amount,
                                                    description:
                                                      values.description,
                                                    type: values.type,
                                                    account_id:
                                                      values.account_id,
                                                    project_id:
                                                      values.project_id,
                                                    account: accounts[0],
                                                  };
                                                  data_tranasctions.push(data);
                                                  if (
                                                    index + 1 >=
                                                    budgets.length
                                                  ) {
                                                    var budget = {
                                                      budget_start_date:
                                                        budgets[0][
                                                          "budget_start_date"
                                                        ],
                                                      budget_end_date:
                                                        budgets[0][
                                                          "budget_end_date"
                                                        ],
                                                      opening_balance:
                                                        budgets[0][
                                                          "opening_balance"
                                                        ],
                                                      total_in:
                                                        total[0].total_in,
                                                      total_out:
                                                        total[0].total_out,
                                                      balance:
                                                        total[0].total_in -
                                                        total[0].total_out,

                                                      transactions:
                                                        data_tranasctions,
                                                    };
                                                    //query get budget
                                                    var data = {
                                                      id: rows[0]["id"],
                                                      id_quotation:
                                                        rows[0]["id_quotation"],
                                                      project_number:
                                                        rows[0][
                                                          "project_number"
                                                        ],
                                                      quotation_number:
                                                        rows[0][
                                                          "quotation_number"
                                                        ],
                                                      project_created_date:
                                                        rows[0][
                                                          "project_created_date"
                                                        ],
                                                      project_start_date:
                                                        rows[0][
                                                          "project_start_date"
                                                        ],
                                                      project_end_date:
                                                        rows[0][
                                                          "project_end_date"
                                                        ],
                                                      event_customer:
                                                        rows[0][
                                                          "event_customer"
                                                        ],
                                                      event_pic:
                                                        rows[0]["event_pic"],
                                                      latitude:
                                                        rows[0]["latitude"],
                                                      longtitude:
                                                        rows[0]["longtitude"],
                                                      description:
                                                        rows[0]["description"],
                                                      total_project_cost:
                                                        rows[0]["grand_total"],
                                                      members: JSON.parse(
                                                        rows[0]["members"]
                                                      ),
                                                      status: rows[0]["status"],
                                                      budget: budget,
                                                      tasks: tasks,
                                                      quotations: quotations,
                                                    };
                                                    response.ok(data, res);
                                                  }
                                                }
                                              }
                                            );
                                          }
                                        );
                                      }
                                    }
                                  );
                                } else {
                                  // if (budgets.length>=0){

                                  //query get budget
                                  var data = {
                                    id: rows[0]["id"],
                                    id_quotation: rows[0]["id_quotation"],
                                    project_number: rows[0]["project_number"],
                                    quotation_number:
                                      rows[0]["quotation_number"],
                                    project_created_date:
                                      rows[0]["project_created_date"],
                                    project_start_date:
                                      rows[0]["project_start_date"],
                                    project_end_date:
                                      rows[0]["project_end_date"],
                                    event_customer: rows[0]["event_customer"],
                                    event_pic: rows[0]["event_pic"],
                                    latitude: rows[0]["latitude"],
                                    longtitude: rows[0]["longtitude"],
                                    description: rows[0]["description"],
                                    total_project_cost: rows[0]["grand_total"],
                                    members: JSON.parse(rows[0]["members"]),
                                    status: rows[0]["status"],
                                    budget: budgets,
                                    tasks: tasks,
                                    quotations: quotations,
                                  };
                                  response.ok(data, res);

                                  //}
                                }
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getDetailProjectMobile = function (req, res) {
  var id = req.params.id;
  var data;
  var data_tranasctions = [];
  connection.query(
    "SELECT *, member_project.status as  status_member,projects.status as status ,projects.id as id FROM projects JOIN member_project ON projects.id=member_project.project_id where projects.id=? ",
    [id],
    (error, rows, fields) => {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          `SELECT * FROM quotations WHERE id IN (${rows[0]["id_quotation"]})`,
          (error, quotations, fields) => {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "SELECT * FROM budget_project JOIN budget_transaction_project ON budget_project.project_id=budget_transaction_project.project_id where budget_project.project_id=?",
                [id],
                function (error, budgets, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    connection.query(
                      "SELECT * FROM budget_transaction_project where project_id=?",
                      [id],
                      function (error, transaction_project, fields) {
                        if (error) {
                        } else {
                          connection.query(
                            "SELECT * FROM tasks where project_id=?",
                            [id],
                            function (error, tasks, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                if (budgets.length > 0) {
                                  connection.query(
                                    "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out from budget_transaction_project where project_id=?",
                                    [id],
                                    function (error, total) {
                                      if (error) {
                                      } else {
                                        transaction_project.map(
                                          (values, index) => {
                                            connection_hrd.query(
                                              "SELECT * FROM bank_accounts where id=?",
                                              [values.account_id],
                                              function (
                                                error,
                                                accounts,
                                                fields
                                              ) {
                                                if (error) {
                                                  console.log(error);
                                                } else {
                                                  data = {
                                                    id: values.id,
                                                    date: values.date,
                                                    amount: values.amount,
                                                    description:
                                                      values.description,
                                                    type: values.type,
                                                    account_id:
                                                      values.account_id,
                                                    project_id:
                                                      values.project_id,
                                                    account: accounts[0],
                                                  };
                                                  data_tranasctions.push(data);
                                                  if (
                                                    index + 1 >=
                                                    budgets.length
                                                  ) {
                                                    var budget = {
                                                      budget_start_date:
                                                        budgets[0][
                                                          "budget_start_date"
                                                        ],
                                                      budget_end_date:
                                                        budgets[0][
                                                          "budget_end_date"
                                                        ],
                                                      opening_balance:
                                                        budgets[0][
                                                          "opening_balance"
                                                        ],
                                                      total_in:
                                                        total[0].total_in,
                                                      total_out:
                                                        total[0].total_out,
                                                      balance:
                                                        total[0].total_in -
                                                        total[0].total_out,

                                                      transactions:
                                                        data_tranasctions,
                                                    };
                                                    //query get budget
                                                    var data = {
                                                      id: rows[0]["id"],
                                                      id_quotation:
                                                        rows[0]["id_quotation"],
                                                      project_number:
                                                        rows[0][
                                                          "project_number"
                                                        ],
                                                      quotation_number:
                                                        rows[0][
                                                          "quotation_number"
                                                        ],
                                                      project_created_date:
                                                        rows[0][
                                                          "project_created_date"
                                                        ],
                                                      project_start_date:
                                                        rows[0][
                                                          "project_start_date"
                                                        ],
                                                      project_end_date:
                                                        rows[0][
                                                          "project_end_date"
                                                        ],
                                                      event_customer:
                                                        rows[0][
                                                          "event_customer"
                                                        ],
                                                      event_pic:
                                                        rows[0]["event_pic"],
                                                      latitude:
                                                        rows[0]["latitude"],
                                                      longtitude:
                                                        rows[0]["longtitude"],
                                                      description:
                                                        rows[0]["description"],
                                                      total_project_cost:
                                                        rows[0]["grand_total"],
                                                      members: JSON.parse(
                                                        rows[0]["members"]
                                                      ),
                                                      status: rows[0]["status"],
                                                      status_member:
                                                        rows[0][
                                                          "status_member"
                                                        ],
                                                      budget: budget,
                                                      tasks: tasks,
                                                      quotations: quotations,
                                                    };
                                                    response.ok(data, res);
                                                  }
                                                }
                                              }
                                            );
                                          }
                                        );
                                      }
                                    }
                                  );
                                } else {
                                  // if (budgets.length>=0){

                                  //query get budget
                                  var data = {
                                    id: rows[0]["id"],
                                    id_quotation: rows[0]["id_quotation"],
                                    project_number: rows[0]["project_number"],
                                    quotation_number:
                                      rows[0]["quotation_number"],
                                    project_created_date:
                                      rows[0]["project_created_date"],
                                    project_start_date:
                                      rows[0]["project_start_date"],
                                    project_end_date:
                                      rows[0]["project_end_date"],
                                    event_customer: rows[0]["event_customer"],
                                    event_pic: rows[0]["event_pic"],
                                    latitude: rows[0]["latitude"],
                                    longtitude: rows[0]["longtitude"],
                                    description: rows[0]["description"],
                                    total_project_cost: rows[0]["grand_total"],
                                    members: JSON.parse(rows[0]["members"]),
                                    status: rows[0]["status"],
                                    status_member: rows[0]["status_member"],
                                    budget: budgets,
                                    tasks: tasks,
                                    quotations: quotations,
                                  };
                                  response.ok(data, res);

                                  //}
                                }
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

//get project number
exports.getPojectNumber = function (req, res) {
  connection.query(
    "SELECT count(*) as count  FROM projects",
    function (error, count, fields) {
      if (error) {
        console.log(error);
      } else {
        var d = new Date();
        var month = d.getMonth() + 1;
        var month = "00".substr(String(month).length) + month;
        var year = d.getFullYear();
        var date = d.getDate();
        var date = "00".substr(String(date).length) + date;
        var count = count[0]["count"] + 1;
        var counter = "000".substr(String(count).length) + count;
        var project_number = "PN-" + date + month + year + "-" + counter;
        response.ok(project_number, res);
      }
    }
  );
};

exports.editDataProjects = function (req, res) {
  var project_number = req.body.project_number;
  let project_created_date = req.body.project_created_date;
  var project_start_date = req.body.project_start_date;
  var project_end_date = req.body.project_end_date;
  var event_customer = req.body.event_customer;
  var event_pic = req.body.event_pic;
  var description = req.body.description;
  var latitude = req.body.latitude;
  var longitude = req.body.longtitude;
  var grand_total = req.body.total_project_cost;
  var id_quotation = req.body.id_quotation;
  var quotation_number = req.body.quotation_number;
  var id = req.params.id;
  //console.log(id_quotation);

  connection.query(
    "UPDATE  projects SET project_number=?,project_created_date=?,project_start_date=?,project_end_date=?,event_customer=?,event_pic=?,description=?,latitude=?,longtitude=?,grand_total=?,id_quotation=?,quotation_number=? where id=?",
    [
      project_number,
      project_created_date,
      project_start_date,
      project_end_date,
      event_customer,
      event_pic,
      description,
      latitude,
      longitude,
      grand_total,
      id_quotation.toString(),
      quotation_number,
      id,
    ],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been updated", res);
      }
    }
  );
};
//save members porject
exports.saveMembers = function (req, res) {
  var members = req.body.members;
  var members_id = req.body.members_id;
  var id = req.params.id;

  connection.query(
    "UPDATE projects SET members=?,members_id=? where id=?",
    [members, members_id, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "DELETE FROM member_project where project_id=?",
          [id],
          function (error, rows) {
            if (error) {
              console.log(error);
            } else {
              if (JSON.parse(members).length > 0) {
                JSON.parse(members).map((value, index) => {
                  connection.query(
                    "INSERT INTO member_project (employee_id,project_id,daily_money,status) VALUES (?,?,?,?)",
                    [value.id, id, value.daily_money_regular, value.status],
                    function (error, rows) {
                      if (error) {
                        console.log(error);
                      } else {
                        if (index + 1 >= JSON.parse(members).length) {
                          response.ok("Data has been save", res);
                        }
                      }
                    }
                  );
                });
              } else {
                response.ok("Data has been save", res);
              }
            }
          }
        );
      }
    }
  );
};
exports.createTransactionHangerBudget = function (req, res) {
  var budgets = req.body.data;
  var data_transactions_account = req.body.data_transactions_account;
  var project_id = req.body.project_id;
  var transaction_id = req.body.transaction_id;
  var values_transactions = data_transactions_account;
  var ids = req.body.ids;

  //var values = data;
  var sql =
    "INSERT INTO budget_transaction_project (amount,date,type,description,image,account_id,project_id,transfer_to) VALUES ? ";

  // connection.query(sql, [values], function (error, rows, fields) {
  //   if (error) {
  //     console.error(error);
  //   } else {

  //   }
  // });

  // response.ok("data has been save",res);
  connection_hrd.query(
    "DELETE FROM transaction_account where transaction_id=?",
    [transaction_id],
    function (error, fields) {
      if (error) {
        console.log(error);
      } else {
        connection_hrd.query(
          "INSERT INTO transaction_account (amount,date,type,description,image,account_id,transaction_id) VALUES ?",
          [values_transactions],
          function (error, fields) {
            if (error) {
              console.log(error);
            } else {
              // response.ok("Data has been save", res);
              budgets.map((value, index) => {
                if (value.id != "") {
                  connection.query(
                    "UPDATE budget_transaction_project SET amount=?,date=?,image=?,account_id=?,project_id=?,transfer_to=? WHERE id=?",
                    [
                      value.amount,
                      value.date,
                      value.image,
                      value.account_id,
                      value.project_id,
                      value.transfer_to,
                      value.id,
                    ],
                    function (error, rows) {
                      if (error) {
                        console.log(error);
                      } else {
                        if (index + 1 >= budgets.length) {
                          if (ids.length > 0) {
                            connection.query(
                              `DELETE FROM budget_transaction_project where id IN (?)`,
                              [ids],
                              function (error, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  response.ok("Dataa has been save", res);
                                }
                              }
                            );
                          } else {
                            response.ok("Dataa has been save", res);
                          }
                        }
                      }
                    }
                  );
                } else {
                  connection.query(
                    "INSERT INTO budget_transaction_project (amount,date,type,description,image,account_id,project_id,transfer_to)  VALUES (?,?,?,?,?,?,?,?)",
                    [
                      value.amount,
                      value.date,
                      value.type,
                      value.description,
                      value.image,
                      value.account_id,
                      value.project_id,
                      value.transfer_to,
                    ],
                    function (error, rows) {
                      if (error) {
                        console.log(error);
                      } else {
                        if (index + 1 >= budgets.length) {
                          if (ids.length > 0) {
                            connection.query(
                              `DELETE FROM budget_transaction_project where id IN (?)`,
                              [ids],
                              function (error, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  response.ok("Dataa has been save", res);
                                }
                              }
                            );
                          } else {
                            response.ok("Dataa has been save", res);
                          }
                        }
                      }
                    }
                  );
                }
              });
            }
          }
        );
      }
    }
  );
  // connection.end()
};

exports.createTaskProject = function (req, res) {
  var tempTask = req.body.tempTask;
  var tasks = req.body.tasks;
  var ids = req.body.ids;

  tasks.map((value, index) => {
    if (value.id != "") {
      const checked = tempTask.filter((e) => `${e.id}` === `${value.id}`);

      if (checked.length > 0) {
        connection.query(
          "UPDATE tasks SET name=? WHERE id=?",
          [value.name, value.id],
          function (error, rows, fields) {
            if (error) {
              console.log(error);
            } else {
              if (index + 1 >= tasks.length) {
                if (ids.length > 0) {
                  connection.query(
                    `DELETE FROM tasks where id IN (?)`,
                    [ids],
                    function (error, fields) {
                      if (error) {
                        console.log(error);
                      } else {
                        response.ok("Dataa has been save", res);
                      }
                    }
                  );
                } else {
                  response.ok("Dataa has been save", res);
                }
              }
            }
          }
        );
      } else {
        connection.query(
          "DELETE FROM tasks where id=?",
          [value.id],
          function (error, rows) {
            if (error) {
              console.log(error);
            } else {
              if (index + 1 >= tasks.length) {
                if (ids.length > 0) {
                  connection.query(
                    `DELETE FROM tasks where id IN (?)`,
                    [ids],
                    function (error, fields) {
                      if (error) {
                        console.log(error);
                      } else {
                        response.ok("Dataa has been save", res);
                      }
                    }
                  );
                } else {
                  response.ok("Dataa has been save", res);
                }
              }
            }
          }
        );
      }
    } else {
      connection.query(
        "INSERT INTO tasks(name,status,project_id) VALUES (?,?,?)",
        [value.name, value.status, value.project_id],
        function (error, rows, fields) {
          if (error) {
            console.log(error);
          } else {
            if (index + 1 >= tasks.length) {
              if (ids.length > 0) {
                connection.query(
                  `DELETE FROM tasks where id IN (?)`,
                  [ids],
                  function (error, fields) {
                    if (error) {
                      console.log(error);
                    } else {
                      response.ok("Dataa has been save", res);
                    }
                  }
                );
              } else {
                response.ok("Dataa has been save", res);
              }
            }
          }
        }
      );
    }
  });
};
exports.deleteTask = function (req, res) {
  connection.query(
    "DELETE FROM tasks where id=?",
    [ids],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been save", res);
      }
    }
  );
};

exports.getTaskProject = function (req, res) {
  var project_id = req.params.id;
  connection.query(
    "SELECT * FROM tasks where project_id=?",
    [project_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

exports.editTaskProject = function (req, res) {
  var task_id = req.params.id;
  var status = "completed";
  connection.query(
    "UPDATE tasks SET status=? where id=?",
    [status, task_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

exports.getDetailTransactionsProject = function (req, res) {
  project_id = req.params.id;
  console.log(project_id);
  var transactions_project = [];
  var balance = 0;
  connection.query(
    "SELECT * FROM budget_transaction_project WHERE project_id=? ORDER BY date ASC,id DESC",
    [project_id],
    function (error, transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out from budget_transaction_project where project_id=?",
          [project_id],
          function (error, total, fields) {
            if (error) {
              console.log(error);
            } else {
              transactions.map((value, index) => {
                if (value.type == "out") {
                  balance = Number(balance) - Number(value.amount);
                } else {
                  balance = Number(balance) + Number(value.amount);
                }
                var data = {
                  id: value.id,
                  date: value.date,
                  amount: value.amount,
                  description: value.description,
                  image: value.image,
                  type: value.type,
                  balance: balance,
                  account_id: value.account_id,
                  porject_id: value.project_id,
                  status: value.status,
                };
                transactions_project.push(data);
              });
              if (total != "") {
                let data = {
                  total_in: total[0]["total_in"],
                  total_out: total[0]["total_out"],
                  balance: total[0]["total_in"] - total[0]["total_out"],

                  transactions: transactions_project,
                };
                response.ok(data, res);
              } else {
                let data = {
                  status: "pending",
                  total_in: total[0]["total_in"],
                  total_out: total[0]["total_out"],
                  balance: total[0]["total_in"] + total[0]["total_out"],
                  transactions: rows,
                };
                response.ok(data, res);
              }
            }
          }
        );
      }
    }
  );
};

exports.getCountStatusProject = function (req, res) {
  connection.query(
    "SELECT COUNT(*) AS total_pending from projects WHERE status='pending'",
    function (error, pending, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "SELECT COUNT(*) AS total_approved from projects WHERE status='approved'",
          function (error, approved, fields) {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "SELECT COUNT(*) AS total_rejected from projects WHERE status='rejected'",
                function (error, rejected, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    connection.query(
                      "SELECT COUNT(*) AS total_closed from projects WHERE status='closed'",
                      function (error, closed, fields) {
                        if (error) {
                          console.log(error);
                        } else {
                          var data = {
                            total_pending: pending[0].total_pending,
                            total_rejected: rejected[0].total_rejected,
                            total_approved: approved[0].total_approved,
                            total_closed: closed[0].total_closed,
                          };
                          response.ok(data, res);
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.createTransactionProject = function (req, res) {
  var date = req.body.date;
  var description = req.body.description;
  var amount = req.body.amount;
  var type = req.body.type;
  var id = req.body.id;

  connection.query(
    "INSERT INTO transactions_project(date,description,amount,type,project_id) VALUES (?,?,?,?,?)",
    [date, description, amount, type, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been save", res);
      }
    }
  );
};

exports.getAllTransactionsProject = function (req, res) {
  var id = req.params.id;
  var transactions = [];
  var margin = 0;
  var balance = 0;
  var persentase;
  var tempIn = 0;
  connection.query(
    "SELECT * FROM transactions_project where project_id=? ORDER BY date ASC,id DESC",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out FROM transactions_project where project_id=?",
          [id],
          function (error, total, fields) {
            if (error) {
              console.log(error);
            } else {
              // response.ok(rows,res)
              for (var i = 0; i < rows.length; i++) {
                if (rows[i].type == "in") {
                  balance = balance + rows[i].amount;
                  tempIn = Number(tempIn) + Number(rows[i].amount);

                  persentase = (
                    (Number(balance) / Number(tempIn)) *
                    100
                  ).toFixed(2);
                } else {
                  balance = balance - rows[i].amount;

                  persentase = (
                    (Number(balance) / Number(tempIn)) *
                    100
                  ).toFixed(2);
                }

                var tempTransaction = {
                  date: rows[i].date,
                  description: rows[i].description,
                  amount: rows[i].amount,
                  type: rows[i].type,
                  balance: balance,
                  persentase: persentase,
                };
                transactions.push(tempTransaction);
              }

              var data = {
                total_in: total[0].total_in,
                total_out: total[0].total_out,
                balance: total[0].total_in - total[0].total_out,
                transactions: transactions,
              };
              response.ok(data, res);
            }
          }
        );
      }
    }
  );
};

exports.approvalProject = function (req, res) {
  let id = req.params.id;
  let status = "approved";
  let accounts = [];
  let id_quotation = req.body.id_quotation;
  console.log(req.body.profits);

  var description = req.body.description;
  connection.query(
    "UPDATE projects set status=? where id=?",
    [status, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //response.ok('Data has been save',res)
        connection.query(
          "SELECT * FROM budget_transaction_project where project_id=?",
          [id],
          function (error, transaction_project, fields) {
            if (error) {
              console.log(error);
            } else {
              transaction_project.map((value) => {
                //rquest {amount:budget,date:date,type:type,description:description,image:image,account_Id:account:id}
                var account = [
                  value.amount,
                  dateFormat(value.date, "yyyy-mm-dd"),
                  "out",
                  description,
                  "",
                  value.account_id,
                ];
                accounts.push(account);
              });

              //create transaction accounts
              var sql =
                "INSERT INTO transaction_account (amount,date,type,description,image,account_id) VALUES ?";
              var values = accounts;

              connection_hrd.query(
                sql,
                [values],
                function (erro, tranasaction_accounts, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                    var values = req.body.profits;

                    id_quotation.map((value, index) => {
                      connection.query(
                        "UPDATE quotations SET project_id=? WHERE id=?",
                        [id, value],
                        function (error, update) {
                          if (error) {
                            console.log(error);
                          } else {
                            if (index >= id_quotation.length) {
                              response.ok("Data has been save", res);
                            }
                          }
                        }
                      );
                    });

                    // transaksi laba rugi
                    //   connection.query("INSER?",[values],function(error,rows,fields){
                    //     if (error){
                    //     console.log(error)

                    //     }else{
                    //         response.ok("Data has been save",res)

                    //     }
                    // })
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.rejectionProject = function (req, res) {
  let id = req.params.id;
  let status = "rejected";
  connection.query(
    "UPDATE projects set status=? where id=?",
    [status, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been save", res);
      }
    }
  );
};

//insert data account
exports.createAccount = function (req, res) {
  var bank_account_name = req.body.bank_account_name;
  var bank_account_number = req.body.bank_account_number;
  var bank_account_balance = req.body.bank_account_balance;
  var date = req.body.date;
  var type = req.body.type;

  //insert to account table
  connection_hrd.query(
    "INSERT INTO bank_accounts(bank_name,account_number,account_balance,type) VALUES(?,?,?,?)",
    [bank_account_name, bank_account_number, bank_account_balance, type],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        var id = rows["insertId"];
        connection_hrd.query(
          "INSERT INTO transaction_account(date,amount,type,account_id) values (?,?,?,?)",
          [date, bank_account_balance, "in", id],
          function (error, rows, fields) {
            if (error) {
              console.log(error);
            } else {
              response.ok("Data has been save", res);
            }
          }
        );
      }
    }
  );
};

//edit data account
exports.editAccount = function (req, res) {
  var bank_account_name = req.body.bank_account_name;
  var bank_account_number = req.body.bank_account_number;
  var bank_account_balance = req.body.bank_account_balance;
  var type = req.body.type;
  var id = req.params.id;

  connection_hrd.query(
    "UPDATE bank_accounts SET bank_name=?,account_number=?,account_balance=?,type=?  WHERE id=?",
    [bank_account_name, bank_account_number, bank_account_balance, type, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        // response.ok("Data has been updated",res)
        response.ok("Data has been updated", res);

        // connection_hrd.query("UPDATE transaction_account SET amount=? WHERE account_id=?",
        // [bank_account_balance,type,id],
        //     function(error,rows,fields){
        //     if (error){
        //         console.log(error)
        //     }else{
        //          response.ok("Data has been updated",res)
        //     }
        // });
      }
    }
  );
};

//delete project by id
exports.deleteAccount = function (req, res) {
  var id = req.params.id;
  connection_hrd.query(
    "DELETE FROM bank_accounts WHERE id=?",
    [id],
    (error, rows, fields) => {
      if (error) {
        console.log(error);
      } else {
        // response.ok("Data has been deleted",res)
        connection_hrd.query(
          "DELETE FROM transaction_account WHERE account_id=?",
          [id],
          (error, rows, fields) => {
            if (error) {
              console.log(error);
            } else {
              response.ok("Data has been deleted", res);
            }
          }
        );
      }
    }
  );
};

//show data account
exports.getAllAccount = function (req, res) {
  var data_transactions = [];
  var data;
  connection_hrd.query(
    "SELECT * FROM bank_accounts ORDER BY id DESC",
    function (error, rows, fields) {
      if (error) {
        console.log(erro);
      } else {
        //response.ok(rows,res)
        rows.map((values, index) => {
          connection_hrd.query(
            "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out FROM transaction_account where account_id=?",
            [values.id],
            function (error, total, fields) {
              if (error) {
                console.log(error);
              } else {
                data = {
                  id: values.id,
                  bank_name: values.bank_name,
                  account_number: values.account_number,
                  opening_balance: values.account_balance,
                  type: values.type,
                  balance: total[0].total_in - total[0].total_out,
                };
                data_transactions.push(data);
                if (index + 1 >= rows.length) {
                  response.ok(data_transactions, res);
                }
              }
            }
          );
        });
      }
    }
  );
};

//show detail account
exports.getDetailAccount = function (req, res) {
  var account_id = req.params.id;
  var balance = 0;
  var transactions_account = [];
  connection_hrd.query(
    "SELECT * FROM bank_accounts WHERE id=?",
    [account_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection_hrd.query(
          "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out FROM transaction_account where account_id=?",
          [account_id],
          function (error, total, fields) {
            if (error) {
              console.log(error);
            } else {
              connection_hrd.query(
                "SELECT * FROM transaction_account where account_id=? ORDER BY date ASC,id DESC",
                [account_id],
                function (error, transactions, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    //calculation balance trnsaction
                    transactions.map((value, index) => {
                      if (value.type == "out") {
                        balance = Number(balance) - Number(value.amount);
                      } else {
                        balance = Number(balance) + Number(value.amount);
                      }
                      var data = {
                        id: value.id,
                        date: value.date,
                        amount: value.amount,
                        description: value.description,
                        image: value.image,
                        type: value.type,
                        balance: balance,
                      };
                      transactions_account.push(data);
                    });

                    if (res["data"] != "") {
                      var data = {
                        id: rows[0]["id"],
                        bank_name: rows[0]["bank_name"],
                        account_number: rows[0]["account_number"],
                        account_balance: rows[0]["account_balance"],
                        type: rows[0]["type"],
                        account_owner: rows[0]["account_owner"],
                        bank_code: rows[0]["bank_code"],
                        total_in: total[0]["total_in"],
                        total_out: total[0]["total_out"],
                        balance: total[0]["total_in"] - total[0]["total_out"],
                        date: total[0]["date"],
                        transactions: transactions_account,
                      };
                      response.ok(data, res);
                    } else {
                      response.ok(rows, res);
                    }
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.createTransactionAccount = function (req, res) {
  var data = req.body.data;
  var sql =
    "INSERT INTO transaction_account (amount,date,type,description,image,account_id) VALUES ?";
  var values = data;
  connection_hrd.query(sql, [values], function (error, rows, fields) {
    if (error) {
      console.log(error);
    } else {
      response.ok("data has been save", res);
    }
  });
};

exports.createBudget = function (req, res) {
  var budget_start_date = req.body.budget_start_date;
  var budget_end_date = req.body.budget_end_date;
  var opening_balance = req.body.opening_balance;
  var project_id = req.body.project_id;

  connection.query(
    "DELETE FROM budget_project where project_id=?",
    [project_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "INSERT INTO budget_project(budget_start_date,budget_end_date,opening_balance,project_id) VALUES (?,?,?,?)",
          [budget_start_date, budget_end_date, opening_balance, project_id],
          function (error, rows, fields) {
            if (error) {
              console.log(error);
            } else {
              response.ok("data has been save", res);
            }
          }
        );
      }
    }
  );
};

exports.getDetailBudgets = function (req, res) {
  project_id = req.params.id;

  var data_transactions = [];
  var total_in = 0;

  connection.query(
    'select * from budget_transaction_project where project_id=? AND type="in" ORDER BY date ASC ',
    [project_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //project number
        connection.query(
          "SELECT * FROM projects JOIN budget_project ON projects.id=budget_project.project_id where projects.id=?  ",
          [project_id],
          function (error, projects, fields) {
            if (error) {
              console.log(error);
            } else {
              if (projects != "") {
                rows.map((values, index) => {
                  connection_hrd.query(
                    "SELECT * FROM bank_accounts where id=?",
                    [values.account_id],
                    function (error, accounts, fields) {
                      if (error) {
                        console.log(error);
                      } else {
                        total_in = total_in + values.amount;

                        console.log("aa", accounts);

                        var d = {
                          id: values.id,
                          date: values.date,
                          description: values.description,
                          amount: values.amount,
                          type: "in",
                          account_id: values.account_id,
                          project_id: values.project_id,
                          transfer_to: values.transfer_to,
                          image: values.image == "" ? null : values.image,
                          account: accounts.length <= 0 ? null : accounts[0],
                        };
                        data_transactions.push(d);

                        if (index + 1 >= rows.length) {
                          let data = {
                            project_number: projects[0]["project_number"],
                            total_budget: total_in,
                            budget_start_date: projects[0]["budget_start_date"],
                            budget_end_date: projects[0]["budget_end_date"],

                            status: projects[0]["status"],
                            transactions: data_transactions,
                          };
                          response.ok(data, res);
                        }
                      }
                    }
                  );
                });
              } else {
                let data = {
                  project_number: null,
                  status: "pending",
                  transactions: rows,
                };
                response.ok(data, res);
              }
            }
          }
        );
      }
    }
  );
};

exports.getBudgetsProject = function (req, res) {
  project_id = req.params.id;
  console.log(project_id);
  var data_transactions = [];

  connection.query(
    "select * from budget_transaction_project where project_id=? ORDER BY date DESC",
    [project_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //project number
        connection.query(
          "SELECT * FROM projects JOIN budget_project ON projects.id=budget_project.project_id where projects.id=? ",
          [project_id],
          function (error, projects, fields) {
            if (error) {
              console.log(error);
            } else {
              if (projects != "") {
                connection.query(
                  "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out FROM budget_transaction_project where project_id=?",
                  [project_id],
                  function (error, total, fields) {
                    if (error) {
                      console.log(error);
                    } else {
                      rows.map((values, index) => {
                        var d = {
                          id: values.id,
                          date:
                            values.date != null
                              ? dateFormat(values.date, "yyyy-mm-dd")
                              : values.date,
                          description: values.description,
                          amount: values.amount,
                          type: values.type,
                          account_id: values.account_id,
                          project_id: values.project_id,
                          image: values.image,
                          status: values.status,
                        };
                        data_transactions.push(d);

                        if (index + 1 >= rows.length) {
                          let data = {
                            project_number: projects[0]["project_number"],

                            budget_start_date: dateFormat(
                              projects[0]["budget_start_date"],
                              "yyyy-mm-dd"
                            ),
                            budget_end_date: dateFormat(
                              projects[0]["budget_end_date"],
                              "yyyy-mm-dd"
                            ),
                            status: projects[0]["status"],
                            total_in: total[0].total_in,
                            total_out: total[0].total_out,
                            balance: total[0].total_in - total[0].total_out,
                            transactions: data_transactions,
                          };
                          response.ok(data, res);
                        }
                      });
                    }
                  }
                );
              } else {
                let data = {
                  project_number: null,
                  status: "pending",
                  transactions: rows,
                };
                response.ok(data, res);
              }
            }
          }
        );
      }
    }
  );
};

exports.getBudgetsProjectType = function (req, res) {
  var project_id = req.params.id;
  var status = req.params.type;
  console.log(project_id);
  var data_transactions = [];

  connection.query(
    "select * from budget_transaction_project where project_id=? AND type=?",
    [project_id, status],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //project number
        connection.query(
          "SELECT * FROM projects JOIN budget_project ON projects.id=budget_project.project_id where projects.id=? ",
          [project_id],
          function (error, projects, fields) {
            if (error) {
              console.log(error);
            } else {
              if (projects != "") {
                connection.query(
                  "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out FROM budget_transaction_project where project_id=?",
                  [project_id],
                  function (error, total, fields) {
                    if (error) {
                      console.log(error);
                    } else {
                      rows.map((values, index) => {
                        var d = {
                          date: values.date,
                          description: values.description,
                          amount: values.amount,
                          type: values.type,
                          account_id: values.account_id,
                          project_id: values.project_id,
                          image: values.image,
                          status: values.status,
                        };
                        data_transactions.push(d);

                        if (index + 1 >= rows.length) {
                          let data = {
                            project_number: projects[0]["project_number"],

                            budget_start_date: projects[0]["budget_start_date"],
                            budget_end_date: projects[0]["budget_end_date"],
                            status: projects[0]["status"],
                            total_in: total[0].total_in,
                            total_out: total[0].total_out,
                            balance: total[0].total_in - total[0].total_out,
                            transactions: data_transactions,
                          };
                          response.ok(data, res);
                        }
                      });
                    }
                  }
                );
              } else {
                let data = {
                  project_number: null,
                  status: "pending",
                  transactions: rows,
                };
                response.ok(data, res);
              }
            }
          }
        );
      }
    }
  );
};

exports.getAllPIC = function (req, res) {
  connection.query(
    "SELECT * FROM pic_event JOIN customer ON pic_event.id_customer=customer.id LEFT JOIN pic_tb ON pic_tb.pic_id=pic_event.id_event",
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

exports.CreatePIC = function (req, res) {
  var opening_balance = req.body.opening_balance;
  var balance = req.body.balance;
  var pic_id = req.body.pic_id;

  var description = req.body.description;
  var date = req.body.date;
  var amount = req.body.amount;
  var id_faktur = req.body.id_faktur;
  var type = req.body.type;
  var connection_table = "pic_tb";

  connection.query(
    "INSERT INTO pic_tb(opening_balance,balance,pic_id) value(?,?,?)",
    [opening_balance, balance, pic_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //response.ok("Data has been save",res)
        let id = rows["insertId"];

        connection.query(
          "INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",
          [date, description, amount, type, id, id, connection_table],
          function (error, transactions, fields) {
            if (error) {
              console.log(error);
            } else {
              response.ok("Data has been save", res);
            }
          }
        );
      }
    }
  );
};
exports.EditPIC = function (req, res) {
  var opening_balance = req.body.opening_balance;
  var balance = req.body.balance;
  var pic_id = req.body.pic_id;
  var id = req.params.id;
  var connection_table = "pic_tb";
  connection.query(
    "UPDATE pic_tb SET opening_balance=?,balance=?,pic_id=? where id=?",
    [opening_balance, balance, pic_id, id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "UPDATE transaction_tb SET amount=? where connection_id=? AND connection_table=?",
          [opening_balance, id, connection_table],
          function (error, rows, fields) {
            if (error) {
              console.log(error);
            } else {
              response.ok("Data has been updated", res);
            }
          }
        );
      }
    }
  );
};

exports.getAllPICTB = function (req, res) {
  var data_transactions = [];
  var data;

  connection.query(
    "SELECT pic_tb.id,pic_event.pic_name as name,pic_event.jabatan as position,pic_event.email,opening_balance,balance FROM pic_tb JOIN pic_event ON  pic_tb.pic_id=pic_event.id_event",
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //response.ok(rows,res)
        rows.map((values, index) => {
          connection.query(
            "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out FROM transaction_tb where id_pictb=?",
            [values.id],
            function (error, total, fields) {
              if (error) {
                console.log(error);
              } else {
                data = {
                  id: values.id,
                  name: values.name,
                  position: values.position,
                  email: values.email,
                  opening_balance: values.opening_balance,
                  balance: total[0].total_in - total[0].total_out,
                };
                data_transactions.push(data);
                if (index + 1 >= rows.length) {
                  response.ok(data_transactions, res);
                }
              }
            }
          );
        });
      }
    }
  );
};

exports.deletePICTB = function (req, res) {
  let id = req.params.id;
  connection.query(
    "DELETE FROM pic_tb where id=?",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        //response.ok("data has been deleted",res)

        connection.query(
          "DELETE FROM transaction_tb where id_pictb=?",
          [id],
          function (error, rows, fields) {
            if (error) {
              console.log(error);
            } else {
              response.ok("data has been deleted", res);
            }
          }
        );
      }
    }
  );
};

exports.getDetailPICTB = function (req, res) {
  var id = req.params.id;
  var transactions_pictb = [];
  var balance = 0;

  connection.query(
    "SELECT pic_tb.id,pic_event.pic_name as name,pic_event.jabatan as position,pic_event.email,opening_balance,balance,pic_event.id_event FROM pic_tb JOIN pic_event ON  pic_tb.pic_id=pic_event.id_event where id=?",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "SELECT * FROM transaction_tb WHERE id_pictb=? ORDER By date ASC,id DESC",
          [id],
          function (error, transactions, fields) {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "SELECT SUM(IF(type = 'in', amount, 0)) as total_in,SUM(IF(type = 'out', amount, 0)) as total_out from transaction_tb where id_pictb=?",
                [id],
                function (error, total, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    //calculation balance trnsaction
                    transactions.map((value, index) => {
                      if (value.type == "out") {
                        balance = Number(balance) - Number(value.amount);
                      } else {
                        balance = Number(balance) + Number(value.amount);
                      }
                      var data = {
                        id: value.id,
                        date: value.date,
                        amount: value.amount,
                        description: value.description,
                        type: value.type,
                        balance: balance,
                      };
                      transactions_pictb.push(data);
                    });
                    var data = {
                      id: rows[0].id,
                      total_in:
                        total[0].total_in == null ? 0 : total[0].total_in,
                      total_out:
                        total[0].total_out == null ? 0 : total[0].total_out,
                      balance: total[0].total_in - total[0].total_out,
                      opening_balance: rows[0].opening_balance,

                      name: rows[0].name,
                      position: rows[0].position,
                      email: rows[0].email,
                      event_id: rows[0].id_event,
                      transactions: transactions_pictb,
                    };
                    response.ok(data, res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getAllFaktur = function (req, res) {
  var data_faktur = [];
  var data;
  //

  // SELECT *,projects.grand_total as total_project_cost,projects.id as project_id FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number  JOIN projects  ON projects.id_quotation in (quotations.id)
  connection.query(
    " SELECT *, projects.grand_total as total_project_cost , quotations.quotation_number as quotation_number FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number JOIN projects ON projects.id=quotations.project_id",
    function (error, rows, fields) {
      // SELECT * , quotations.quotation_number as idd FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
        //  if  (rows.length>0){

        // rows.map((value,index)=>{
        // console.log('id',value.idd)
        //     console.log(value.id)

        //     connection.query("SELECT * from projects WHERE ? IN ('QE-D217290413,QE-D216280001-Rev6')",["QE-D217290413"],function(error,p){

        //        if (error){
        //            console.log(error)

        //        } else{
        //            console.log('1,2');
        //            console.log(p)
        //            data={
        //                id:value.idd,
        //                projects:p
        //             }

        //             data_faktur.push(data)

        //           if (index+1>=rows.length){

        //             response.ok(data_faktur,res)
        //           }}

        //     });
        // });

        // }else{
        //     response.ok(data_faktur,res);
        // }
      }
    }
  );
};

exports.createTransactionTB = function (req, res) {
  var description = req.body.description;
  var date = req.body.date;
  var amount = req.body.amount;
  var id_faktur = req.body.id_faktur;
  var type = req.body.type;
  var id_pictb = req.body.id_pictb;
  connection.query(
    "INSERT INTO transaction_tb(date,description,amount,type,id_pictb,id_faktur) value(?,?,?,?,?,?)",
    [date, description, amount, type, id_pictb, id_faktur],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been save", res);
      }
    }
  );
};

// //in transaction
// exports.createInTransation=function(req,res){
//     var description=req.body.description;
//     var amount =req.body.amount;
//     var date=req.body.date;
//     var faktur_id=req.body.faktur_id
//     var id_pictb=req.body.id_pictb;
//     var project_id=req.body.project_id;
//     var connection_table="in_transactions"
//     var payment=req.body.payment;

//     connection.query("INSERT INTO in_transactions (in_date,amount,faktur_id) values (?,?,?)",[date,amount,faktur_id],function(error,in_transactions,fields){
//         if (error){
//             console.log(error)
//         }else{
//             let connection_id=in_transactions['insertId'];

//         connection.query("INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",[date,description,amount,'out',id_pictb,connection_id,connection_table],function(error,transactions,fields){
//             if (error){
//                 console.log(error)
//             }else{
//             //    response.ok("Data has been save",res)
//             connection.query("INSERT INTO transactions_project(date,description,amount,type,project_id,connection_id,connection_table) value(?,?,?,?,?,?,?)",[date,description,amount,'in',project_id,connection_id,connection_table],function(error,transactions,fields){
//                 if (error){
//                     console.log(error)
//                 }else{
//                 // response.ok("Data has been save",res)
//                     connection.query("UPDATE faktur SET pembayaran=? WHERE id_faktur=?",[amount,faktur_id],function(error,rows){
//                         if (error){
//                             console.log(error)

//                         }else{
//                              console.log("behasi");
//                             // response.ok("Data has been save");

//                             connection_hrd.query("INSERT INTO transaction_account(date,description,type,amount,account_id,transaction_id)VALUES(?,?,?,?,?,?)",[date,description,'out',amount,"108",`${connection_id}_${connection_table}`],function(errior,fields){
//                                 if (error){
//                                     console.log(error)

//                                 }else{
//                                     console.log("behasi");
//                                 response.ok("Data has been save");

//                                 }

//                             })

//                         }
//                     })
//                 }

//             })

//             }

//         })

//         }
//     });
// }

exports.createInTransation = function (req, res) {
  var description = req.body.description;
  var amount = req.body.amount;
  var date = req.body.date;
  var faktur_id = req.body.faktur_id;
  var id_pictb = req.body.id_pictb;
  var project_id = req.body.project_id;
  var connection_table = "in_transactions";
  var payment = req.body.payment;
  var project_number = req.body.project_number;
  var quotation_number = req.body.quotation_number;

  connection.query(
    "INSERT INTO in_transactions (in_date,amount,faktur_id,pictb_id) VALUES (?,?,?,?)",
    [date, amount, faktur_id, id_pictb],
    function (error, in_transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        let connection_id = in_transactions["insertId"];

        connection.query(
          "INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",
          [
            date,
            `${quotation_number} / ${project_number} / ${description}`,
            amount,
            "out",
            id_pictb,
            connection_id,
            connection_table,
          ],
          function (error, transactions, fields) {
            if (error) {
              console.log(error);
            } else {
              //    response.ok("Data has been save",res)
              connection.query(
                "INSERT INTO transactions_project(date,description,amount,type,project_id,connection_id,connection_table) value(?,?,?,?,?,?,?)",
                [
                  date,
                  `${quotation_number} / ${project_number} / ${description}`,
                  amount,
                  "in",
                  project_id,
                  connection_id,
                  connection_table,
                ],
                function (error, transactions, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    //response.ok("Data has been save",res)

                    connection.query(
                      "UPDATE faktur SET pembayaran=? WHERE id_faktur=?",
                      [payment, faktur_id],
                      function (error, rows) {
                        if (error) {
                          console.log(error);
                        } else {
                          //response.ok("Data has been save",res)
                          connection_hrd.query(
                            "INSERT INTO transaction_account(date,description,type,amount,account_id,transaction_id)VALUES(?,?,?,?,?,?)",
                            [
                              date,
                              `${quotation_number} / ${project_number} / ${description}`,
                              "out",
                              amount,
                              "108",
                              `${connection_id}_${connection_table}`,
                            ],
                            function (errior, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                response.ok("Data has been save", res);
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.editInTransation = function (req, res) {
  var amount = req.body.amount;
  var date = req.body.date;

  var faktur_id = req.body.faktur_id;
  var payment = req.body.payment;
  var id = req.params.id;
  var connection_table = "in_transactions";

  connection.query(
    "UPDATE in_transactions SET in_date=?,amount=? where id=?",
    [date, amount, id],
    function (error, in_transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "UPDATE transaction_tb SET date=?,amount=? WHERE connection_id=? AND connection_table=?",
          [date, amount, id, connection_table],
          function (error, transactions, fields) {
            if (error) {
              console.log(error);
            } else {
              //    response.ok("Data has been save",res)
              connection.query(
                "UPDATE transactions_project SET date=?,amount=? WHERE connection_id=? AND connection_table=?",
                [date, amount, id, connection_table],
                function (error, transactions, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    //response.ok("Data has been updated",res)

                    connection.query(
                      "UPDATE faktur SET pembayaran=? WHERE id_faktur=?",
                      [payment, faktur_id],
                      function (error, rows) {
                        if (error) {
                          console.log(error);
                        } else {
                          // response.ok("Data has been updated",res)

                          console.log(`${id}_${connection_table}`);

                          connection_hrd.query(
                            "UPDATE transaction_account SET date=?,amount=? WHERE transaction_id=?",
                            [date, amount, `${id}_${connection_table}`],
                            function (error, transactions, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                response.ok("Data has been updated", res);
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.deleteInTransaction = function (req, res) {
  id = req.params.id;
  connection_table = "in_transactions";
  var faktur_id = req.params.faktur_id;
  var payment = req.params.payment;
  console.log(faktur_id);
  console.log(payment);
  connection.query(
    "DELETE FROM in_transactions where id=?",
    [id],
    function (error, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "DELETE FROM transactions_project where connection_id=? AND connection_table=?",
          [id, connection_table],
          function (error, fields) {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "DELETE FROM transaction_tb WHERE connection_id=? AND connection_table=?",
                [id, connection_table],
                function (error, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    // response.ok("Data has been save",res)

                    connection.query(
                      "UPDATE faktur SET pembayaran=? WHERE id_faktur=?",
                      [payment, faktur_id],
                      function (error, rows) {
                        if (error) {
                          console.log(error);
                        } else {
                          // response.ok("data has been deleted",res)

                          connection_hrd.query(
                            "DELETE FROM transaction_account WHERE transaction_id=?",
                            [`${id}_${connection_table}`],
                            function (error, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                // response.ok("Data has been save",res)
                                response.ok("data has been deleted", res);

                                // connection.query("UPDATE faktur SET pembayaran=? WHERE id_faktur=?",[payment,faktur_id],function(error,rows){
                                //     if (error){
                                //         console.log(error)
                                //     }else{
                                //         response.ok("data has been deleted",res)

                                //     }
                                // })
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getAllInTransaction = function (req, res) {
  let id = req.params.id;
  // SELECT *,projects.grand_total as total_project_cost,projects.id as project_id FROM in_transactions JOIN faktur ON in_transactions.faktur_id=faktur.id_faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number  JOIN projects  ON projects.id_quotation in (quotations.id
  connection.query(
    "SELECT in_transactions.id as id,in_transactions.in_date as date,in_transactions.amount,in_transactions.faktur_id as faktur_id,quotations.pic_event,quotations.po_number,projects.project_number,projects.description,faktur.total_faktur,faktur.pembayaran,faktur.faktur_number,projects.id as porject_id,quotations.id_pic_event FROM in_transactions JOIN faktur ON in_transactions.faktur_id=faktur.id_faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number JOIN projects ON projects.id=quotations.project_id where in_transactions.pictb_id=?",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

//out transaction
exports.createOutTransaction = function (req, res) {
  var label = req.body.label;
  var project_id = req.body.project_id;
  var pictb_id = req.body.pictb_id;
  var pictb_id_owner = req.body.pictb_id_owner;
  var date = req.body.date;
  var description = req.body.description;
  var amount = req.body.amount;
  var pictb_id_source = req.body.pictb_id_source;
  var connection_table = "out_transactions";
  connection.query(
    "INSERT INTO out_transactions(date,description,amount,label,project_id,pictb_id,pictb_id_source) VALUES(?,?,?,?,?,?,?)",
    [date, description, amount, label, project_id, pictb_id, pictb_id_source],
    function (error, out_transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        let connection_id = out_transactions["insertId"];
        if (project_id != 0) {
          connection.query(
            "INSERT INTO transactions_project(date,description,amount,type,project_id,connection_id,connection_table) value(?,?,?,?,?,?,?)",
            [
              date,
              description,
              amount,
              "out",
              project_id,
              connection_id,
              connection_table,
            ],
            function (error, transactions, fields) {
              if (error) {
                console.log(error);
              } else {
                response.ok("Data has been save", res);
                // connection.query("INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",[date,description,amount,'in',pictb_id_owner,connection_id,connection_table],function(error,transactions,fields){
                //     if (error){
                //         console.log(error)
                //     }else{

                //         response.ok("Data has been save",res)

                //     }

                // })
                //response.ok("Data has been save",res)
              }
            }
          );
        } else {
          connection.query(
            "INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",
            [
              date,
              description,
              amount,
              "out",
              pictb_id_owner,
              connection_id,
              connection_table,
            ],
            function (error, transactions, fields) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",
                  [
                    date,
                    description,
                    amount,
                    "in",
                    pictb_id,
                    connection_id,
                    connection_table,
                  ],
                  function (error, transactions, fields) {
                    if (error) {
                      console.log(error);
                    } else {
                      response.ok("Data has been save", res);
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};

exports.editOutTransaction = function (req, res) {
  var label = req.body.label;
  var project_id = req.body.project_id;
  var pictb_id = req.body.pictb_id;
  var pictb_id_owner = req.body.pictb_id_owner;
  var date = req.body.date;
  var description = req.body.description;
  var amount = req.body.amount;
  var connection_table = "out_transactions";
  var id = req.params.id;

  connection.query(
    "UPDATE out_transactions SET date=?,description=?,amount=? where id=?",
    [date, description, amount, id],
    function (error, out_transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        if (project_id != 0) {
          connection.query(
            " UPDATE transactions_project SET date=?,description=?,amount=? WHERE connection_id=? AND connection_table=?",
            [date, description, amount, id, connection_table],
            function (error, transactions, fields) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "UPDATE transaction_tb SET date=?,description=?,amount=? WHERE connection_id=? AND connection_table=?",
                  [date, description, amount, id, connection_table],
                  function (error, transactions, fields) {
                    if (error) {
                      console.log(error);
                    } else {
                      response.ok("Data has been save", res);
                    }
                  }
                );
                //response.ok("Data has been save",res)
              }
            }
          );
        } else {
          connection.query(
            "UPDATE transaction_tb SET date=?,description=?,amount=? WHERE connection_id=? AND connection_table=? AND type=?",
            [date, description, amount, id, connection_table, "out"],
            function (error, transactions, fields) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "UPDATE transaction_tb SET date=?,description=?,amount=? WHERE connection_id=? AND connection_table=? AND type=?",
                  [date, description, amount, id, connection_table, "in"],
                  function (error, transactions, fields) {
                    if (error) {
                      console.log(error);
                    } else {
                      response.ok("Data has been save", res);
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};

exports.getAllOutTransaction = function (req, res) {
  var id = req.params.id;
  connection.query(
    "SELECT * FROM out_transactions WHERE pictb_id_source=?",
    [id],
    function (error, out_transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(out_transactions, res);
      }
    }
  );
};

exports.deleteOutTransactions = function (req, res) {
  let id = req.params.id;
  let project_id = req.params.project_id;
  let pictb_id = req.params.pictb_id;
  var connection_table = "out_transactions";
  connection.query(
    "DELETE FROM out_transactions where id=?",
    [id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        if (project_id !== 0) {
          connection.query(
            "DELETE FROM transactions_project where connection_id=? AND connection_table=?",
            [id, connection_table],
            function (error, rows) {
              if (error) {
              } else {
                connection.query(
                  "DELETE FROM transaction_tb WHERE connection_id=? AND connection_table=?",
                  [id, connection_table],
                  function (error, rows) {
                    if (error) {
                    } else {
                      response.ok("Data has been save", res);
                    }
                  }
                );
                //response.ok("Data has been save",res)
              }
            }
          );
        } else {
          connection.query(
            "DELETE FROM transaction_tb where connection_id=? AND connection_table=?",
            [id, connection_table],
            function (error, rows) {
              if (error) {
                console.log(error);
              } else {
                response.ok("Data has been save", res);
              }
            }
          );
        }
      }
    }
  );
};

//cost

exports.createTransactionOutProject = function (req, res) {
  var description = req.body.description;
  var amount = req.body.amount;
  var date = req.body.date;
  var project_id = req.body.project_id;
  var account_id = req.body.account_id;
  var project_number = req.body.project_number;
  var connection_table = "out_transaction_project";
  connection.query(
    "INSERT INTO out_transaction_project(date,description,amount,project_id,account_id) values(?,?,?,?,?)",
    [date, description, amount, project_id, account_id],
    function (error, out_transaction_project, fields) {
      if (error) {
        console.log(error);
      } else {
        let connection_id = out_transaction_project["insertId"];
        connection.query(
          "INSERT transactions_project(date,description,amount,type,project_id,connection_id,connection_table) values(?,?,?,?,?,?,?)",
          [
            date,
            description,
            amount,
            "out",
            project_id,
            connection_id,
            connection_table,
          ],
          function (error, transactions_project, fields) {
            if (error) {
              console.log(error);
            } else {
              // response.ok("Data has been save",res)

              connection_hrd.query(
                "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                [
                  date,
                  amount,
                  `${[project_number]} | ${description}`,
                  "out",
                  account_id,
                  `${connection_id}_${connection_table}`,
                ],
                function (error, rows) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.editTransactionOutProject = function (req, res) {
  var description = req.body.description;
  var amount = req.body.amount;
  var date = req.body.date;
  var project_id = req.body.project_id;
  var project_number = req.body.project_number;
  var account_id = req.body.account_id;
  var connection_table = "out_transaction_project";
  var id = req.params.id;

  connection.query(
    "UPDATE out_transaction_project SET date=?,description=?,amount=? WHERE id=?",
    [date, description, amount, id],
    function (error, out_transaction_project, fields) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "UPDATE transactions_project SET date=?,description=?,amount=? where connection_id=? AND connection_table=?",
          [date, description, amount, id, connection_table],
          function (error, transactions_project, fields) {
            if (error) {
              console.log(error);
            } else {
              // response.ok("Data has been updated",res)

              connection_hrd.query(
                "UPDATE transaction_account SET date=?,description=?,amount=?,account_id=? where transaction_id=?",
                [
                  date,
                  `${project_number} | ${description}`,
                  amount,
                  account_id,
                  `${id}_${connection_table}`,
                ],
                function (error, rows, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log(id);

                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getAllCostProject = function (req, res) {
  var project_id = req.params.project_id;
  connection.query(
    "SELECT * , A.id as id    FROM db_magentaeo.out_transaction_project A JOIN magenta_hrd.bank_accounts B ON  A.account_id = B.id where project_id=?",
    [project_id],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

exports.deleteCostProject = function (req, res) {
  var id = req.params.id;
  var connection_table = "out_transaction_project";
  connection.query(
    "DELETE FROM out_transaction_project where id=?",
    [id],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "DELETE FROM transactions_project where connection_id=? AND connection_table=?",
          [id, connection_table],
          function (error, rows, fields) {
            if (error) {
              console.log(error);
            } else {
              //  response.ok("Data has been save",res)

              connection_hrd.query(
                "DELETE FROM transaction_account where transaction_id=?",
                [`${id}_${connection_table}`],
                function (error, rows, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

//in out transactions
exports.getInOutTransactions = function (req, res) {
  connection.query(
    "SELECT count(*) as count  FROM in_out_transactions",
    function (error, count, fields) {
      if (error) {
        console.log(error);
      } else {
        var d = new Date();
        var month = d.getMonth() + 1;
        var month = "00".substr(String(month).length) + month;
        var year = d.getFullYear();
        var date = d.getDate();
        var date = "00".substr(String(date).length) + date;
        var count = count[0]["count"] + 1;
        var counter = "000".substr(String(count).length) + count;
        var project_number = "IO-EO" + date + month + year + "-" + counter;
        response.ok(project_number, res);
      }
    }
  );
};

exports.getAccount = function (req, res) {
  connection_hrd.query(
    "SELECT * FROM  bank_accounts WHERE type='eo' OR type='open'",
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

// in out transaction
exports.createInOutTransaction = function (req, res) {
  var inout_number = req.body.inout_number;
  var date = req.body.date;
  var description = req.body.description;
  var amount = req.body.amount;
  var in_account = req.body.in_account;
  var out_account = req.body.out_account;

  connection.query(
    "INSERT INTO in_out_transactions(inout_number,date,description,amount,in_account,out_account) Values(?,?,?,?,?,?)",
    [inout_number, date, description, amount, in_account, out_account],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection_hrd.query(
          "INSERT INTO transaction_account(date,description,type,amount,account_id,transaction_id)VALUES(?,?,?,?,?,?)",
          [date, description, "in", amount, in_account, inout_number],
          function (error, out_transaction, fields) {
            if (error) {
              console.log(error);
            } else {
              connection_hrd.query(
                "INSERT INTO transaction_account(date,description,type,amount,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                [date, description, "out", amount, out_account, inout_number],
                function (error, in_transaction, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.editInOutTransaction = function (req, res) {
  var inout_number = req.body.inout_number;
  var date = req.body.date;
  var description = req.body.description;
  var amount = req.body.amount;
  var in_account = req.body.in_account;
  var out_account = req.body.out_account;

  connection.query(
    "UPDATE in_out_transactions SET date=?,description=?,amount=?,in_account=?,out_account=? WHERE inout_number=?",
    [date, description, amount, in_account, out_account, inout_number],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        connection_hrd.query(
          "UPDATE transaction_account SET date=?,description=?,amount=?,account_id=? WHERE transaction_id=? AND type=?",
          [date, description, amount, in_account, inout_number, "in"],
          function (error, out_transaction, fields) {
            if (error) {
              console.log(error);
            } else {
              connection_hrd.query(
                "UPDATE transaction_account SET date=?,description=?,amount=?,account_id=? WHERE transaction_id=? AND type=?",
                [date, description, amount, out_account, inout_number, "out"],
                function (error, in_transaction, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getAllInOutTransaction = function (req, res) {
  var data_transactions = [];
  var account_name_in;
  var account_name_out;

  connection.query(
    "SELECT * FROM in_out_transactions ",
    function (error, in_out_transactions, fields) {
      if (error) {
        console.log(error);
      } else {
        in_out_transactions.map((values, index) => {
          connection_hrd.query(
            "SELECT * FROM bank_accounts where id=?",
            [values.in_account],
            function (error, bank_name_in) {
              if (error) {
                console.log(error);
              } else {
                connection_hrd.query(
                  "SELECT * FROM bank_accounts where id=?",
                  [values.out_account],
                  function (error, bank_name_out) {
                    if (error) {
                      console.log(error);
                    } else {
                      var data = {
                        id: values.id,
                        inout_number: values.inout_number,
                        description: values.description,
                        date: values.date,
                        amount: values.amount,
                        account_in_id: bank_name_in[0].id,
                        account_out_id: bank_name_out[0].id,
                        account_in_name: bank_name_in[0].bank_name,
                        account_out_name: bank_name_out[0].bank_name,
                        account_in_number: bank_name_in[0].account_number,
                        account_out_number: bank_name_out[0].account_number,
                      };
                      data_transactions.push(data);

                      if (in_out_transactions.length <= index + 1) {
                        response.ok(data_transactions, res);
                      }
                    }
                  }
                );
              }
            }
          );
        });
      }
    }
  );
};

exports.deleteInOutTransaction = function (req, res) {
  var id = req.params.id;
  connection.query(
    "DELETE FROM in_out_transactions where inout_number=?",
    [id],
    function (error) {
      if (error) {
      } else {
        connection_hrd.query(
          "DELETE FROM transaction_account where transaction_id=?",
          [id],
          function (error) {
            if (error) {
              console.log(error);
            } else {
              connection_hrd.query(
                "DELETE FROM transaction_account where transaction_id=?",
                [id],
                function (error) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been saved", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

//faktur

// exports.getAllFakturUnFinished=function(req,res){
//     connection.query("SELECT * FROM faktur WHERE pembayaran > total_faktur",function(error,rows){
//         if (error){
//             console.log(error)

//         }else{
//             response.ok(rows,res)

//         }
//     })
// }

//QE
exports.getAllFakturPayment = function (req, res) {
  let id = req.params.id;

  connection.query(
    "SELECT *, projects.grand_total as total_project_cost , quotations.quotation_number as quotation_number FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number JOIN projects ON projects.id=quotations.project_id JOIN customer ON customer.id=quotations.id_customer WHERE (projects.status='approved' OR projects.status='closed') AND faktur.total_faktur=faktur.pembayaran AND customer.id=? ",
    [id],
    function (error, finished) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "SELECT *, projects.grand_total as total_project_cost , quotations.quotation_number as quotation_number FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number JOIN projects ON projects.id=quotations.project_id JOIN customer ON customer.id=quotations.id_customer WHERE projects.status='approved' AND  customer.id=? AND  (pembayaran < total_faktur OR pembayaran is null)   ",
          [id],
          function (error, unfinished) {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "SELECT COUNT(*)as amount FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number JOIN projects ON projects.id=quotations.project_id JOIN customer ON customer.id=quotations.id_customer WHERE projects.status='approved' AND total_faktur=pembayaran AND customer.id=?",
                [id],
                function (error, count_finished) {
                  if (error) {
                    console.log("3");
                    console.log(error);
                  } else {
                    connection.query(
                      "SELECT COUNT(*) as amount FROM faktur JOIN quotations ON faktur.quotation_number=quotations.quotation_number JOIN projects ON projects.id=quotations.project_id JOIN customer ON customer.id=quotations.id_customer WHERE projects.status='approved' AND (pembayaran < total_faktur OR pembayaran is null) AND customer.id=?",
                      [id],
                      function (error, count_unfinished) {
                        if (error) {
                          console.log("4");
                          console.log(error);
                        } else {
                          var data = {
                            total_faktur_finished: count_finished[0],
                            total_faktur_unfinished: count_unfinished[0],
                            unfinished_faktur: unfinished,
                            finished_faktur: finished,
                          };
                          response.ok(data, res);
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

//QO
exports.getAllFakturPaymentQO = function (req, res) {
  let id = req.params.id;

  connection.query(
    "SELECT *, quotation_other.quotation_number as quotation_number FROM faktur JOIN quotation_other ON faktur.quotation_number=quotation_other.quotation_number JOIN customer ON customer.id=quotation_other.id_customer WHERE faktur.quotation_number like '%QO%' AND  faktur.total_faktur=faktur.pembayaran AND customer.id=? ",
    [id],
    function (error, finished) {
      if (error) {
        console.log("1");
        console.log(error);
      } else {
        connection.query(
          "SELECT *, quotation_other.quotation_number as quotation_number FROM faktur JOIN quotation_other ON faktur.quotation_number=quotation_other.quotation_number  JOIN customer ON customer.id=quotation_other.id_customer WHERE faktur.quotation_number like '%QO%' AND  customer.id=? AND  (pembayaran < total_faktur OR pembayaran is null)   ",
          [id],
          function (error, unfinished) {
            if (error) {
              console.log("2");
              console.log(error);
            } else {
              connection.query(
                "SELECT COUNT(*)as amount FROM faktur JOIN quotation_other ON faktur.quotation_number=quotation_other.quotation_number JOIN customer ON customer.id=quotation_other.id_customer WHERE faktur.quotation_number like '%QO%'  AND total_faktur=pembayaran AND customer.id=?",
                [id],
                function (error, count_finished) {
                  if (error) {
                    console.log("3");
                    console.log(error);
                  } else {
                    connection.query(
                      "SELECT COUNT(*) as amount FROM faktur JOIN quotation_other ON faktur.quotation_number=quotation_other.quotation_number  JOIN customer ON customer.id=quotation_other.id_customer WHERE faktur.quotation_number like '%QO%' AND (pembayaran < total_faktur OR pembayaran is null) AND customer.id=?",
                      [id],
                      function (error, count_unfinished) {
                        if (error) {
                          console.log("4");
                          console.log(error);
                        } else {
                          var data = {
                            total_faktur_finished: count_finished[0],
                            total_faktur_unfinished: count_unfinished[0],
                            unfinished_faktur: unfinished,
                            finished_faktur: finished,
                          };
                          response.ok(data, res);
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getPaymentNumber = function (req, res) {
  connection.query(
    "SELECT count(*) as count  FROM payment_faktur",
    function (error, count, fields) {
      if (error) {
        console.log(error);
      } else {
        var d = new Date();
        var month = d.getMonth() + 1;
        var month = "00".substr(String(month).length) + month;
        var year = d.getFullYear();
        var date = d.getDate();
        var date = "00".substr(String(date).length) + date;
        var count = count[0]["count"] + 1;
        var counter = "000".substr(String(count).length) + count;
        var project_number = "TR-" + date + month + year + "-" + counter;
        response.ok(project_number, res);
      }
    }
  );
};

exports.creteTransactionFaktur = function (req, res) {
  var total_amount = req.body.total_amount;

  var transaction_number = req.body.transaction_number;
  var account_id = req.body.account_id;
  var description = req.body.description;
  var payment_faktur = req.body.payment_faktur;
  var data_transactions = req.body.data_transactions;
  //var transactiond_data=req.body.trnsaction_data;
  var date = req.body.date_transaction;
  var customer_id = req.body.customer_id;
  console.log(date);
  connection.query(
    "INSERT INTO payment_faktur(transaction_number,amount,account_id,date,description,customer_id) VALUES (?,?,?,?,?,?)",
    [
      transaction_number,
      total_amount,
      account_id,
      date,
      description,
      customer_id,
    ],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        var data_transaction_item = data_transactions;

        connection.query(
          "INSERT INTO payment_faktur_item(amount,transaction_number,faktur_number,account_id) VALUES ?",
          [data_transaction_item],
          function (error, rows) {
            if (error) {
              console.log(error);
            } else {
              console.log(payment_faktur);

              payment_faktur.map((value, index) => {
                if (value.amount > 0) {
                  connection.query(
                    "UPDATE faktur SET pembayaran=? WHERE faktur_number=?",
                    [value.total_pembayaran_faktur, value.faktur_number],
                    function (error, rows) {
                      if (error) {
                        console.log(error);
                      } else {
                        if (value.acount_beban == false) {
                          connection_hrd.query(
                            "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                            [
                              date,
                              value.amount,
                              `${transaction_number}/${value.faktur_number}/${description}`,
                              "in",
                              value.account_id,
                              transaction_number,
                            ],
                            function (error, rows, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                connection.query(
                                  "SELECT id FROM projects WHERE project_number=?",
                                  [value.project_number],
                                  function (error, project_id) {
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      connection.query(
                                        "INSERT INTO transactions_project(date,description,amount,type,project_id,connection_id,connection_table) VALUES(?,?,?,?,?,?,?)",
                                        [
                                          date,
                                          `${value.quotation_number}/${value.project_number}/${description}`,
                                          value.amount,
                                          "in",
                                          project_id[0].id,
                                          transaction_number,
                                          "payment_faktur",
                                        ],
                                        function (error, rows) {
                                          if (error) {
                                            console.log(error);
                                          } else {
                                            // in account piutang
                                            connection_hrd.query(
                                              "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                                              [
                                                date,
                                                value.amount,
                                                `${transaction_number}/${value.faktur_number}/${description}`,
                                                "out",
                                                "108",
                                                `${value.faktur_number}_payment_faktur`,
                                              ],
                                              function (error, fields) {
                                                if (error) {
                                                  console.log(error);
                                                } else {
                                                  if (
                                                    index + 1 >=
                                                    payment_faktur.length
                                                  ) {
                                                    response.ok(
                                                      "Data has been save",
                                                      res
                                                    );
                                                  }
                                                }
                                              }
                                            );
                                          }
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            }
                          );
                        } else {
                          //account beban
                          if (account_id === "0") {
                            connection_hrd.query(
                              "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                              [
                                date,
                                value.amount,
                                `${transaction_number}/${value.faktur_number}/${description}`,
                                "in",
                                "101",
                                `${value.faktur_number}_payment_faktur`,
                              ],
                              function (error, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  if (index + 1 >= payment_faktur.length) {
                                    response.ok("Data has been save", res);
                                  }
                                }
                              }
                            );
                          } else {
                            //account_beban;
                            connection_hrd.query(
                              "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                              [
                                date,
                                value.amount,
                                `${transaction_number}/${value.faktur_number}/${description}`,
                                "in",
                                "101",
                                `${value.faktur_number}_payment_faktur`,
                              ],
                              function (error, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  connection_hrd.query(
                                    "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                                    [
                                      date,
                                      value.amount,
                                      `${transaction_number}/${value.faktur_number}/${description}`,
                                      "out",
                                      account_id,
                                      `${value.faktur_number}_payment_faktur_beban`,
                                    ],
                                    function (error, fields) {
                                      if (error) {
                                        console.log(error);
                                      } else {
                                        if (
                                          index + 1 >=
                                          payment_faktur.length
                                        ) {
                                          response.ok(
                                            "Data has been save",
                                            res
                                          );
                                        }
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      }
                    }
                  );
                }
              });
            }
          }
        );
      }
    }
  );
};

//payment
exports.creteTransactionFakturQO = function (req, res) {
  var total_amount = req.body.total_amount;
  var transaction_number = req.body.transaction_number;
  var account_id = req.body.account_id;
  var description = req.body.description;
  var payment_faktur = req.body.payment_faktur;
  var data_transactions = req.body.data_transactions;
  //var transactiond_data=req.body.trnsaction_data;
  var date = req.body.date_transaction;
  var customer_id = req.body.customer_id;
  console.log(date);
  connection.query(
    "INSERT INTO payment_faktur(transaction_number,amount,account_id,date,description,customer_id) VALUES (?,?,?,?,?,?)",
    [
      transaction_number,
      total_amount,
      account_id,
      date,
      description,
      customer_id,
    ],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        var data_transaction_item = data_transactions;

        connection.query(
          "INSERT INTO payment_faktur_item(amount,transaction_number,faktur_number,account_id) VALUES ?",
          [data_transaction_item],
          function (error, rows) {
            if (error) {
              console.log(error);
            } else {
              console.log(payment_faktur);

              payment_faktur.map((value, index) => {
                if (value.amount > 0) {
                  connection.query(
                    "UPDATE faktur SET pembayaran=? WHERE faktur_number=?",
                    [value.total_pembayaran_faktur, value.faktur_number],
                    function (error, rows) {
                      if (error) {
                        console.log(error);
                      } else {
                        if ((value.account_beban = false)) {
                          connection_hrd.query(
                            "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                            [
                              date,
                              value.amount,
                              `${transaction_number}/${value.faktur_number}/${description}`,
                              "in",
                              value.account_id,
                              transaction_number,
                            ],
                            function (error, rows, fields) {
                              if (error) {
                                console.log(error);
                              } else {
                                connection_hrd.query(
                                  "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                                  [
                                    date,
                                    value.amount,
                                    `${transaction_number}/${value.faktur_number}/${description}`,
                                    "out",
                                    "108",
                                    transaction_number,
                                  ],
                                  function (error, rows, fields) {
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      if (index + 1 >= payment_faktur.length) {
                                        response.ok("Data has been save", res);
                                      }
                                    }
                                  }
                                );
                                // if (index + 1 >= payment_faktur.length) {
                                //   response.ok("Data has been save", res);
                                // }
                              }
                            }
                          );
                        } else {
                          if (value.account_id == "0") {
                            connection_hrd.query(
                              "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                              [
                                date,
                                value.amount,
                                `${transaction_number}/${value.faktur_number}/${description}`,
                                "in",
                                "101",
                                transaction_number,
                              ],
                              function (error, rows, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  if (index + 1 >= payment_faktur.length) {
                                    response.ok("Data has been save", res);
                                  }
                                }
                              }
                            );
                          } else {
                            connection_hrd.query(
                              "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                              [
                                date,
                                value.amount,
                                `${transaction_number}/${value.faktur_number}/${description}`,
                                "in",
                                "101",
                                transaction_number,
                              ],
                              function (error, rows, fields) {
                                if (error) {
                                  console.log(error);
                                } else {
                                  connection_hrd.query(
                                    "INSERT INTO transaction_account(date,amount,description,type,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                                    [
                                      date,
                                      value.amount,
                                      `${transaction_number}/${value.faktur_number}/${description}`,
                                      "out",
                                      value.account_id,
                                      transaction_number,
                                    ],
                                    function (error, rows, fields) {
                                      if (error) {
                                        console.log(error);
                                      } else {
                                        if (
                                          index + 1 >=
                                          payment_faktur.length
                                        ) {
                                          response.ok(
                                            "Data has been save",
                                            res
                                          );
                                        }
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      }
                    }
                  );
                }
              });
            }
          }
        );
      }
    }
  );
};

exports.getTransactionsfaktur = function (req, res) {
  // let date=require("dateformat")
  let data_transactions = [];
  connection.query(
    "SELECT * FROM payment_faktur ORDER BY id DESC",
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        if (rows.length > 0) {
          rows.map((value, index) => {
            connection.query(
              "SELECT * FROM customer WHERE  id=?",
              [value.customer_id],
              function (error, customers) {
                if (error) {
                  console.log(error);
                } else {
                  connection_hrd.query(
                    "SELECT * FROM bank_accounts where id=?",
                    [value.account_id],
                    function (eror, accounts) {
                      if (error) {
                        console.log(error);
                      } else {
                        var data = {
                          id: value.id,
                          transaction_number: value.transaction_number,
                          amount: value.amount,
                          description: value.description,
                          date:
                            value.date != null
                              ? dateFormat(value.date, "dd/mm/yyyy")
                              : "",
                          customer:
                            customers.length > 0 ? customers[0] : customers,
                          account: accounts.length > 0 ? accounts[0] : accounts,
                        };
                        data_transactions.push(data);

                        if (index + 1 >= rows.length) {
                          response.ok(data_transactions, res);
                        }
                      }
                    }
                  );
                }
              }
            );
          });
        } else {
          response.ok(rows, res);
        }
      }
    }
  );
};

exports.getTransactionsfakturDetail = function (req, res) {
  let payment_item = [];
  let id = req.params.id;

  connection.query(
    "SELECT * FROM  payment_faktur WHERE id=? ",
    [id],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        if (rows.length > 0) {
          connection_hrd.query(
            "SELECT * FROM bank_accounts WHERE id=?",
            [rows[0].account_id],
            function (error, accounts) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "SELECT * FROM customer where id=?",
                  [rows[0].customer_id],
                  function (error, customers) {
                    if (error) {
                      console.log(error);
                    } else {
                      connection.query(
                        "SELECT * FROM payment_faktur_item WHERE transaction_number=?",
                        [rows[0].transaction_number],
                        function (error, payment_faktur_item) {
                          if (error) {
                            console.log(error);
                          } else {
                            var data = {
                              id: rows[0].id,
                              transaction_number: rows[0].transaction_number,
                              amount: rows[0].amount,
                              date:
                                rows[0].date != null
                                  ? dateFormat(rows[0].date, "dd/mm/yyyy")
                                  : "",
                              description: rows[0].description,
                              item: payment_faktur_item,
                              customer:
                                customers.length > 0 ? customers[0] : customers,
                              account:
                                accounts.length > 0 ? accounts[0] : accounts,
                            };
                            response.ok(data, res);
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          console.log("r");
          response.ok(rows, res);
        }
      }
    }
  );
};

exports.detailPaymentInvoice = function (req, res) {
  var data_incvoice = [];
  var faktur_number = req.params.faktur_number;
  connection.query(
    "SELECT *, customer.name as customer_name FROM faktur  JOIN quotations On quotations.quotation_number=faktur.quotation_number JOIN customer ON quotations.id_customer=customer.id  where faktur_number=?",
    [faktur_number],
    function (error, faktur) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "SELECT * FROM in_transactions JOIN pic_tb ON in_transactions.pictb_id=pic_tb.id JOIN pic_event ON pic_event.id_event=pic_tb.pic_id where faktur_id=?",
          [faktur[0].id_faktur],
          function (error, in_transactions) {
            if (error) {
              console.log(error);
            } else {
              connection.query(
                "SELECT *  FROM   db_magentaeo.payment_faktur_item A JOIN magenta_hrd.bank_accounts B ON  A.account_id = B.id JOIN payment_faktur ON payment_faktur.transaction_number=A.transaction_number where faktur_number=?",
                [faktur_number],
                function (error, payment_faktur) {
                  if (error) {
                    console.log(error);
                  } else {
                    in_transactions.map((value, index) => {
                      var data = {
                        amount: value.amount,
                        date: value.in_date,
                        description: value.description,
                        pic_name: value.pic_name,
                        jabatan: value.jabatan,
                        email: value.email,
                        customer: faktur[0].customer_name,
                        bank_name: null,
                      };
                      payment_faktur.push(data);

                      if (index + 1 >= in_transactions.length) {
                        const sortedActivities = payment_faktur.sort(
                          (a, b) => b.date - a.date
                        );
                        response.ok(sortedActivities, res);
                      }
                    });

                    // data={
                    //     in_transactions:in_transactions,
                    //     payment_faktur:payment_faktur
                    // }
                    // data_incvoice.push(in_transactions[0])
                    // data_incvoice.push(payment_faktur[0])
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.detailPaymentInvoice = function (req, res) {
  var data_incvoice = [];
  var faktur_number = req.params.faktur_number;

  connection.query(
    "SELECT * FROM faktur WHERE faktur_number=?",
    [faktur_number],
    function (error, quotation) {
      if (error) {
        console.log(error);
      } else {
        var id = quotation[0].quotation_number.substr(0, 2);

        if (id == "QE") {
          connection.query(
            "SELECT *, customer.name as customer_name FROM faktur  JOIN quotations On quotations.quotation_number=faktur.quotation_number JOIN customer ON quotations.id_customer=customer.id  where faktur_number=?",
            [faktur_number],
            function (error, faktur) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "SELECT * FROM in_transactions JOIN pic_tb ON in_transactions.pictb_id=pic_tb.id JOIN pic_event ON pic_event.id_event=pic_tb.pic_id where faktur_id=?",
                  [faktur[0].id_faktur],
                  function (error, in_transactions) {
                    if (error) {
                      console.log(error);
                    } else {
                      connection.query(
                        "SELECT *  FROM   db_magentaeo.payment_faktur_item A JOIN magenta_hrd.bank_accounts B ON  A.account_id = B.id JOIN payment_faktur ON payment_faktur.transaction_number=A.transaction_number where faktur_number=?",
                        [faktur_number],
                        function (error, payment_faktur) {
                          if (error) {
                            console.log(error);
                          } else {
                            in_transactions.map((value, index) => {
                              var data = {
                                amount: value.amount,
                                date: value.in_date,
                                description: value.description,
                                pic_name: value.pic_name,
                                jabatan: value.jabatan,
                                email: value.email,
                                customer: faktur[0].customer_name,
                                bank_name: null,
                              };
                              payment_faktur.push(data);

                              if (index + 1 >= in_transactions.length) {
                                const sortedActivities = payment_faktur.sort(
                                  (a, b) => b.date - a.date
                                );
                                response.ok(sortedActivities, res);
                              }
                            });

                            // data={
                            //     in_transactions:in_transactions,
                            //     payment_faktur:payment_faktur
                            // }
                            // data_incvoice.push(in_transactions[0])
                            // data_incvoice.push(payment_faktur[0])
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          connection.query(
            "SELECT *, customer.name as customer_name FROM faktur  JOIN quotation_other On quotation_other.quotation_number=faktur.quotation_number JOIN customer ON quotation_other.id_customer=customer.id  where faktur_number=?",
            [faktur_number],
            function (error, faktur) {
              if (error) {
                console.log(error);
              } else {
                connection.query(
                  "SELECT * FROM in_transactions JOIN pic_tb ON in_transactions.pictb_id=pic_tb.id JOIN pic_event ON pic_event.id_event=pic_tb.pic_id where faktur_id=?",
                  [faktur[0].id_faktur],
                  function (error, in_transactions) {
                    if (error) {
                      console.log(error);
                    } else {
                      connection.query(
                        "SELECT *  FROM   db_magentaeo.payment_faktur_item A JOIN magenta_hrd.bank_accounts B ON  A.account_id = B.id JOIN payment_faktur ON payment_faktur.transaction_number=A.transaction_number where faktur_number=?",
                        [faktur_number],
                        function (error, payment_faktur) {
                          if (error) {
                            console.log(error);
                          } else {
                            in_transactions.map((value, index) => {
                              var data = {
                                amount: value.amount,
                                date: value.in_date,
                                description: value.description,
                                pic_name: value.pic_name,
                                jabatan: value.jabatan,
                                email: value.email,
                                customer: faktur[0].customer_name,
                                bank_name: null,
                              };
                              payment_faktur.push(data);

                              if (index + 1 >= in_transactions.length) {
                                const sortedActivities = payment_faktur.sort(
                                  (a, b) => b.date - a.date
                                );
                                response.ok(sortedActivities, res);
                              }
                            });

                            // data={
                            //     in_transactions:in_transactions,
                            //     payment_faktur:payment_faktur
                            // }
                            // data_incvoice.push(in_transactions[0])
                            // data_incvoice.push(payment_faktur[0])
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};

exports.piutang = function (req, res) {
  const transaction_id = req.body.transaction_id;
  const date = req.body.date;
  const description = req.body.description;
  const amount = req.body.amount;
  const account_id = req.body.account_id;

  connection_hrd.query(
    "INSERT  INTO transaction_account (date,amount,description,type,transaction_id,account_id) VALUES (?,?,?,?,?,?) ",
    [date, amount, description, "in", transaction_id, "100"],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        response.ok("Data has been save", res);
      }
    }
  );
};

exports.addSaldoPICTB = function (req, res) {
  const date = req.body.date;
  const description = req.body.description;
  const id = req.body.id;
  const amount = req.body.amount;
  const account_id = req.body.account_id;
  const name = req.body.name;

  var connection_table = "add_saldo_pictb";

  connection.query(
    "INSERT add_saldo_pictb(date,description,amount,pictb_id,account_id) value(?,?,?,?,?)",
    [date, description, amount, id, account_id],
    function (error, rows, fields) {
      if (error) {
        console.log(error);
      } else {
        var add_saldo_id = rows["insertId"];
        connection.query(
          "INSERT INTO transaction_tb(date,description,amount,type,id_pictb,connection_id,connection_table) value(?,?,?,?,?,?,?)",
          [date, description, amount, "in", id, add_saldo_id, connection_table],
          function (error, transactions, fields) {
            if (error) {
              console.log(error);
            } else {
              connection_hrd.query(
                "INSERT INTO transaction_account (amount,date,type,description,account_id,transaction_id) VALUES (?,?,?,?,?,?)",
                [
                  amount,
                  date,
                  "in",
                  `${description} / TB:${name}`,
                  account_id,
                  `${add_saldo_id}_add_saldo_tb`,
                ],
                function (error, fields) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.getAddSaldoPicTB = function (req, res) {
  const id = req.params.id;
  connection.query(
    "SELECT * , A.id as id ,B.id as account_id FROM   db_magentaeo.add_saldo_pictb A JOIN magenta_hrd.bank_accounts B ON  A.account_id = B.id where pictb_id=?",
    [id],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        response.ok(rows, res);
      }
    }
  );
};

exports.deleteAddSaldoPicTB = function (req, res) {
  const id = req.params.id;
  const account_id = `${id}_add_saldo_tb`;
  console.log(id);

  connection.query(
    "DELETE FROM add_saldo_pictb where id=?",
    [id],
    function (error, rows) {
      if (error) {
        console.log(error);
      } else {
        connection.query(
          "DELETE FROM transaction_tb where connection_id=? AND connection_table=? ",
          [id, "add_saldo_pictb"],
          function (error, fields) {
            if (error) {
              console.log(error);
            } else {
              connection_hrd.query(
                "DELETE FROM transaction_account where transaction_id=?",
                [account_id],
                function (error, rows) {
                  if (error) {
                    console.log(error);
                  } else {
                    response.ok("Data has been save", res);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};
