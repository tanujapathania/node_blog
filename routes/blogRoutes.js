const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({});

const upload = multer({ storage });

const {
    createPost,
    getPost,
    getPostsByCategory,
    deletePost,
    uploadImageToCloudinary,
    editPost
} = require('../Controller/blogController')

router.post("/createPost", upload.single("image"), createPost)
router.post("/uploadImageToCloudinary", upload.single("image"), uploadImageToCloudinary)
router.get("/getPost", getPost)
router.get("/getPostsByCategory", getPostsByCategory)
router.delete("/deletePost", deletePost)
router.put("/editPost", upload.single("none"), editPost)

module.exports = router;