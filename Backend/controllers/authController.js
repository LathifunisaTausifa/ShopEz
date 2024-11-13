const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');
const ErrorHandler = require('../utils/errorhandler')
const sendToken = require('../utils/jwt')
const crypto = require('crypto')

//Register User - /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password, avatar } = req.body;
    const user = await User.create({
        name, email, password, avatar
    });

    sendToken(user, 201, res)

})

//Login User - /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter Email and Password', 400))
    }
    //fetching user data fr0m db
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password for User', 401))
    }
    //checking if password is correct
    if (!await user.isValidPassword(password)) {
        return next(new ErrorHandler('Invalid Email or Password', 401))
    }
    sendToken(user, 201, res)
})


//Logout - /api/v1/logout
exports.logoutUser = (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    }).status(200).json({
        success: true,
        message: "Logged Out"
    })
}


//Forgot Password - /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }
    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false })

    //create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `Your Password reset url is as follows \n\n ${resetUrl} \n\n If you havent initiated this action kindly ignore it`

    try {
        sendEmail({
            email: user.email,
            subject: "LATCART PASSWORD RECOVERY",
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: " false" })
        return next(new ErrorHandler(err.message), 500)
    }
})


//Reset Password - /api/v1/password/reset/:token
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: {
            $gt: Date.now()
        }
    })

    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or expired'));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false })
    sendToken(user, 201, res)

})

//get user profile - {{base_url}}/api/v1/myprofile
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })
})

//change password
exports.changePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    //check old password
    if (! await user.isValidPassword(req.body.oldPassword)) {
        return next(new ErrorHandler("Old Password is Incorrect", 401))
    }
    //update password
    user.password = req.body.password;
    await user.save()
    res.status(200).json({
        success: true
    })
})

//Update Profile - /api/v1/update
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    let newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success: true,
        user
    })

})


//Admin: Get All Users - /api/v1/admin/users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
         success: true,
         users
    })
 })
 
 //Admin: Get Specific User - api/v1/admin/user/:id
 exports.getUser = catchAsyncError(async (req, res, next) => {
     const user = await User.findById(req.params.id);
     if(!user) {
         return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
     }
     res.status(200).json({
         success: true,
         user
    })
 });
 
 //Admin: Update User - api/v1/admin/user/:id
 exports.updateUser = catchAsyncError(async (req, res, next) => {
     const newUserData = {
         name: req.body.name,
         email: req.body.email,
         role: req.body.role
     }
 
     const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
         new: true,
         runValidators: true,
     })
 
     res.status(200).json({
         success: true,
         user
     })
 })
 
 //Admin: Delete User - api/v1/admin/user/:id
 exports.deleteUser = catchAsyncError(async (req, res, next) => {
     const user = await User.findById(req.params.id);
     if(!user) {
         return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
     }

     await user.deleteOne({ _id: req.params.id });
     res.status(200).json({
         success: true,
     })
 })