class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    search(){
        let keyword = this.queryStr.keyword ? {
            name :{
                $regex : this.queryStr.keyword,
                $options : 'i' //to make search letters case Insensnitive . Eg : "KIT" or "kit" both words wil be displaeyed
            }
        } : {};
        this.query.find({...keyword})
        return this;
    }


    filter(){
        const queryStrCopy = {...this.queryStr}
        //filter - categiry
        //removing the field from query
        const removeFields = ['keyword', 'limit', 'page']
        removeFields.forEach(field=> delete queryStrCopy[field])
        // this.query.find(queryStrCopy);

        //filter- price
        let queryStr = JSON.stringify(queryStrCopy)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)/g , match =>`$${match}`)//to put a $ before the operators
        this.query.find(JSON.parse(queryStr))

        return this;
    }

    paginate(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * currentPage - 1
        this.query.limit(resPerPage).skip(skip)
        return this;
    }
}

module.exports = APIFeatures;