const express = require("express")
const multer = require("multer")
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const burgerLoginRoute = express.Router()

const mySql = require('../database/MySql')

const secretKey = 'IniKeyCodingID'



burgerLoginRoute.post('/register',  (req, res)=>{
    // console.log(req.headers);
    console.log('file', req.files);
    console.log('body', req.body);
    const {username, password} = req.body;

    let bytes  = CryptoJS.AES.decrypt(password, secretKey);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    const hash =  bcrypt.hashSync(originalText, 10);
    try{
        mySql.query(
            `insert into ms_userlogin(username, password_user) 
            VALUES ('${username}','${hash}')`,
            (error, results, fields)=>{
                if(error) throw error;

                console.log(results.insertId)   

                //GENERATE QUERY
                let query = `INSERT INTO master_userphoto VALUES `
                req.files.forEach((item,index)=>{
                    query  += `(DEFAULT, '${item.filename}', ${results.insertId})`
                    if(index != req.files.length-1){
                        query+=','
                    }
                })

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
                
            })
    }catch{
        res.status(500).send();
    }
})


burgerLoginRoute.get('/photo/:id?', (req, res)=>{
    const {id} = req.query;
    try{
        mySql.query(
            `SELECT * FROM master_userphoto WHERE user_id = ${id}`,
            (error, results, fields)=>{
                if(error) throw error;

                res.status(200).json({
                    message: 'success!',
                    data:results
                });
            })
    }catch{
        res.status(500).send();
    }
})


burgerLoginRoute.post('/login', (req, res)=>{
    const {username, password} = req.body

    let bytes  = CryptoJS.AES.decrypt(password, secretKey);
    let originalText = bytes.toString(CryptoJS.enc.Utf8);

    try{
        mySql.query(
            `SELECT password_user FROM ms_userlogin WHERE username = '${username}' `,
            (error, results, fields)=>{
                if(error) throw error;

                let password = results[0].password_user
                const condition = bcrypt.compareSync(originalText, password);

                if(condition==true){    
                    res.status(200).json({
                        message: 'Login!'
                    });
                }else{
                    res.status('401').json({
                        message: 'Invalid Credential'
                    });
                }
            })
    }catch{
        res.status(500).send();
    }
})
module.exports = burgerLoginRoute