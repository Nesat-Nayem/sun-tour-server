const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
// stripe is on testing mode
// const stripe = require('stripe')(process.env.STRIPE_SECRET)

const app = express();
const port = process.env.PORT || 5000;

// middle war
app.use(cors());
app.use(express.json());
const uri =
  "mongodb+srv://suntour2:2jS4gDHXFjCCYG7p@cluster0.hty68.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(uri);
async function run() {
  try {
    await client.connect();

    console.log("database connect");

    // database and collection

    const database = client.db("suntour");
    const servicesCollection = database.collection("services");
    const reviewsCollection = database.collection("reviews");
    const ordersCollection = database.collection("orders");
    const usersCollections = database.collection("users");

    // insert Service
    app.post("/addService", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    // read Service
    app.get("/service", async (req, res) => {
      const cursor = servicesCollection.find({});
      const post = await cursor.toArray();
      const count = await cursor.count();
      // const result = await servicesCollection.find({}).toArray();

      res.send({
        count,
        post,
      });
    });

    // add Review
    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // read review
    app.get("/reviews", async (req, res) => {
      const review = await reviewsCollection.find({}).toArray();
      // console.log(review);
      res.send(review);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await servicesCollection.findOne(filter);
      res.json(result);
    });

    // add order
    app.post("/addOrder", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    // read myOrders
    app.get("/MyOrders/:email", async (req, res) => {
      const email = req.params.email;
      const result = await ordersCollection.find({ email: email }).toArray();
      res.send(result);
    });

    //order delete from  myOrders
    app.delete("/myOrders/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // read manageOrders
    app.get("/manageOrders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    //order delete from  allOrders
    app.delete("/allOrders/order/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // update order status
    app.put("/orderStatus/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: { status: "Done" },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // read manage Service
    app.get("/manageService", async (req, res) => {
      const result = await servicesCollection.find({}).toArray();
      res.json(result);
    });

    //Service delete from  all Service
    app.delete("/alService/service/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });

    // save user info google login
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const doc = { $set: user };
      const result = await usersCollections.updateOne(filter, doc, options);
      res.json(result);
    });

    // insert user by register
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("hit", user);
      const result = await usersCollections.insertOne(user);
      res.json(result);
    });

    // make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollections.updateOne(filter, updateDoc);
      res.json(result);
    });

    // get admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollections.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollections.find({}).toArray();
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("opening on sun tour server");
});
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
//----------------------------- home page-----------------------------
