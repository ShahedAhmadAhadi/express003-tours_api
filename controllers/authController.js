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

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    res.status(statusCode).json({
        status: 'success',
        user,
        token
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    createSendToken(newUser, 201, res)
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

    createSendToken(user, 200, res)

})

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
  
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  
    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }
  
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  });

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

    createSendToken(user, 200, res)

}

exports.updatePassword = catchAsync(async (req, res, next) => {
    console.log(req.user)
    const user = await User.findById(req.user.id).select('+password')

    if ( !(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    createSendToken(user, 200, res)

})
