const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// READ

// Read User
router.get("/", async(req, res)=> {
	const userId = req.query.userId;
	const username = req.query.username;

	try {
		let user;
		if (username) 
			user = await User.findOne({ username });
		else if(userId)
			user = await User.findById(userId);
    else {
      res.status(200).json();
      return;
    }

		const { password, updateAt, ...other } = user._doc;
		res.status(200).json(other)
	} catch (err) {
		res.status(500).json(err);
	}
})

// Read friends
router.get("/friends/:id", async(req, res)=> {
  try {
    const user = await User.findById(req.params.id);
    if(!user) {
      res.status(200).json([]);
      return;
    }
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.length && friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
})

// Read all users
router.get("/all", async(req, res)=> {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.code(500).json(err);
  }
})


// UPDATE

// Update User
router.put("/:id", async(req, res)=> {
	if (req.body.userId === req.params.id) {
		if (req.body.password) {
			try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    const updatedUser = User.findByIdAndUpdate(req.params.id, {
    	$set: req.body,
    }, { upsert: true })
		res.status(200).json("Your account has been updated")
	} else {
		res.status(403).json("You cannot update this account")
	}
})

// Follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cant follow yourself");
  }
});

// Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cant unfollow yourself");
  }
});

// DELETE

// Delete Single User
router.delete("/:id", async(req, res)=> {
  console.log(req.body.userId === req.params.id);
	if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
})


module.exports = router;
