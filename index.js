const express = require('express');
const port = process.env.PORT || 5000;
require('dotenv').config(); 
const bodyParser = require('body-parser')
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const app = express()
app.use(bodyParser.json()); // for parsing application/json
app.use(cors());

//Starting MongoDB Connection and DataBase Back-end 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q8ydv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('Database Error is:', err)
  const productsCollection = client.db("easy-bazaar").collection("products"); //Products Collection in DataBase
  const ordersCollection = client.db("easy-bazaar").collection("orders"); // Ordered Collection in DataBase

    console.log('DataBase Connection Successfully');

   // Uploading Client site Product Data to the mongoDB
    app.post('/addProduct', (req,res) => {
        const productData = req.body;
        console.log('Adding Product', req.body);
        productsCollection.insertOne(productData)
        .then(result => {
            console.log('Inserted Count', result.insertedCount)
            res.send(result.insertedCount > 0)
        })
    })

    //Getting Data form DataBase to Show How Many Products Already Added
    app.get('/manageProduct',(req,res) => {
        productsCollection.find().toArray( (err, documents) => { 
            res.send(documents);
            console.log('Error : ',err)
            console.log('From DataBase : ',documents);
        })
    })
      //Reading Single Product Data from DB
        app.get('/product/:key', (req,res) => {
            console.log(req.params.id);
            productsCollection.find({_id : ObjectID(req.params.id)})
            .toArray( (err,documents) => {
                res.send(documents[0]);
            })
        })

    //Delete Product data from DataBase
    app.delete('/deleteProduct/:id', (req,res) => {
        console.log('Data Delete')
        const id = ObjectID(req.params.id);
        console.log('Delete This', id);
        productsCollection.findOneAndDelete({_id: id})
        .then(data => res.json({success: !!data.value}));
    })

    //Insert Place Order Data in DB
    app.post('/addOrder', (req,res) => {
        const order = req.body;
        console.log(order);
        ordersCollection.insertOne(order)
        .then(result => {
            console.log('OrderConfirm')
            console.log(result);
            res.send(result.insertedCount > 0);
        })
    })

    //Specific User Order
    app.get('/orders', (req,res) => {
        console.log(req.query.email)
        ordersCollection.find({email: req.query.email})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

});




    //Starting Back-End
    app.get('/', (req, res) => {
    res.send('Hello World!')
    })

app.listen(port, () => {
  console.log(`Example app ${port}`)
})