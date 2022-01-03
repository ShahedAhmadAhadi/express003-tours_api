const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
// const tours =JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

// exports.checkID = (req, res, next, value) => {
//     if (value * 1 > tours.length) {
//         return res.status(404).json({status: 'Failed', message: 'Invalid ID'})
//     }
//     next()
// }

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty'
    next()
}

exports.getAllTours = async (req, res) => {
    try {
        // Execute Query
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        const tours = await features.query
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

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 }}
            },
            {
                $group: {
                    _id: { $toUpper : '$difficulty'},
                    numTours: { $sum: 1},
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: {
                    avgPrice: 1
                }
            },
            // {
            //     $match: {
            //         _id: { $ne: 'EASY' }
            //     }
            // }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numToursStart: { $sum: 1 },
                    tours: {$push: "$name"}
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0,
                }
            },
            {
                $sort: { numToursStart: -1 }
            },
            {
                $limit: 12
            }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    } catch (error) {
        res.status(404).json({
            status: "Failed",
            message: error
        })
    }
}

