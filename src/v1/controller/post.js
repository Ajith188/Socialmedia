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
        const result=await modelPost.PostModel.findById({_id:data})
        if(result){
            res.send({status:1,msg:"",data:result})
        }else{
            res.send({status:0,msg:"",data:[]})
        }
      }catch(err){
        res.send({mssg:err.message})
      }
}

exports.list = async function (req, res) {
    try {
      let { page, limit } = req.body;
      const sortField = req.body.sortField; // Sort field parameter
      // const sortOrder = req.body.sortOrder === 'desc' ? 1 : -1;
      const sortOrder = req.body.sortOrder
      //  'desc' -1 : 'asc'1;
      let query = {}
      if (req.body.filter)
        query['$and'] = req.body.filter
      const sortObj = {};
      sortObj[sortField] = sortOrder;
      const total = await modelPost.PostModel.countDocuments(query)
      const totalCount = await modelPost.PostModel.countDocuments();
      const Page = Math.ceil(limit);
      const currentPage = parseInt(page, 10) || 1;
      const skip = (currentPage - 1) * limit;
      const result = await modelPost.PostModel.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
      if (result != 0) {
        res.send({ status: 1, msg: '', totalCount, filterData: total, limit: Page, currentPage, result })
      } else {
        res.send({ status: 0, msg: '', data: [] });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }


exports.update = async function (req, res) {
    const id = req.body.id
    if (!ObjectID.isValid(id)) {
        res.send({ status: 0, message: "Invalid Id", data: [] });
        return;
    }
    const userId = req.body.userId
    if (!ObjectID.isValid(userId)) {
        res.send({ status: 0, message: "Invalid userId", data: [] });
        return;
    }
    const resp = await modelUser.UserModel.findById({ _id: userId })
    if (resp) {
        const result = await modelPost.PostModel.findByIdAndUpdate({ _id: id }, req.body, { new: true })
        if (result) {
            res.send({ status: 1, message: "Update the data ", data: result })
        } else {
            res.send({ status: 0, message: "Should not update the data ", data: [] })
        }
    } else {
        res.send({ status: 0, msg: "InvalidId data", data: [] })
    }
}  


exports.remove = async function (req, res) {
    const id = req.body.id
    if (!ObjectID.isValid(id)) {
        res.send({ status: 0, message: "Invalid Id", data: [] });
        return;
    }
    const result = await modelPost.PostModel.findByIdAndDelete({ _id: id })
    if (result) {
        res.send({ status: 1, mssg: '' })
    } else {
        res.send({ status: 0, mssg: '', data: [] })
    }
}




exports.like = async function (req, res) {
    try {
        const userId = req.body.userId;
        const postIds = req.body.postIds;
        if (!ObjectID.isValid(userId)) {
            return res.send({ status: 0, message: "Invalid userId", data: [] });
        }
        if (!Array.isArray(postIds)) {
            return res.send({ status: 0, message: "Invalid postIds", data: [] });
        }
        const user = await modelPost.PostModel.findById({ _id: userId });
        if (!user) {
            return res.send({ status: 0, message: "Invalid user", data: [] });
        }
        const posts = await modelPost.PostModel.find({ _id: { $in: postIds } });
        if (!posts) {
            return res.send({ status: 0, message: "Invalid posts", data: [] });
        }
        // const updatedPosts = [];

        for (const post of posts) {
            if (post.likes.includes(userId)) {
                await modelPost.PostModel.updateOne(
                    { _id: post._id },
                    { $pull: { likes: userId } }
                );
                // updatedPosts.push({ ...post.toObject(), liked: false });
                res.send({ status: 1, message: "Post Dislike updated",liked: false });
            } else {
                await modelPost.PostModel.updateOne(
                    { _id: post._id },
                    { $addToSet: { likes: userId } }
                );
                // updatedPosts.push({ ...post.toObject(), liked: true });
                res.send({ status: 1, message: "Post likes updated",liked: true });
            }
        }
    } catch (error) {
        console.error(error);
        res.send({ status: 0, message: "An error occurred", data: [] });
    }
};
  
  
exports.getTimelinePost=async function (req,res){
    try{
        const postId=req.body.postId
        if (!ObjectID.isValid(postId)) {
            return res.send({ status: 0, message: "Invalid userId", data: [] });
        }

        const postmodel=await modelPost.PostModel.find({_id:postId})
        const usermodel=await modelUser.UserModel.aggregate([
            // {
            //     $match:{
            //         _id:new mongoose.Types.ObjectId(postId)
            //     }
            // },
            {
                $lookup:{
                    from:"users",
                    localField:"following",
                    foreignField:"userId",
                    as:"followingPosts"
                }
            },
            {
                $project:{
                    followingPosts:1,
                    _id:0
                }
            }
        ])
// console.log(usermodel)
        res.send({status:1,message:"",data:postmodel.concat(usermodel)})

    }catch(err){
        res.send({message:err.message})
    }
}