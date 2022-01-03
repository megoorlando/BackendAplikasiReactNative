const express = require("express")
const userLoginRoute = express.Router()
const mySql = require('../database/MySql')

userLoginRoute.get(
    '/userLogin', 
    (req, res)=>{
        try{
            mySql.query(
                'SELECT user_id, username, phone_number, email_user FROM ms_userlogin',
                (error, results, fields)=>{
                    if(error) throw error;
    
                    res.send({
                        message:'Data UserLogin',
                        data:results
                    })
            })
        }catch(err){
            res.status(500).send(err)
        }
    }
)

userLoginRoute.get(
    '/userLogin/:id/', 
    (req, res)=>{
        const {id} = req.params;

        try{
            mySql.query(
                `SELECT username, phone_number, email_user FROM ms_userlogin WHERE user_id = ${id}`,
                (error, results, fields)=>{
                    if(error) throw error;
                    
                    if(results.length == 0){
                        res.status(404).send({message:'Data Not Found'})
                    }else{
                        res.send({
                            message:'Search UserLogin',
                            data:results
                        })
                    }
            })
        }catch(err){
            res.status(500).send(err)
        }
    }
)

userLoginRoute.post(
    '/userLogin', 
    (req, res)=>{
        const {username, password, phoneNumber, email} = req.body;
        try{
            mySql.query(
                `INSERT INTO ms_userlogin 
                VALUES(DEFAULT, '${username}','${password}', '${phoneNumber}', '${email}')`,
                (error, results, fields)=>{
                    if(error) throw error;
                    
                    res.send({
                        message:'Data Created',
                        data:results
                })
            })
        }catch(err){
            res.status(500).send(err)
        }
    }
)

module.exports = userLoginRoute