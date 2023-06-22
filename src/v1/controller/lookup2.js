const model=require('../models/lookup2')
const ObjectId  = require("mongodb").ObjectId;


exports.customerAdd=async function(req,res){
    try {
        const result = await model.CustomerLook.create(req.body)
        // console.log(result)
            if (result) {
                res.send({ status: 1, mssg: "", data: result })
            } else {
                res.send({ status: 0, mssg: "", data: [] })
            }
        // } else {
        //     res.send({ status: 0, mssg: "Invalid request", data: [] })
        // }
    } catch (err) {
        res.send({ mssg: err.message })
    }
}


exports.orderAdd=async function(req,res){
    try{
        const result =await model.OrderLook.create(req.body)
        if(result){
            res.send({status:1,mssg:"",data:result})
        }else{
            res.send({status:0,mssg:"",data:[]})
        }
    }catch(err){
        res.send({mssg:err.message})
    }
}



exports.pipelineLookup = async function (req, res) {
    const customerId = req.body.customerId
    if (!ObjectId.isValid(customerId)) {
        return res.send({ status: 0, message: "Invalid customerId", data: [] });
    }
    const resp = await model.CustomerLook.findById({ _id: customerId })
    if (resp) {
        const pipeline = [
            {
                $facet: {
                    orders: [
                        // {
                        //     $count: 'totalDocuments'
                        //   },
                        // Stage 1: Look up the customer details
                        {
                            $lookup: {
                                from: "customerlooks",
                                localField: "customerId",
                                foreignField: "_id",
                                as: "customer"
                            }
                        },
                        {
                            $unwind: "$customer"
                        },

                        {
                            $match: {
                                "customer._id": new ObjectId(customerId)
                            }
                        },
                        // Stage 2: Project only the necessary fields
                        {
                            $project: {
                                orderNumber: 1,
                                totalPrice: 1,
                                // createdAt:1,
                                customer:1
                                // customer: {
                                //     $arrayElemAt: ["$customer", 0]
                                // }
                            }
                        },
                 
                    ]
                }
            }
        ]
        const result = await model.OrderLook.aggregate(pipeline).exec()
        if (result) {
            res.send({ status: 1, mssg: "", data: result })
        } else {
            res.send({ status: 0, mssg: "", data: [] })
        }
    } else {
        res.send({ status: 0, mssg: "Invalid data", data: [] })
    }
}


exports.equal=async function(req,res){  ///$eq used or   $expr or  $let
    const totalprice=req.body.totalPrice
    const pipeline=[{
        $facet:{
            order:[
                {
                    $match: {
                      $expr: {
                        $let: {
                          vars: {
                            targetTotalPrice: totalprice 
                            // Assigning "totalprice" to the variable
                          },
                          in: {
                            $eq: ["$totalPrice", "$$targetTotalPrice"]
                          }
                        }
                      }
                    }
                }
            ]
        }
    }]

    const result=await model.OrderLook.aggregate(pipeline)
    if(result){
        res.send({status:1,mssg:"",data:result})
    }else{
        res.send({status:0,mssg:"",data:[]})
    }

}