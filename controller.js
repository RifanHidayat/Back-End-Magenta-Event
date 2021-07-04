'user strict';

var response=require('./response');
var connection=require('./connection');

exports.index=function(req,res,){
response.ok("aplikasi berjalan",res);
};

//show data quotation
exports.getAllDataQuotations=function(req,res){
    connection.query("SELECT * FROM quotations WHERE status='Final'",function(error,rows,fields){
        if (error){
            connection.log(error);
        }else{
            response.ok(rows,res)
        }
    });
};

//show data project
exports.getAllDataProjects=function(req,res){
    connection.query("SELECT * FROM projects",function(error,rows,fields){
        if (error){
            connection.log(error);
        }else{
            response.ok(rows,res)
        }
    });
};

//insert data  projects
exports.createDataProjects=function(req,res){
    var project_number=req.body.project_number;
    let project_created_date=req.body.project_created_date;
    var project_start_date=req.body.project_start_date;
    var project_end_date=req.body.project_end_date;
    var event_customer=req.body.event_customer;
    var event_pic=req.body.event_pic;
    var description=req.body.description;
    var latitude=req.body.latitude;
    var longitude=req.body.longtitude; 
    var grand_total=req.body.total_project_cost;
    var id_quotation=req.body.id_quotation;
    var quotation_number=req.body.quotation_number;
    var status=req.body.status;



    connection.query("INSERT INTO projects(project_number,project_created_date,project_start_date,project_end_date,event_customer,  event_pic,description,latitude,longtitude,grand_total,id_quotation,quotation_number,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [project_number,
        project_created_date,project_start_date,project_end_date,event_customer,event_pic,description,latitude,longitude,grand_total,id_quotation,quotation_number,status],
        function(error,rows,fields){
        if (error){
            console.log(error)
        }else{
            response.ok("Data have been save",res)
        }
    }
    );

}

//delete project by id
exports.deleteProject=function(req,res){
    var id=req.params.id;
    connection.query("DELETE FROM projects WHERE id=?",[id],(error,rows,fields)=>{
        if (error){
            console.log(error);
        }else{
            response.ok("Data berhasil dihapus",res)
        }
    });

}

exports.getDetailProject=function(req,res){
    var id=req.params.id;
    connection.query("SELECT * FROM projects where id=?",[id],(error,rows,fields)=>{
        if (error){
            console.log(error);
        }else{
            connection.query(`SELECT * FROM quotations WHERE id IN (${rows[0]['id_quotation']})`,(error,quotations,fields)=>{
                
                if (error){
                    console.log(error);

                }else{
                    var data={
                        id:rows[0]['id'],
                        id_quotation:rows[0]['id_quotation'],  
                        project_number:rows[0]['project_number'],
                        quotation_number:rows[0]['quotation_number'],  
                        project_created_date:rows[0]['project_created_date'],
                        project_start_date:rows[0]['project_start_date'],
                        project_end_date:rows[0]['project_end_date'],
                        event_customer:rows[0]["event_customer"],
                        event_pic:rows[0]['event_pic'],
                        latitude:rows[0]['latitude'],
                        longtitude:rows[0]['longtitude'],
                        description:rows[0]['description'],
                        total_project_cost:rows[0]['grand_total'], 
                        members:rows[0]['members'],        
                        quotations:quotations                
                    }

                    response.ok(data,res);

                }
            })
        
        }

    });
}

//get project number
exports.getPojectNumber=function(req,res){
  
    connection.query("SELECT count(*) as count  FROM projects",function(error,count,fields){
        if (error){
            connection.log(error)

        }else{
            var d= new Date();
            var month = d.getMonth()+1;
            var month='00'.substr( String(month).length ) + month; 
            var year=d.getFullYear()
            var date=d.getDate();
            var date='00'.substr( String(date).length ) + date; 
            var count=count[0]['count']+1
            var counter='000'.substr( String(count).length ) +count; 
            var project_number="PN-"+date+month+year+'-'+counter;
            response.ok(project_number,res);
        }


    });
}

exports.editDataProjects=function(req,res){
    var project_number=req.body.project_number;
    let project_created_date=req.body.project_created_date;
    var project_start_date=req.body.project_start_date;
    var project_end_date=req.body.project_end_date;
    var event_customer=req.body.event_customer;
    var event_pic=req.body.event_pic;
    var description=req.body.description;
    var latitude=req.body.latitude;
    var longitude=req.body.longtitude; 
    var grand_total=req.body.total_project_cost;
    var id_quotation=req.body.id_quotation;
    var quotation_number=req.body.quotation_number;
    var id=req.params.id;

    

    connection.query("UPDATE  projects SET project_number=?,project_created_date=?,project_start_date=?,project_end_date=?,event_customer=?,event_pic=?,description=?,latitude=?,longtitude=?,grand_total=?,id_quotation=?,quotation_number=? where id=?",
    [project_number,
        project_created_date,project_start_date,project_end_date,event_customer,event_pic,description,latitude,longitude,grand_total,id_quotation,quotation_number,id],
        function(error,rows,fields){
        if (error){
            console.log(error)
        }else{
            response.ok("Data have been updated",res)
        }
    }
    );

}
