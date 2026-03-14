const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        //already User
        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exist" })
        }
        //hashed Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //generate otp 
        const otp = Math.floor(100000 + Math.random() * 900000);

        //Create A New User
        const newUser = new User({
            email: req.body.email,
            password: hashedPassword,
            roles: req.body.roles || "admin",
            otp: otp,
            otpExpiry: Date.now() + 5 * 60 * 1000
        })
        const savedUser = await newUser.save();

        //sendOtpEmail
        await sendEmail(savedUser.email, "Verify Your Email", `Your OTP is ${otp}`);

        return res.status(201).json({
            message: "OTP Sent Successfully",
            user: {
                id: savedUser._id,
                email: savedUser.email,
                roles: savedUser.roles
            }
        });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (user.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            })
        }
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({
                message: "OTP Expired"
            })
        }
        user.isverified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        const token = jwt.sign(
            { id: user._id, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            message: "OTP Verified Successfully",
            token
        })
    } catch (error) {
        return res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (!user.isverified) {
            return res.status(400).json({ message: "The Email Is Not Verified For The User" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        const token = jwt.sign(
            { id: user._id, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({ message: "Login Sucessful",token})


    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message })
    }
}

exports.resendOtp = async(req,res)=>{
    try {
        const {email} = req.body;
        const user = await  User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User Not Found"})
        }
        if(user.isverified){
            return res.status(400).json({message:"User Already Verified"})
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();
        await sendEmail(user.email, "Verify Your Email", `Your OTP is ${otp}`);

        return res.status(201).json({
            message: "OTP Sent Successfully",
            user: {
                id: user._id,
                email: user.email,
                roles: user.roles
            }
        });


    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        if (!user.isverified) {
            return res.status(400).json({ message: "User Email Is Not Verified" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendEmail(user.email, "Password Reset", `Your OTP for Password Reset is ${otp}`);

        return res.status(200).json({ message: "OTP Sent Successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // Verify OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Check OTP expiry
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP Expired" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        return res.status(200).json({ message: "Password Reset Successful" });
    } catch (error) {
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};