const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = "mongodb+srv://pawmart:FKZ87d9QnbJF6nix@cluster0.dy2dskh.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db('pawmart');
    const productsCollection = db.collection('products');

    // Root route
    app.get('/', (req, res) => {
      res.send('Pawmart server is running!');
    });

    // Add new product
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // Get recent 6 products (latest first)
    app.get('/products/recent', async (req, res) => {
      const products = await productsCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(products);
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Pawmart server is running on port ${port}`);
});
