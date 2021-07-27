

const model=require('../../model/index')
const {Op}=require('sequelize')
const controller ={}

controller.create=async function(req,res){
    try{
        await model.transaction_project.create({
            date:req.body.date,
            amount:req.body.amount,
            description:req.body.description,
            image:req.body.image,
            type:'out',
            status:req.body.status,
            account_id:req.body.account_id,
            project_id:req.body.project_id,
            
        })
        .then((result)=>{
            //transaction_id =id_project_number
            try{
               // console.log(result.id)
                let transaction_id=`${result.id}_${req.body.project_number}`
                model.accounts.create({
                    date:req.body.date,
                    amount:req.body.amount,
                    description:`${req.body.project_number}/${req.body.description}`,
                    image:req.body.image,
                    type:'in',
                    transaction_id:transaction_id,
                    account_id:req.body.account_id   
                
                })
                .then((result)=>{
                    res.status(200).json({
                    code:200,
                    message:"Data has been save",               
                    data:result
                })


                })
            }catch(error){
                res.status(404).json({
                    code:404,
                    message:error+""
        
                })

            }
                
            
        })
    } catch(error){
        res.status(404).json({
            code:404,
            message:error+""

        })
    }
}

module.exports=controller