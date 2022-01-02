class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }

    filter () {
        // 1) Filtring
        const queryObj = {...this.queryString}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])
        // 2) Advanced Filtring
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    
        this.query = this.query.find(JSON.parse(queryStr))
        return this;
    }

    // 3) sorting
    sort () {
        if(this.queryString.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    // 4) field limiting
    limitFields () {
        if (this.queryString.fields) {
            const fields = req.query.fields.split(',').join(' ');
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }
        return this;
    }
    // 5) pagination
    paginate () {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)

        return this;
    }
}

module.exports = APIFeatures
