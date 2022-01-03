const express = require("express")
const HomeRoute = express.Router()

const mySql = require('../database/MySql');
const { authMiddleware } = require("../middleware/AuthMiddleware");


HomeRoute.get(
    '/Explore/:category?/:city?/:item?',
    (req, res)=>{
        const {category,city,item} = req.query;
        try{
            let search = `&& a.item_name like '%${item}%'`
            mySql.query(
                `SELECT a.item_name,c.pk_user_id,a.pk_item_id,b.photo_item_name 
                FROM  ms_item a JOIN ms_photo_item b 
                ON a.pk_item_id = b.fk_item_id JOIN ms_user c
                ON a.fk_user_id = c.pk_user_id JOIN ms_category d 
                ON d.pk_category_id = a.fk_category_id  JOIN ms_city e 
                ON e.pk_city_id = c.fk_city_id
                WHERE d.pk_category_id = '${category}' && e.pk_city_id ='${city}' && status_item !=4
                ${item? search :''} 
                GROUP BY b.fk_item_id`, 
                (error, results, fields)=>{
                    if(error) throw error;

                    if(results.length == 0){
                        res.status(200).send({message:'Data Not Found',
                        data:[]
                    })
                    }else{
                        res.send({
                            message:'Data success',
                            data :results
                        })
                    }
            })
        }catch(err){
            res.status(500).send(err)
        }
    }
)

HomeRoute.get('/GetDetails/:user/:item',authMiddleware, (req, res)=>{
    const id = req.body.pk_user_id
    const {user,item} = req.params
    try{
        mySql.query(
            `SELECT  IF( a.pk_user_id = '${id}', 1, 0) AS showVal,user_name,user_photoprofile,
            pk_photo_item_id,photo_item_name,item_name,city_name,item_price,item_description 
            FROM ms_user a 
            JOIN ms_item b ON a.pk_user_id = b.fk_user_id 
            JOIN ms_photo_item c ON b.pk_item_id = c.fk_item_id
            JOIN ms_city d ON a.fk_city_id = d.pk_city_id 
            WHERE a.pk_user_id = '${user}' && b.pk_item_id = '${item}' `,
            (error, results, fields)=>{
                if(error) throw error;
                let DataItem = {
                        showVal : results[0].showVal,
                        user_name: results[0].user_name,   
                        user_photoprofile: results[0].user_photoprofile,
                        item_name: results[0].item_name,
                        city_name: results[0].city_name,
                        item_price: results[0].item_price,
                        item_description: results[0].item_description
                } 
                let imageArray = results.map(
                    item =>{
                        return {
                            pk_photo_item_id: item.pk_photo_item_id,
                            photo_item_name: item.photo_item_name
                        }
                    }
                )
                res.status(200).json({
                    message: 'success!',
                    data:{
                        DataItem,imageArray
                    }
                });
            })
    }catch{
        res.status(500).send();
    }
})


module.exports = HomeRoute  