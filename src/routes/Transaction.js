const express = require('express')
const Transaction = express.Router()

const mySql = require('../database/MySql')
const { authMiddleware } = require("../middleware/AuthMiddleware");

//Request Item

Transaction.post('/RequestItem',authMiddleware, (req, res)=>{
    const id = req.body.pk_user_id
    const {fk_item_id,request_renter} = req.body
    try{
        mySql.query(
            `INSERT INTO tr_request_item
            VALUES (DEFAULT,'${id}','${fk_item_id}',1,'${request_renter}',NOW())`,
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

Transaction.post('/Response', (req, res)=>{
    const {fk_request_status_id,pk_request_item_id,pk_item_id} = req.body
    try{
        mySql.query(
            `UPDATE tr_request_item 
            SET fk_request_status_id = '${fk_request_status_id}'
            WHERE pk_request_item_id = '${pk_request_item_id}'`,
            (error, results, fields)=>{
                if(error) throw error;

                //GENERATE QUERY
                let query = `UPDATE ms_item 
                SET status_item = '${fk_request_status_id}'
                WHERE pk_item_id = '${pk_item_id}'`

                mySql.query(
                    query,
                    (error, results, fields)=>{
                        if(error) throw error;
                        let query1 = `INSERT INTO tr_notification (fk_request_item,fk_request_status_id)
                        VALUES ('${pk_request_item_id}','${fk_request_status_id}')`

                        mySql.query(
                            query1,
                            (error, results, fields)=>{
                                if(error) throw error;
        
                                res.status(200).json({
                                    message: 'success!',
                                });
                            }
                        )
                    }
                )
                
            })
    }catch{
        res.status(500).send();
    }    
})



// Request Information

Transaction.get(
    '/Infromation',authMiddleware,
    (req, res)=>{
        const id = req.body.pk_user_id
        try{
            mySql.query(
                `SELECT b.pk_request_item_id,a.user_name,c.pk_item_id,a.user_telp,a.user_photoprofile,d.category_name,c.item_name,b.fk_request_status_id FROM ms_user  a 
                JOIN tr_request_item  b ON a.pk_user_id = b.request_client
                JOIN ms_item c ON c.pk_item_id = b.fk_item_id
                JOIN ms_category d ON d.pk_category_id = c.fk_category_id
                WHERE request_renter = '${id}' &&  fk_request_status_id IN (1,2,4) `, 
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

// Notification
Transaction.get(
    '/Notification',authMiddleware,
    (req, res)=>{
        const id = req.body.pk_user_id
        try{
            mySql.query(
                `SELECT a.pk_notification_id,c.user_name,c.pk_user_id,c.user_photoprofile,
                c.user_telp,d.item_name,f.category_name,a.fk_request_status_id,
                g.notif_borrower FROM tr_notification a 
                JOIN tr_request_item b 
                ON a.fk_request_item =b.pk_request_item_id
                JOIN ms_user c
                ON b.request_renter = c.pk_user_id
                JOIN ms_item d
                ON b.fk_item_id = d.pk_item_id
                JOIN ms_category f
                ON d.fk_category_id = pk_category_id
                JOIN ms_request_status g
                ON a.fk_request_status_id = g.pk_request_status_id
                WHERE b.request_client = '${id}'
                ORDER BY pk_notification_id DESC`, 
                (error, results, fields)=>{
                    if(error) throw error;

                    if(results.length == 0){
                        res.status(200).send({message:'Data Not Found',
                        data:[]
                    })
                    }else{
                        res.send({
                            message:'Get Notif Success',
                            data :results
                        })
                    }
            })
        }catch(err){
            res.status(500).send(err)
        }
    }
)


module.exports = Transaction