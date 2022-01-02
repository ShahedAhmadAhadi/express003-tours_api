const Tour = require('../models/tourModle')
// const tours =JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkID = (req, res, next, value) => {
//     if (value * 1 > tours.length) {
//         return res.status(404).json({status: 'Failed', message: 'Invalid ID'})
//     }
//     next()
// }

exports.getAllTours = async (req, res) => {
    try {
        // Build Query
        // 1) Filtring
        const queryObj = {...req.query}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])
        // 2) Advanced Filtring
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        const query = Tour.find(JSON.parse(queryStr))
        // Execute Query
        const tours = await query
        // Response
        res.status(200).json({
            stauts: 'success',
            result: tours.length,
            data: {
                tours
            }
        })
        
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error
        })
    }

}

exports.getTour = async (req, res) => {
    console.log(req.params)
    try{
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            stauts: 'success',
            data: {
                tour
            }
        })
    }catch (error){
        res.status(200).json({
            status: "Failed",
            message: error
        })
    }
}

exports.createTour = async (req, res) => {
    // // const newId = tours[tours.length - 1].id + 1;
    // const newTour = new Tour({})
    // newTour.save()

    try{

        const newTour = await Tour.create(req.body)

            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour
                }
            })
    } catch(error){
        res.status(400).json({
            status: "Failed",
            message: error
        })
    }

}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({status: 'success', data: {tour}})
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({status: 'success', data: {tour}})
    }catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error
        })
    }
}

