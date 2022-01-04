const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'error',
        results: users.lenght,
        data: {
            users
        }
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This'
    })
}
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This'
    })
}
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This'
    })
}
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This'
    })
}