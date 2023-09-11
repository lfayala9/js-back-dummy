import express from "express";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../config/multer.js";
import { uploadFile } from "../utils/uploadFile.js";
import deleteImg from "../utils/deleteFile.js";
import { io } from "../index.js";
const route = express.Router();

// Create Posts
route.post(
  "/",
  verifyToken,
  upload.fields([{ name: "picture", maxCount: 1 }]),
  async (req, res) => {
    const { userId, postContent } = req.body;
    const picture = req.files.picture;
    const user = await User.findById(userId);
    try {
      if (picture && picture.length > 0) {
        const { downloadURL } = await uploadFile(picture[0], 700);

        const createPost = new Post({
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          postContent,
          userPicture: user.picture,
          picture: downloadURL,
          friends: user.friends,
          likes: {},
          comments: [],
        });
        await createPost.save();
        const post = await Post.find();
        res.status(201).json(post);
        io.emit("new-post", createPost);
        console.log("New post created: " + createPost.id);
      } else {
        const createPost = new Post({
          userId,
          firstName: user.firstName,
          lastName: user.lastName,
          location: user.location,
          postContent,
          userPicture: user.picture,
          friends: user.friends,
          picture,
          likes: {},
          comments: [],
        });
        await createPost.save();
        const post = await Post.find();
        res.status(201).json(post);
        io.emit("new-post", createPost);
        console.log("New post created: " + createPost.id);
      }
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }
);

// Get all posts
route.get("/", verifyToken, async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});
//Get single post

route.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

//Get a user posts
route.get("/by/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

//Like Post
route.patch("/:id/like/:userId", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.params;
  try {
    const post = await Post.findById(id);
    const liked = post.likes.get(userId);

    if (liked) {
      post.likes.delete(userId);
      io.emit("unlike-post", id)
      console.log('unlike')
    } else {
      post.likes.set(userId, true);
      io.emit("like-post", id);
      console.log('like')
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
});

//Delete Post

route.delete("/:id", (req, res) => {
  const { id } = req.params;
  Post.findByIdAndRemove(id)
    .then((data) => {
      if (data.picture) {
        deleteImg(data.picture);
        console.log("Deleted post with picture");
        res.json(data);
      } else {
        res.json(data);
      }
    })
    .catch((error) => res.status(404).json({ message: error }));
  console.log("Deleted Post:", id);
  io.emit("deleted-post", id);
});

export default route;
