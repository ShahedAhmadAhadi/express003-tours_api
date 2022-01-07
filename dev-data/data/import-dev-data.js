const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('../../models/tourModel')
const User = require('../../models/userModel')
const Review = require('../../models/reviewModel')

dotenv.config({path: './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
}).then(() => {
    console.log('db successfull')
})

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))

// import data to db
const importData = async() => {
    try{
        await Tour.create(tours)
        await User.create(users, { validateBeforeSave: false })
        await Review.create(reviews)

        console.log('data loaded')
        process.exit()
    }catch (error) {

    }
}

// delete all collection data
const deleteData = async () => {
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('data deleted!')
        process.exit()
    }catch (error) {

    }
}

if(process.argv[2] === '--import'){
    importData()
}
if(process.argv[2] === '--delete'){
    deleteData()
}

console.log(process.argv)

