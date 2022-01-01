const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const app = require("./app")

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// mongoose.connect(process.env.DATABASE_LOCAL, {
mongoose.connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
}).then(() => {
    console.log('db successfull')
})


process.env.NODE_ENV="development"
// console.log(process.env)

const port = process.env.PORT || 8001
app.listen(port, ()=> {
    console.log(`App running on port ${port}`)
})
