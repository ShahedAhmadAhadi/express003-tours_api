const dotenv = require('dotenv')
const app = require("./app")

dotenv.config()

process.env.NODE_ENV="development"
console.log(process.env)

const port = 8001
app.listen(port, ()=> {
    console.log(`App running on port ${port}`)
})
