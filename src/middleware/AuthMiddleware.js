const dotenv  = require('dotenv').config()
const jwt = require('jsonwebtoken')
const authMiddleware =( req,res,next)=>{
    let token =req.headers.authorization
    if(token == undefined){
        res.status(403).send()
    }
    else{
        token = token.split(' ')[1]
        console.log(token)
        try {
            jwt.verify(
                token,
                process.env.SecretKey,
                (err,decoded)=>{
                    if (err){
                            res.status(403).send()
                    }
                    else{
                        req.body.pk_user_id = decoded.pk_user_id
                        next()
                    }
                })
    
        } catch (err) {
            console.log(err)
            res.status(500).send()
        }
    }
}

module.exports = {authMiddleware}