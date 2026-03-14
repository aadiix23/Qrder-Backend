const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { createUserValidator } = require("../Validator/authValidator");

router.post("/register", createUserValidator, userController.register);
router.post("/verify-otp", userController.verifyOtp);
router.post("/login",userController.login)

module.exports = router;
