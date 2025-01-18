require("dotenv").config();
const express = require("express");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRETE_KEY);
const cors = require("cors");
const port = 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://need-volunteer-40.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_pass}@cluster1.hcojg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// middleware
const verifyToken = (req, res, next) => {
  // console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    // console.log('2',req.headers.authorization);
    return res.status(401).send({ message: "unAuthorized from 34" });
  }
  // console.log('3',req.headers.authorization);
  const token = req.headers.authorization.split(" ")[1];
  // console.log('4',req.headers.authorization);
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    // console.log('5',req.headers.authorization);
    if (err) {
      // console.log('6',req.headers.authorization);
      return res.status(403).send({ message: "forbidden access from 39" });
    }
    // console.log('7',req.headers.authorization);
    req.decoded = decoded;
    // console.log('8',req.headers.authorization);
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // aprtment collection
    const apartmentsCollection = client
      .db("HSNTower")
      .collection("apartmentsCollection");
    // users collection
    const usersCollection = client.db("HSNTower").collection("usersCollection");

    // agreement collection
    const agreementCollection = client
      .db("HSNTower")
      .collection("agreementCollection");

    // payments details collection
    const paymentsCollection = client
      .db("HSNTower")
      .collection("paymentsCollection");
    
    
      // announcement collection
    const announcementsCollection = client
      .db("HSNTower")
      .collection("announcementsCollection");

    // jwt related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // post user data to db
    app.post("/user", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };

      const findUser = await usersCollection.findOne(query);

      if (!findUser) {
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } else {
        res.send({ message: "user exist" });
      }
    });

    // get all apartment data
    app.get("/apartments", async (req, res) => {
      // filter functionality
      const minPrice = parseInt(req.query?.min) || 0;
      const maxPrice = parseInt(req.query?.max) || Infinity;

      // if (minPrice && maxPrice) {
      //   const cursor =
      // }

      // pagination functionality
      const page = parseInt(req.query?.page) || 1;
      const limit = 6;
      const skip = (page - 1) * limit;
      const cursor = await apartmentsCollection
        .find({
          rent: { $gte: minPrice, $lte: maxPrice },
        })
        .skip(skip)
        .limit(6)
        .toArray();

      const totalApartments = await apartmentsCollection.countDocuments();
      res.json({
        data: cursor,
        totalPages: Math.ceil(totalApartments / limit),
        currentPage: page,
      });
    });

    // post agreemnet detail on db
    app.post("/agreement", verifyToken, async (req, res) => {
      const agreement = req.body;
      const query = { UserEmail: agreement.UserEmail };

      // add agreement to agreement collection if the agreement of same user not exist

      const finded = await agreementCollection.findOne(query);
      if (finded === null) {
        const result = await agreementCollection.insertOne(agreement);
        res.send(result);
      } else {
        res.send({ message: " You can't multiple agreement" });
      }

      // console.log(agreement);
      // console.log(finded === null);
    });

    // check user role from db usercollection
    app.get("/checkRole/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
      // console.log(result);
    });

    // get member agreement data for making payment
    app.get("/apartmentInfo/:email", async (req, res) => {
      const email = req.params.email;
      const query = { UserEmail: email };
      const result = await agreementCollection.findOne(query);
      res.send(result);
      // console.log(result);
    });

    // payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // save payments history in db
    app.post("/paymentsHistory", async (req, res) => {
      const history = req.body;
      const resutl = await paymentsCollection.insertOne(history);
      res.send(resutl);
    });

    // get  payments history from db
    app.get("/paymentsHistory/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const resutl = await paymentsCollection.find(query).toArray();
      res.send(resutl);
    });

    // get all members data from db
    app.get("/manageMembers", async (req, res) => {
      const query = { role: "Member" };
      const result =await usersCollection.find(query).toArray();
      res.send(result);
    
      
    });

    // chagne a member to user
    app.patch('/remove/:id',async(req,res)=>{
      const id  = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateDoc={
        $set: {role: "User"}
      }
      const result = await usersCollection.updateOne(filter,updateDoc)
      // console.log(result);
      
      res.send(result)
      
      
    })


    // post announcement from admin to db
    app.post('/addAnnouncement', async(req,res)=>{
      const announcement = req.body;
      const result =await announcementsCollection.insertOne(announcement)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
