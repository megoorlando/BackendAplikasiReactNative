const express = require("express")
const Rating = express.Router()

const mySql = require('../database/MySql')
const { authMiddleware } = require('../middleware/AuthMiddleware');

Rating.get(
    '/RatingRenter',authMiddleware,
    (req, res)=>{
        const id = req.body.pk_user_id
        try{
            mySql.query(
                `SELECT a.pk_rating_user_id,b.user_name,b.user_photoprofile,a.rating_user_value,a.rating_user_comment FROM tr_rating_user a
                JOIN ms_user b
                ON a.rating_user_reviewers = b.pk_user_id
                WHERE fk_user_id = '${id}'
                ORDER BY pk_rating_user_id DESC `, 
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


Rating.get(
    '/RatingBorrower/:id?',
    (req, res)=>{
        const {id} =req.query
        try{
            mySql.query(
                `SELECT a.pk_rating_user_id,b.user_name,b.user_photoprofile,a.rating_user_value,
                a.rating_user_comment,AVG(rating_user_value) as rating FROM tr_rating_user a
                JOIN ms_user b
                ON a.rating_user_reviewers = b.pk_user_id
                WHERE fk_user_id = '${id}'
                ORDER BY pk_rating_user_id DESC `, 
                (error, results, fields)=>{
                    if(error) throw error;
                    let DataRating ={
                        rating : results[0].rating
                    }
                    if(results.length == 0){
                        res.status(200).send({message:'Data Not Found',
                    })
                    }else{
                        res.send({
                            message:'Data success',
                            data :{
                                results,DataRating}
                        })
                    }
            })
        }catch(err){
            res.status(500).send(err)
        }
    }
)

Rating.post('/Review',authMiddleware, (req, res)=>{
    const id = req.body.pk_user_id
    const {user,star,comment} =req.body
    try{
        mySql.query(
            `INSERT INTO tr_rating_user
            VALUES(DEFAULT,${user},'${star}','${comment}','${id}')`,
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


module.exports = Rating  