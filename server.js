const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const app = require("./app")


process.env.NODE_ENV="development"
// console.log(process.env)

const port = process.env.PORT || 8001
app.listen(port, ()=> {
    console.log(`App running on port ${port}`)
})
