const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const app = express();

const port = process.env.PORT || 2000;
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8cqdw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("gardening");
        const gardeningServicesCollections =
            database.collection("gardening_services");
        const myOrderCollections = database.collection("place-order");
        const allUserCollection = database.collection("user-collection");
        const reviewCollection = database.collection("review_collection");
        const myOrders = database.collection("my-order");

        //post a service api ///////////////////////////////////

        app.post("/services", async (req, res) => {
            const newAddedService = req.body;
            const result = await gardeningServicesCollections.insertOne(
                newAddedService
            );
            res.json(result);
            // console.log(req.body);
        });

        // get api

        app.get("/services", async (req, res) => {
            const query = await gardeningServicesCollections.find({}).toArray();
            res.send(query);
        });

        //post review api ///////////////////////////////////

        app.post("/review", async (req, res) => {
            const addedReview = req.body;
            const result = await reviewCollection.insertOne(addedReview);
            res.json(result);
            // console.log(req.body);
        });

        //get review api ///////////////////////////////////

        app.get("/review", async (req, res) => {
            const myAllOrders = await reviewCollection.find({}).toArray();
            res.json(myAllOrders);
        });

        //myOrder api
        app.post("/myorder", async (req, res) => {
            const addedReview = req.body;
            const result = await myOrders.insertOne(addedReview);
            res.json(result);
            // console.log(req.body);
        });

        // manage products delete api

        app.delete("/manageproduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: ObjectId(id),
            };

            const result = await gardeningServicesCollections.deleteOne(query);

            res.json(result);
        });

        //place order post api/////////////////////////////////////

        // manage all order api ///////////////////////////////////

        app.get("/allorder", async (req, res) => {
            const myAllOrders = await myOrderCollections.find({}).toArray();
            res.json(myAllOrders);
        });

        app.post("/placeorder", async (req, res) => {
            const newData = req.body;
            const result = await myOrderCollections.insertOne(newData);
            res.json(result);
            // console.log("hitting the post", req);
        });

        // my orders get Api //////////////////////////////////////////

        app.get("/placeorder", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            // console.log(query);
            const cursor = await myOrderCollections.find(query).toArray();
            res.json(cursor);
        });

        // my order delete api ///////////////////////////////////////

        app.delete("/placeorder/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = {
                _id: id,
            };
            const result = await myOrderCollections.deleteOne(query);
            res.json(result);
        });

        // manage all order delete api/////////////////////////////////////

        app.delete("/allorder/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: id,
            };

            const result = await myOrderCollections.deleteOne(query);

            res.json(result);
        });
        // update status get api //////////////////////////////////////////

        app.get("/update/:id", async (req, res) => {
            // console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: id };
            const statusChanged = await myOrderCollections.findOne(query);
            res.send(statusChanged);
        });

        // update status put api //////////////////////////////////////////

        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            console.log(req);
            const updatedUser = req.body;
            const filter = { _id: id };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedUser.status,
                },
            };
            const result = await myOrderCollections.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
        });

        // user collection api /////////////////////////////////////

        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await allUserCollection.insertOne(user);
            res.json(result);
            // console.log(result);
        });

        app.get("/user", async (req, res) => {
            const myAllUsers = await allUserCollection.find({}).toArray();
            res.json(myAllUsers);
        });

        //update user for a user to make admin /////////////////////////
        app.get("/buildadmin/:id", async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const status = await allUserCollection.findOne(query);
            res.send(status);
        });

        //update api
        app.put("/buildadmin/:id", async (req, res) => {
            const id = req.params.id;
            const updatedRole = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: updatedRole.role,
                },
            };
            const result = await allUserCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
        });

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await allUserCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", function (req, res) {
    console.log("i am from node");
    res.send("i am a node for this.");
});

app.listen(port, () => {
    console.log("my port is", port);
});
