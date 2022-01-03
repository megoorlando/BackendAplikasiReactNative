const express = require("express")
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const LoginRouteP = express.Router()
const mySql = require('../database/MySql')
const {authMiddleware} = require ('../middleware/AuthMiddleware')
const dotenv  = require('dotenv').config()
const jwt = require('jsonwebtoken')
const secretKey = process.env.SecretKey

//Register
LoginRouteP.post(
    '/Register',
    (req, res)=>{
        const {name, phone, city,email,password} = req.body;
        let bytes  = CryptoJS.AES.decrypt(password, secretKey);
        let originalText = bytes.toString(CryptoJS.enc.Utf8);
        const hash =  bcrypt.hashSync(originalText, 10);
        try{ 
            mySql.query(
                `INSERT INTO ms_login (login_email,login_password)
                VALUES ('${email}','${hash}') `,
                (error, results, fields)=>{
                    if(error) throw error;
    
                    console.log(results.insertId)   
    
                    //GENERATE QUERY
                    let query = `insert into ms_user(user_name,user_about,user_telp,user_photoprofile,fk_city_id,fk_login_id) 
                    VALUES ('${name}',' ','${phone}','blank-profile-picture-973460_1280-1-300x300.jpg','${city}',${results.insertId})`
    
                    console.log(query)
                    
                    mySql.query(
                        query,
                        (error, results, fields)=>{
                            if(error) throw error;
    
                            res.status(200).json({
                                message: 'success!',
                            });
                        }
                    )
                    
                })}catch(err){
            res.status(500).send(err)
        }
            
    }
)


//login
LoginRouteP.post('/Login',(req, res)=>{

    const {email, password} = req.body;

    let bytes  = CryptoJS.AES.decrypt(password, secretKey);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);

    try{
            mySql.query(
                `SELECT login_password,pk_user_id FROM ms_login a JOIN ms_user b 
                    ON a.pk_login_id = b.fk_login_id
                    WHERE login_email = '${email}'`,
                (error, results, fields)=>{  if(error) throw error;

                    let password = results[0].login_password

                    const condition = bcrypt.compareSync(originalText, password)

                    if(condition==true) {
                        let token =jwt.sign({pk_user_id :results[0].pk_user_id}, secretKey)
                        res.status(200).json({
                            message:'Login!',
                            data :token
                        })
                    }else{
                        res.status(401).json({
                            message:'Invalid Credential'
                        })

                    }

                })

    }catch{

        res.status(500).send()

    }
}

)

module.exports = LoginRouteP