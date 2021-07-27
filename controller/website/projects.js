

const model=require('../../model/index')
const {Op}=require('sequelize')
const controller ={}


controller.getProjects=async function(req,res){
    try{
        await model.projects.findAll({
          
        })
        .then((result)=>{
            if (result.length>0){
                res.status(200).json({
                    code:200,
                    
                    data:result
                })
            }else{
                res.status(200).json({
                    message:"empty data",
                    data:[]
                })
            }
        })
    } catch(error){
        res.status(404).json({
            code:404,
            message:error

        })
    }
}

module.exports=controller