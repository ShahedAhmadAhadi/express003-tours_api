const {promisify} = require('util')
const crypto = require('crypto')
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const sendEmail = require("../utils/email")

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync( async (req, res, next) => {
    const { email, password } = req.body

    if(!email || !password){
        return next(new AppError('Please provide email and password!', 400))
    }

    const user = await User.findOne({email}).select('+password')
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401))
    }

    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })

})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.header.authorization.split(' ')[1]
    }
    if(!token) {
        return next(new AppError('You are not logged in! please login'), 401)
    }
    const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET))

    const freshUser = await User.findById(decoded.id)
    if (!freshUser) {
        return next(new AppError('The User no longer exist'), 401)
    }
    if(freshUser.changedPasswordAfter(decode.iat)){
        return next(new AppError('User recently changed password~ login again', 401))
    }
    req.user = freshUser
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have premission to perform this action', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email})
    if(!user) {
        return next(new AppError('There is no user with this email', 404)) 
    }

    const resetToken = await user.createPasswordResetToken()
    await user.save({validateBeforeSave: false})

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/user/resetPassword/${resetToken}`
    const message = `Forgot your password? submit your PATCH request with new password and confirmPassword to: ${resetURL}.\n
    If you didn't forget your password, please ignore this email`
    await sendEmail({
        email: user.email,
        subject: 'Your password reset Token (10 minutes)',
        message
    })
    try {
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false})

        return next(new AppError('There was error sending email. Try again later'), 500)
    }

    res.status(200).json({
        success: 'success',
        message: 'Token sent to email!'
    })

})

exports.resetPassword = async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}})

    if(!user) {
        return next(new AppError('Token is Invalid or has Expired', 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    const token = signToken(user._id)
    res.status(200).json({
        status: 'success',
        token
    })

}
