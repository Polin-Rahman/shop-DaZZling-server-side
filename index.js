const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xtq5r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Database connected successfully!');

        const database = client.db('dazzling_shop');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const orderCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');


        //GET products API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //POST user API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        //PUT user API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };

            const updateDoc = { $set: user };

            const result = await usersCollection.updateOne(filter, updateDoc, options);

            res.json(result);
        });

        //GET single product API using dynamic id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await productsCollection.findOne(query);
            res.send(service);
        }),

            // POST Orders API
            app.post('/orders', async (req, res) => {
                const order = req.body;
                const result = await orderCollection.insertOne(order);
                res.json(result);
            });

        //GET orders API wuth user email
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //DELETE order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);
        });

        //Add review API
        app.post('/reviews', async (req, res) => {
            const order = req.body;
            const result = await reviewsCollection.insertOne(order);
            res.json(result);
        });

        //PUT user admin API
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //GET admin API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //GET all orders API
        app.get('/allOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //UPDATE order API
        app.put('/allOrders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'Shipped'
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            res.json(result)
        });

        //Add new product API
        app.post('/addProduct', async (req, res) => {
            const order = req.body;
            const result = await productsCollection.insertOne(order);
            res.json(result);
        });

        //DELETE product API
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('shop DAZZLING Server is running !!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})