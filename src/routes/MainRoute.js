const express = require('express')
const multer = require("multer")
const MainRoute = express.Router()

const mySql = require('../database/MySql');
const { authMiddleware } = require('../middleware/AuthMiddleware');

const storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './public/image');
    },
    filename(req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({storage});


//Post Item
MainRoute.post(
    '/PostItem', upload.array('photo'), authMiddleware,
    (req, res)=>{
        console.log('file', req.files);
        console.log('body', req.body);
        const id = req.body.pk_user_id;
        const {item_name,item_price,item_description,fk_category_id} = req.body
        try{
            mySql.query(
                `insert into ms_item (item_name,item_price,item_description,fk_category_id, fk_user_id,status_item) 
                VALUES ('${item_name}','${item_price}','${item_description}','${fk_category_id}','${id}',0)`,
                (error, results, fields)=>{
                    if(error) throw error;
                    console.log(results.insertId)   
    
                    //GENERATE QUERY
                    let query = `INSERT INTO ms_photo_item VALUES `
                    req.files.forEach((item,index)=>{
                        query  += `(DEFAULT, '${item.filename}','${results.insertId}')`
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
    }
)


module.exports = MainRoute