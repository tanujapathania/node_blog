const UserRegister = require("../../model/auth/register");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserLogin = require("../../model/auth/login");
const emailVerification = require('../../verification/verification')

const multer = require("multer");
const upload = multer(); // Configure multer if needed

const nodemailer = require('nodemailer')



// const nodemailer = require("nodemailer");
// const cloudinary = require("cloudinary").v2;

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: "587",
//     auth: {
//         user: "testingdvtesting@gmail.com",
//         pass: "socp dqcb pbrh gwul",
//     },
//     secureConnection: "false",
//     tls: {
//         ciphers: "SSLv3",
//         rejectUnauthorized: false,
//     },
// });

// cloudinary.config({
//     cloud_name: "djtsjuqyi",
//     api_key: "225368946457134",
//     api_secret: "iGO_xUkipR8D_7a2M6ht7bs3IrA",
// });

// const fs = require("fs");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: "2525",
    secureConnection: "false",
    auth: {
        user: "ca089139e7a956",
        pass: "2b00c2db97e280"
    }
})

// generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const registerUser = async (req, res, next) => {
    // console.log("Received request body:", req.body);
    try {
        const {
            email,
            password,
            name,
            phoneNumber,
        } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Please add all fields" });
        }

        const userExists = await UserRegister.findOne({ email });
        if (userExists) {
            res
                .status(400)
                .json({ success: false, message: "User already exists" });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            //  const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);
            const newUser = new UserRegister({
                email,
                password: hashedPassword,
                name,
                phone: phoneNumber,
            });
            const user = await newUser.save();
            if (user) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message: "User Registered Successfully",
                        data: user,
                        _id: user._id,
                        token: generateToken(user._id),
                        message: "User Registered Successfully",
                        redirect: "Dashboard",
                    });
            } else {
                res
                    .status(400)
                    .json({ success: false, message: "something went Wrong" });
                throw new Error("Invalid user data");
            }
        }
    } catch (error) {
        next(error);
        res
            .status(500)
            .json({ success: false, message: "Internal Server Error", error: error });
    }

};

const loginUser = async (req, res, next) => {
    console.log("Received request body:", req.body);
    try {
        const { email, password } = req.body;
        const user = await UserRegister.findOne({ email });

        if (user && user.deactivated) {
            return res.status(403).json({ message: "Account is deactivated. Please contact support." });
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                _id: user._id,
                token: generateToken(user._id),
                message: "Login successful",
                success: true,
            });
        } else {

            res.status(400).json({ success: false, message: "Invalid credentials" }); // Respond with 400 for invalid credentials
        }
    } catch (error) {
        next(error);
        res.status(500).json({ message: "Server error" });
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;

        const userExists = await UserRegister.findOne({ email })
        console.log(userExists)
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const token = generateToken(userExists.email);
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 1)
        const mailoptions = {
            to: email,
            from: "testing@example.com",
            subject: "Password Reset",
            text: `Reset your password by clicking on the following link \n\n` +
                `http://localhost:5173/resetPassword/${token}\n\n` +
                `If you did not request this, please ignore this email.\n`
        }
        transporter.sendMail(mailoptions, function (err, info) {
            if (err) {
                console.error("Error sending password reset email:", err);
                return res.status(500).json({ success: false, message: "Error sending password reset email" });
            } else {
                console.log("Password reset email sent successfully");
                res.status(200).json({ success: true, message: "Password reset email sent successfully" });
            }
        })
        const verification = new emailVerification({
            receiver: email,
            token: token,
            tokenExpires: expirationTime,
            timestamp: new Date()
        })
        verification.save()
    } catch (error) {
        console.error("Forget password error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { newPassword } = req.body;
        const token = req.query.token

        if (!newPassword) {
            console.log("Error")
            return res.status(404).json({ success: false, message: "No Password Found" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(400).json({ success: false, message: "Invalid or expired token" });
            }

            const email = decoded.id;

            // Fetch the user from the database
            const user = await UserRegister.findOne({ email });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({ success: true, message: "Password updated successfully" });
        })

    } catch (error) {
        next(error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error });
    }
}

const getProfileData = async (req, res) => {
    const { userId } = req.body
    console.log(userId)
    try {
        const user = await UserRegister.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal Server error" })
    }

}

const editProfile = async (req, res) => {
    try {
        const { userId, name, email } = req.body
        const user = await UserRegister.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        // Update the user's name and email if provided
        user.name = name || user.name;
        user.email = email || user.email;

        const updatedUser = await user.save()
        return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });


    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server error" })
    }
}

const editPassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body
        const user = await UserRegister.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword

        const updatedPassword = await user.save()
        return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedPassword });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server error" })
    }



}




module.exports = {
    registerUser,
    loginUser,
    forgetPassword,
    resetPassword,
    getProfileData,
    editProfile,
    editPassword,
}