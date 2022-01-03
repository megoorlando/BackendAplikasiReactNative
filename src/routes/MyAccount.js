const express = require("express")
const MyAccount = express.Router()
const multer = require("multer")
const mySql = require('../database/MySql');
const { authMiddleware } = require("../middleware/AuthMiddleware");

const storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './public/profile');
    },
    filename(req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({storage});

MyAccount.get('/Dashboard',authMiddleware, (req, res)=>{
    const id = req.body.pk_user_id
    console.log(id)
    try{
        mySql.query(
            `SELECT user_name,user_about,user_photoprofile,AVG(rating_user_value) AS rating,count(rating_user_value) AS rating_count,
            photo_item_name,fk_item_id FROM ms_item a 
            JOIN ms_photo_item b ON a.pk_item_id = b.fk_item_id 
            RIGHT JOIN ms_user c ON a.fk_user_id = c.pk_user_id 
            LEFT JOIN tr_rating_user d ON c.pk_user_id = d.fk_user_id
            WHERE c.pk_user_id = ${id}
            GROUP BY fk_item_id `,
             (error, results, fields)=>{
                if(error) throw error;
                let personalData = {
                        rating : results[0].rating,
                        rating_count: results[0].rating_count,
                        user_about: results[0].user_about,
                        user_name: results[0].user_name,
                        user_photoprofile : results[0].user_photoprofile
                } 
                let imageArray = results.map(
                    item =>{
                        return {
                            fk_item_id: item.fk_item_id,
                            photo_item_name: item.photo_item_name
                        }
                    }
                )
                console.log(results)
                console.log(imageArray)
                res.status(200).json({
                    message: 'success!',
                    data:{
                        personalData,
                        imageArray:imageArray[0].fk_item_id == null ?
                        []
                        :
                        imageArray
                    }
                });
            })
    }catch{
        res.status(500).send();
    }
})

//get Profile
MyAccount.get('/Profile',authMiddleware, (req, res)=>{
    const id = req.body.pk_user_id
    console.log(id)
    try{
        mySql.query(
            `SELECT user_name,user_about,user_telp,	fk_city_id,user_photoprofile 
            FROM ms_login a INNER JOIN ms_user b ON a.pk_login_id  = b.fk_login_id	
            WHERE pk_login_id = ${id}`,
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

// Edit Profile
MyAccount.post('/EditProfile',authMiddleware, (req, res)=>{
    const id = req.body.pk_user_id
    const {name,about_me,phone} = req.body
    console.log(id)
    try{
        mySql.query(
            `UPDATE ms_user
            SET user_name = '${name}', user_about = '${about_me}', user_telp = '${phone}'
            WHERE pk_user_id = ${id}`,
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

// Edit Photo
MyAccount.post('/EditPhoto',upload.single('photo'), authMiddleware,
(req, res)=>{
    console.log('file', req.file);
    const id = req.body.pk_user_id
    console.log(id)
    try{
        mySql.query(
            `Update ms_user 
            SET user_photoprofile = '${req.file.filename}'
            WHERE pk_user_id = '${id}'`,
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
module.exports = MyAccount  