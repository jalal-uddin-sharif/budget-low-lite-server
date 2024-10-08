const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

// Middleware
app.use(
  cors({
    origin: ["https://budget-low-lite.web.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.User_Name}:${process.env.User_Password}@cluster0.zukg64l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();
    const BudgetLowCollection = client
      .db("BudgetLowLite")
      .collection("Products-data");

    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const search = req.query.search || "";
      const category = req.query.category || "";
      const brand = req.query.brand || "";
      const price = parseInt(req.query.price) || 0;

      // Build the filter object
      const filter = {};

      if (search) {
        filter.productName = { $regex: search, $options: "i" };
      }
      if (category) {
        filter.categoryName = category;
      }
      if (brand) {
        filter.brandName = brand;
      }
      if (price > 0) {
        filter.price = { $lte: price };
      }

      try {
        // Fetch filtered products
        const products = await BudgetLowCollection.find(filter)
          .skip(skip)
          .limit(limit)
          .toArray();
        const totalProducts = await BudgetLowCollection.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
          products,
          page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        });
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server error");
      }
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" server responsed");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
