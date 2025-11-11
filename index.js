const express = require('express');
const cors = require ('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://pawmart:FKZ87d9QnbJF6nix@cluster0.dy2dskh.mongodb.net/?appName=Cluster0";


app.get('/', (req, res) => {
  res.send('pawmert server is running')
})


async function run() {
  try {
    await client.connect();

    const db = client.db('pawmart')
    const productsCollection = db.collection('products');

    app.post('/products', (req, res) => {
        const newProducts = await productsCollection.inser
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`pawmart server is running on port ${port}`)
})
