const Tour = require('../models/tourModle')
// const tours =JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkID = (req, res, next, value) => {
//     if (value * 1 > tours.length) {
//         return res.status(404).json({status: 'Failed', message: 'Invalid ID'})
//     }
//     next()
// }

exports.checkBody = (req, res, next) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).json({status: 'Failed', message: 'Messing name or Price'})
    }
    next()
}

exports.getAllTours = (req, res) => {
    res.status(200).json({
        stauts: 'success',
        requestAt: req.requestTime,
        data: {
            // tours
        }
    })
}

exports.getTour = (req, res) => {
    const id = req.params.id * 1;
    res.status(200).json({
        stauts: 'success',
        data: {
            tour
        }
    })
}

exports.createTour = (req, res) => {
    // // const newId = tours[tours.length - 1].id + 1;
    console.log(newId)
    const newTour = Object.assign({id: newId}, req.body);
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
}

exports.updateTour = (req, res) => {
    res.status(200).json({status: 'success', data: {tour: "<Updated tour here>"}})
}

exports.deleteTour = (req, res) => {
    res.status(204).json({status: 'success', data: null})
}

