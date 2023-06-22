const model=require('../models/lookup')
const ObjectID = require('mongodb').ObjectId;

exports.productAdd=async function(req,res){
    try{
        const result =await model.Product.create(req.body)
        if(result){
            res.send({status:1,mssg:"",data:result})
        }else{
            res.send({status:0,mssg:"",data:[]})
        }
    }catch(err){
        res.send({mssg:err.message})
    }
}

exports.customerAdd=async function(req,res){
    try{
        const result =await model.Customer.create(req.body)
        if(result){
            res.send({status:1,mssg:"",data:result})
        }else{
            res.send({status:0,mssg:"",data:[]})
        }
    }catch(err){
        res.send({mssg:err.message})
    }
}


exports.orderAdd=async function(req,res){
    try{
        const result =await model.Order.create(req.body)
        if(result){
            res.send({status:1,mssg:"",data:result})
        }else{
            res.send({status:0,mssg:"",data:[]})
        }
    }catch(err){
        res.send({mssg:err.message})
    }
}


exports.orderLookup = async function (req, res) {
    try {
        // const fieldName = 'quantity';
        const pipeline = [
            {
              $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
              }
            },
            {
              $unwind: '$product' // Unwind the "product" array field
            },
            {
              $lookup: {
                from: 'customers',
                localField: 'customerId',
                foreignField: '_id',
                as: 'customer'
              }
            },
            {
              $unwind: '$customer' // Unwind the "customer" array field
            },
            {
                $sort: {
                    'product.name': 1
                }
            },
            // {
            //     $count: 'totalDocuments'
            //   },
            {
                $addFields: {
                  totalAmount: { $multiply: ['$quantity', '$product.price'] }
                }
            }
            // {
            //     $group: {
            //       _id: '$customer.name',
            //       totalOrders: {
            //         $sum: 1
            //       },
            //       totalQuantity: {
            //         $sum: '$quantity'
            //       },
            //       totalPrice: {
            //         $sum: { $multiply: ['$quantity', '$product.price'] }
            //       }
            //     }
            //   }

            // {
                // $group: {
                //   _id: '$customer.name',
                //   totalOrders: {
                //     $sum: 1
                //   },
                //   totalQuantity: {
                //     $sum: '$quantity'
                //   }
                // }
            // }
            // {
            //     $group: {
            //       _id: '$customer.name',
            //       totalOrders: {
            //         $sum: 1
            //       },
            //       totalQuantity: {
            //         $sum: `$${fieldName}` // Use $field to dynamically refer to the specified field
            //       }
            //     }
            //   }
            // Add more stages or transformations as needed
          ];
        const result = await model.Order.aggregate(pipeline).exec()
        // console.log(result)
        if (result) {
            res.send({ status: 1, mssg: "", data: result })
        } else {
            res.send({ status: 0, mssg: "", data: [] })
        }
    } catch (err) {
        res.send({ mssg: err.message })
    }
}