const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// ====== Middleware ======
app.use(cors());
app.use(express.json());

// ====== MongoDB Connection ======
const uri =
  "mongodb+srv://pawmart:FKZ87d9QnbJF6nix@cluster0.dy2dskh.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully!");

    const db = client.db("pawmart");
    const productsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");

    // ====== Root ======
    app.get("/", (req, res) => {
      res.send("🐾 Pawmart server is running perfectly!");
    });

    // ====== Add Product ======
    app.post("/products", async (req, res) => {
      try {
        const productData = req.body;
        productData.price = productData.price || 0;
        productData.createdAt = new Date();

        const result = await productsCollection.insertOne(productData);
        res.send(result);
      } catch (error) {
        console.error("❌ Add product error:", error);
        res.status(500).send({ error: "Failed to add product" });
      }
    });

    // ====== Get Products with Category Mapping ======
    app.get("/products", async (req, res) => {
      try {
        const { email, category } = req.query;
        let query = {};
        if (email) query.email = email;

        if (category) {
          if (category === "Pets") {
            query.category = { $in: ["Dog", "Cat", "Bird"] };
          } else {
            query.category = category;
          }
        }

        const products = await productsCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(products);
      } catch (error) {
        console.error("❌ Fetch products error:", error);
        res.status(500).send({ error: "Failed to fetch products" });
      }
    });

    // ====== Recent Products ======
    app.get("/products/recent", async (req, res) => {
      try {
        const products = await productsCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(6)
          .toArray();
        res.send(products);
      } catch (error) {
        console.error("❌ Fetch recent products error:", error);
        res.status(500).send({ error: "Failed to fetch recent products" });
      }
    });

    // ====== Get Product by ID ======
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const product = await productsCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product)
          return res.status(404).send({ error: "Product not found" });
        res.send(product);
      } catch (error) {
        console.error("❌ Fetch product by ID error:", error);
        res.status(500).send({ error: "Failed to fetch product" });
      }
    });

    // ====== Delete Product ======
    app.delete("/products/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await productsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (error) {
        console.error("❌ Delete product error:", error);
        res.status(500).send({ error: "Failed to delete product" });
      }
    });

    // ====== Place Order ======
    app.post("/orders", async (req, res) => {
      try {
        const orderData = req.body;
        orderData.quantity = Number(orderData.quantity) || 1;
        orderData.price = Number(orderData.price) || 0;
        orderData.createdAt = new Date();

        const result = await ordersCollection.insertOne(orderData);
        res.send(result);
      } catch (error) {
        console.error("❌ Add order error:", error);
        res.status(500).send({ error: "Failed to place order" });
      }
    });

    // ====== 🧾 Get Orders by Email (important for My Orders page) ====
    app.get("/orders", async (req, res) => {
      try {
        const email = req.query.email;
        let query = {};
        if (email) query.email = email;

        const orders = await ordersCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
        res.send(orders);
      } catch (error) {
        console.error("❌ Fetch orders error:", error);
        res.status(500).send({ error: "Failed to fetch orders" });
      }
    });

    console.log("🚀 All routes ready!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Pawmart server running on port ${port}`);
});
