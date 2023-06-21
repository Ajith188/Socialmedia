const model = require('../models/user')
const bcrypt = require('bcrypt')
const ObjectID = require('mongodb').ObjectId;



//////Postmon are not working or vs code also used postman model-(Thunder-client)////

exports.register = async function (req, res) {
  try {
    const num = await model.UserModel.countDocuments({ username: req.body.username })
    // console.log("0000",req.body.username)
    if (num == 0) {
      if (req.body.password == req.body.confirmpassword) {
        req.body.password = await bcrypt.hash(req.body.password, 10)
        const result = await model.UserModel.create(req.body)
        if (result) {
          res.send({ status: 1, msg: 'successfully register', data: result })
        } else {
          res.send({ status: 0, msg: 'Account is not register', data: [] })
        }
      } else {
        res.send({ status: 0, msg: 'password does not match', data: [] })
      }
    } else {
      res.send({ status: 0, msg: 'username already exists', data: [] })
    }
  } catch (err) {
    res.send({ message: err.message })
  }
}

exports.login = async function (req, res) {
  const { username, password } = req.body
  try {
    const usrname = await model.UserModel.findOne({ username: username })
    if (usrname) {
      const password = await bcrypt.compare(req.body.password, usrname.password)
      if (password) {
        res.send({ status: 1, message: "login successfully", data: usrname })
      } else {
        res.send({ status: 0, message: "Wrong password", data: [] })
      }
    } else {
      res.send({ status: 0, message: "Invalid data", data: [] })
    }
  } catch (err) {
    res.send({ message: err.message })
  }
}

exports.info = async function (req, res) {
  try {
    const data = req.body.id
    if (data) {
      const result = await model.UserModel.findById({ _id: data })
      if (result) {
        res.send({ status: 1, message: "Info data ", data: result })
      } else {
        res.send({ status: 0, message: "Inavlid data", data: [] })
      }
    } else {
      res.send({ status: 0, message: "Inavlid Request", data: [] })
    }

  } catch (err) {
    res.send({ message: err.message })
  }
}


exports.update = async function (req, res) {
  const id = req.body.id;
  // console.log(id)
  const { password } = req.body;
  if (id === req.body.id) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(password, salt);
      const result = await model.UserModel.findByIdAndUpdate(id, req.body, { new: true });
      if (result) {
        res.send({ status: 1, message: "Update the data ", data: result })
      } else {
        res.send({ status: 0, message: "Should not update the data ", data: [] })
      }
    } catch (err) {
      res.send({ message: err.message })
    }
  } else {
    res.send({ status: 0, message: "invalid request", data: [] })
  }
}


exports.remove = async function (req, res) {
  const id = req.body.id
  // const { currentUserId, currentAdminstatus } = req.body
  if (id) {
    try {
      const result = await model.UserModel.findByIdAndDelete(id)
      if (result) {
        res.send({ status: 1, message: "User Deleted Successfully" })
      } else {
        res.send({ status: 0, message: "invalid request", data: [] })
      }
    } catch (err) {
      res.send({ message: err.message })
    }
  } else {
    res.send({ status: 0, message: "Access denied yo can onlu deleted", data: [] })
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
    const total = await model.UserModel.countDocuments(query)
    const totalCount = await model.UserModel.countDocuments();
    const Page = Math.ceil(limit);
    const currentPage = parseInt(page, 10) || 1;
    const skip = (currentPage - 1) * limit;
    const result = await model.UserModel.find(query)
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

exports.followUser = async (req, res) => {
  const userId = req.body.UserId;
  const followers = req.body.followersId;
  // Check if userId is valid
  if (!ObjectID.isValid(userId)) {
    res.send({ status: 0, message: "Invalid userId", data: [] });
    return;
  }
  // Check if followers is an array
  if (!Array.isArray(followers)) {
    res.send({ status: 0, message: "Invalid data", data: [] });
    return;
  }
  // Check if all follower IDs are valid
  const areAllIdsValid = followers.every((followerId) =>
    ObjectID.isValid(followerId)
  );
  if (!areAllIdsValid) {
    res.send({
      status: 0,
      message: "Some or all of the followersId are invalid",
      data: [],
    });
    return;
  }
  const user = await model.UserModel.findById({ _id: userId });
  if (user) {
    const followersData = await model.UserModel.find({ _id: { $in: followers } });
    if (followersData.length === followers.length) {
      // Check if the user is already followed by any of the followers
      const alreadyFollowedUsers = followersData.filter((follower) =>
        follower.following.includes(userId)
      );
      if (alreadyFollowedUsers.length > 0) {
        res.send({
          status: 0,
          message: "User is already followed by some of the followers!",
          data: alreadyFollowedUsers.map((follower) => follower._id),
        });
      } else {
        // Add the user to the following list of each follower
        const followerUpdates = followersData.map((follower) =>
          model.UserModel.updateOne({ _id: follower._id }, { $addToSet: { following: userId } }));
        await Promise.all(followerUpdates);
        // Add each follower to the followers list of the user
        await model.UserModel.updateOne({ _id: userId }, { $addToSet: { followers: { $each: followers } } });
        res.send({ status: 1, message: "User followed by all followers!" });
      }
    } else {
      res.send({
        status: 0,
        message: "Some or all of the followersId are invalid",
        data: [],
      });
    }
  } else {
    res.send({ status: 0, message: "Invalid userId", data: [] });
  }
};

exports.unFollowUser = async (req, res) => {
  const followerId = req.body.UserId;
  const unfollowers = req.body.unfollowersId;
  // Check if followerId is valid
  if (!ObjectID.isValid(followerId)) {
    res.send({ status: 0, message: "Invalid followerId", data: [] });
    return;
  }
  // Check if unfollowers is an array
  if (!Array.isArray(unfollowers)) {
    res.send({ status: 0, message: "Invalid data", data: [] });
    return;
  }
  // Check if all unfollower IDs are valid
  const areAllIdsValid = unfollowers.every((unfollowerId) =>
    ObjectID.isValid(unfollowerId)
  );
  if (!areAllIdsValid) {
    res.send({
      status: 0,
      message: "Some or all of the unfollowersId are invalid",
      data: [],
    });
    return;
  }
  const user = await model.UserModel.findById({ _id: followerId });
  if (user) {
    const unfollowersData = await model.UserModel.find({ _id: { $in: unfollowers } });
    if (unfollowersData.length === unfollowers.length) {
      // Check if the user is followed by any of the unfollowers
      const followersUnfollowing = unfollowersData.filter((unfollower) =>
        unfollower.following.includes(followerId)
      );
      if (followersUnfollowing.length > 0) {
        // Remove the user from the following list of each unfollower
        const unfollowerUpdates = followersUnfollowing.map((unfollower) =>
          model.UserModel.updateOne(
            { _id: unfollower._id },
            { $pull: { following: followerId } }
          )
        );
        await Promise.all(unfollowerUpdates);
        // Remove each unfollower from the followers list of the user
        await model.UserModel.updateOne(
          { _id: followerId },
          { $pull: { followers: { $in: unfollowers } } }
        );

        res.send({
          status: 1,
          message: "User unfollowed by selected unfollowers!",
        });
      } else {
        res.send({
          status: 0,
          message: "User is not followed by any of the unfollowers!",
        });
      }
    } else {
      res.send({
        status: 0,
        message: "Some or all of the unfollowersId are invalid",
        data: [],
      });
    }
  } else {
    res.send({ status: 0, message: "Invalid followerId", data: [] });
  }
}



