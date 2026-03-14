const { body } = require("express-validator");
exports.createUserValidator = [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("roles").optional().isIn(["admin", "chef", "superadmin"]).withMessage("Invalid role")
]