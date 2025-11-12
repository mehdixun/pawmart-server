const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// ====== Middleware ======
app.use(cors());
app.use(express.json());

// ====== MongoDB Connection URI ======
const uri = "mongodb+srv://pawmart:FKZ87d9QnbJF6nix@cluster0.dy2dskh.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ====== Database Connection & Routes ======
async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully!");

    const db = client.db("pawmart");
    const productsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");

    // ====== Root Route ======
    app.get("/", (req, res) => {
      res.send("🐾 Pawmart server is running perfectly!");
    });

    // ====== Add Listing ======
    app.post("/products", async (req, res) => {
      try {
        const { name, category, price, location, description, image, date, email } = req.body;

        // Validation check
        if (!name || !category || !location || !description || !image || !date || !email) {
          return res.status(400).send({ error: "All fields are required" });
        }

        const newProduct = {
          name,
          category,
          price: category === "Pets" ? 0 : Number(price) || 0,
          location,
          description,
          image,
          date,
          email,
          createdAt: new Date(),
        };

        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
      } catch (error) {
        console.error("❌ Error adding product:", error);
        res.status(500).send({ error: "Failed to add product" });
      }
    });

    // ====== Get All Products ======
    app.get("/products", async (req, res) => {
      try {
        const products = await productsCollection.find().sort({ _id: -1 }).toArray();
        res.send(products);
      } catch (error) {
        console.error("❌ Fetch all products error:", error);
        res.status(500).send({ error: "Failed to fetch products" });
      }
    });

    // ====== Get Recent 6 Products ======
    app.get("/products/recent", async (req, res) => {
      try {
        const products = await productsCollection
          .find()
          .sort({ _id: -1 })
          .limit(6)
          .toArray();
        res.send(products);
      } catch (error) {
        console.error("❌ Fetch recent products error:", error);
        res.status(500).send({ error: "Failed to fetch recent products" });
      }
    });

    // ====== Get Single Product by ID ======
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const product = await productsCollection.findOne({ _id: new ObjectId(id) });
        if (!product) return res.status(404).send({ error: "Product not found" });
        res.send(product);
      } catch (error) {
        console.error("❌ Fetch product by ID error:", error);
        res.status(500).send({ error: "Failed to fetch product" });
      }
    });

    // ====== Create Order ======
    app.post("/orders", async (req, res) => {
      try {
        const { name, email, productId, productName, quantity, price, address, date, phone } = req.body;

        if (!name || !email || !productId || !productName || !price || !address || !date || !phone) {
          return res.status(400).send({ error: "All order fields are required" });
        }

        const newOrder = {
          name,
          email,
          productId,
          productName,
          quantity: Number(quantity) || 1,
          price: Number(price),
          address,
          date,
          phone,
          createdAt: new Date(),
        };

        const result = await ordersCollection.insertOne(newOrder);
        res.send(result);
      } catch (error) {
        console.error("❌ Error adding order:", error);
        res.status(500).send({ error: "Failed to place order" });
      }
    });

  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

run().catch(console.dir);

// ====== Server Start ======
app.listen(port, () => {
  console.log(`🚀 Pawmart server is running on port ${port}`);
});
