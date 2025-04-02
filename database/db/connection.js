const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const uri = process.env.ATLAS_URI || "";
console.log(`Found URI string ${uri}\n`);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDB(){
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch(err) {
    console.error(err);
  }
}

const db = client.db("employees");

module.exports = { db, connectToDB, client }
