const express = require('express')
const multer = require("multer")
const ChoiceRoute = express.Router()

const mySql = require('../database/MySql')



//get City
ChoiceRoute.get('/GetCity', (req, res)=>{
    try{
        mySql.query(
            `SELECT * FROM ms_city ORDER BY city_name`,
            (error, results, fields)=>{
                if(error) throw error;  
                res.status(200).json({
                    message: 'get City success!',
                    City:results
                });
            })
    }catch{
        res.status(500).send();
    }
})


// get Category

ChoiceRoute.get('/GetCategory', (req, res)=>{
    try{
        mySql.query(
            `SELECT * FROM ms_category`,
            (error, results, fields)=>{
                if(error) throw error;  
                res.status(200).json({
                    message: 'get Category Success',
                    Category:results
                });
            })
    }catch{
        res.status(500).send();
    }
})




ChoiceRoute.get('/DualChoice',  (req, res)=>{
    try{
        mySql.query(
            ` SELECT * FROM ms_city  order by city_name`,
            (error, city, fields)=>{
                if(error) throw error;

                mySql.query(
                    `SELECT * FROM ms_category`,
                    (error, category, fields)=>{
                        if(error) throw error;

                        res.status(200).json({
                            message: 'success!',
                            data:{
                                city,category
                            }
                        });
                    }
                )     
            })
    }catch{
        res.status(500).send();
    }
})


module.exports = ChoiceRoute