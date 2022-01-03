const express = require("express");
const Item = express.Router();

const mySql = require("../database/MySql");
const { authMiddleware } = require("../middleware/AuthMiddleware");

const multer = require("multer");
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "./public/image");
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

Item.get("/GetItem/:item", authMiddleware, (req, res) => {
  const id = req.body.pk_user_id;
  const { item } = req.params;
  try {
    mySql.query(
      `SELECT pk_item_id,item_name,fk_category_id,item_price,item_description,
            pk_photo_item_id,photo_item_name FROM ms_item a JOIN 
            ms_photo_item b ON a.pk_item_id = fk_item_id
            WHERE fk_user_id = '${id}' && pk_item_id = '${item}'`,
      (error, results, fields) => {
        if (error) throw error;
        let DataItem = {
          pk_item_id: results[0].pk_item_id,
          item_description: results[0].item_description,
          item_name: results[0].item_name,
          item_price: results[0].item_price,
          fk_category_id: results[0].fk_category_id,
        };
        let imageArray = results.map(item => {
          return {
            pk_photo_item_id: item.pk_photo_item_id,
            photo_item_name: item.photo_item_name,
          };
        });
        res.status(200).json({
          message: "success!",
          data: {
            DataItem,
            imageArray,
          },
        });
      }
    );
  } catch {
    res.status(500).send();
  }
});

Item.post("/DeleteItem", (req, res) => {
  const { pk_item_id, fk_item_id } = req.body;
  try {
    mySql.query(
      `DELETE FROM ms_item WHERE pk_item_id = '${pk_item_id}'`,
      (error, results, fields) => {
        if (error) throw error;
        console.log(results.insertId);

        //GENERATE QUERY
        let query = `DELETE FROM ms_photo_item WHERE fk_item_id='${fk_item_id}'`;
        console.log(query);

        mySql.query(query, (error, results, fields) => {
          if (error) throw error;

          res.status(200).json({
            message: "success!",
          });
        });
      }
    );
  } catch {
    res.status(500).send();
  }
});

Item.post("/EditItem", upload.array("photo"), (req, res) => {
  const {
    pk_item_id,
    item_name,
    item_price,
    item_description,
    fk_category_id,
  } = req.body;
  try {
    mySql.query(
      `UPDATE ms_item 
            SET item_name = '${item_name}',
            item_price = '${item_price}' ,
            item_description = '${item_description}',
            fk_category_id= '${fk_category_id}'
            WHERE pk_item_id = '${pk_item_id}'`,
      (error, results, fields) => {
        if (error) throw error;

        let query = `INSERT INTO ms_photo_item VALUES`;
        req.files.forEach((item, index) => {
          query += `(DEFAULT, '${item.filename}','${pk_item_id}')`;
          if (index != req.files.length - 1) {
            query += ",";
          }
        });
        console.log(query);

        mySql.query(query, (error, results, fields) => {
          if (error) throw error;

          res.status(200).json({
            message: "success!",
            data: results,
          });
        });
      }
    );
  } catch {
    res.status(500).send();
  }
});

module.exports = Item;
