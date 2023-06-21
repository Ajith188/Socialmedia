const modelUser = require('../models/user')
const modelPost=require('../models/post')
const ObjectID = require('mongodb').ObjectId;


exports.createPost=async function(req,res){
    const userId=req.body.userId
    if (!ObjectID.isValid(userId)) {
        res.send({ status: 0, message: "Invalid userId", data: [] });
        return;
      }
    try{
        const resp=await modelUser.UserModel.findById({_id:userId})
        if(resp){
            const data=await modelPost.PostModel.create(req.body)
            if(data!=0){
                res.send({status:1,mssg:"Created successfully post",data:data})
            }else{
                res.send({status:0,mssg:"",data:[]})
            }
        }else{
            res.send({status:0,mssg:"InvalidId Data",data:[]})
        }
    }catch(err){
        res.send({mssg:err.message})
    } 
}


exports.getPost=async function(req,res){
    const data=req.body.id
    if (!ObjectID.isValid(data)) {
        res.send({ status: 0, message: "Invalid Id", data: [] });
        return;
      }
      try{
        const result=await modelPost.PostModel

      }catch(err){
        res.send({mssg:err.message})
      }
}