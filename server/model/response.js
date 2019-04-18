class Response {
    constructor (code, message, res, error, data){
        this.code = code;
        this.message = message;
        this.res = res;
        this.error = error;
        this.data = data;
        
    }
    response_message(){
        return this.res.send({
            code : this.code,
            message : this.message,
            error : this.error,
            data : this.data,
        });
    }
}
module.exports = Response;