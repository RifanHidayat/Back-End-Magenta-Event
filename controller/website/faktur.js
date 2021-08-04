

const model=require('../../model/index')
const {Op}=require('sequelize')
const db = require('../../database/magenta_eo')
const controller ={}

controller.getFakturUnFinished=async function(req,res){
    try{
        let fakturr=await db.query("SELECT * FROM faktur")

        if (fakturr.length>0){
            res.status(200).json({
                code:200,
                data:faktur
            })

        }else{

            res.status(200).json({
                message:"empty data",
                data:[]
            })

        }
        
    } catch(error){
        res.status(404).json({
            code:404,
            message:`${error} e`

        })
    }
}

module.exports=controller