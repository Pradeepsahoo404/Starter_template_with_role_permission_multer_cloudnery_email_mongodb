export class ApiError extends Error {
    constructor(statusCode , message = "Something Went Wrong" , errors = []){
        super(message)
        this.statusCode = statusCode,
        this.data = [],
        this.message = message ,
        this.success = false,
        this.errors = errors
    }
}