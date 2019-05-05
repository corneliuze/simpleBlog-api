const {findByToken} = require('../model/users');

const authenticate = (req, res, next) =>{
    const token = req.header('x-auth');
   
    findByToken(token).then((user) => {


        if (!user) {
            return Promise.reject();
        }
        res.send(user);
        next();
    }).catch((e) => {
        console.log('error is', e);
       
})}

module.exports = authenticate

