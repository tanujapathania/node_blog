const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // Configure multer if needed
const {
    registerUser,
    loginUser,
    forgetPassword,
    resetPassword,
    getProfileData,
    editProfile,
    editPassword,
} = require('../Controller/auth/userController')

router.post("/signup", upload.none(), registerUser)
router.post("/signin", upload.none(), loginUser);
router.post("/forgetPassword", upload.none(), forgetPassword);
router.post("/resetPassword", upload.none(), resetPassword);
router.post("/getProfileData", upload.none(), getProfileData);
router.put("/editProfile", editProfile);
router.put("/editPassword", editPassword);

module.exports = router;