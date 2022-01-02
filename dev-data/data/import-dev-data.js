const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('../../models/tourModle')

dotenv.config({path: './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
}).then(() => {
    console.log('db successfull')
})

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// import data to db
const importData = async() => {
    try{
        await Tour.create(tours)
        console.log('data loaded')
        process.exit()
    }catch (error) {

    }
}

// delete all collection data
const deleteData = async () => {
    try{
        await Tour.deleteMany()
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

