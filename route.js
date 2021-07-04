'use strict'

//show quotation
module.exports=function(app){
    var json=require('./controller');
    app.route('/').get(json.index);

    //get data quotation
    app.route('/api/quotations')
    .get(json.getAllDataQuotations);
   
    //get  project number
    app.route('/api/projects/project-number')
    .get(json.getPojectNumber)
    //get semua data projects
    app.route('/api/projects')
    .get(json.getAllDataProjects)
    //save projects
    app.route('/api/projects/create-project')
    .post(json.createDataProjects)
    //delete project
    app.route('/api/projects/delete-project/:id')
    .delete(json.deleteProject)
    //detail project
    app.route('/api/projects/detail-project/:id')
    .get(json.getDetailProject)
     //delete project
     app.route('/api/projects/edit-project/:id')
     .patch(json.editDataProjects)
  



}
