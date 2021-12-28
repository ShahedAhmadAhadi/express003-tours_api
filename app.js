const fs = require('fs')
const express = require('express')

const app = express()

app.get('/', (req, res) => {
    res.status(200).send('Hello from the server')
})

const tours =JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        stauts: 'success',
        result: tours.lenght,
        data: {
            tours
        }
    })
})

const port = 8001
app.listen(port, ()=> {
    console.log(`App running on port ${port}`)
})
