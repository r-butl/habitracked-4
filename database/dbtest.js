///////////////////////////////////////////
// To run CRUD test enter:
// $ node --env-file=config.env dbtest.js
///////////////////////////////////////////
const db = require("./db/connection"); // Import your database connection

async function insertTestData() {
  const usersCollection = db.collection("users"); // Creating a collection

  const newUser = {
    name: "John Doe",
    email: "johndoe@example.com",
    password: "hashed_password_here", // Ideally, hash passwords before storing
  };

  const result = await usersCollection.insertOne(newUser);
  console.log("Inserted User ID:", result.insertedId);
}

async function findUser() {
  const usersCollection = db.collection("users");
  const user = await usersCollection.findOne({ email: "johndoe@example.com" });

  if (user) {
    console.log("User Found:", user);
  } else {
    console.log("User Not Found.");
  }
}

async function updateUser() {
  const usersCollection = db.collection("users");

  const result = await usersCollection.updateOne(
    { email: "johndoe@example.com" },
    { $set: { name: "Johnathan Doe" } }
  );

  console.log("Matched:", result.matchedCount, "Modified:", result.modifiedCount);
}

async function deleteUser() {
  const usersCollection = db.collection("users");
  const result = await usersCollection.deleteOne({ email: "johndoe@example.com" });

  console.log("Deleted Count:", result.deletedCount);
}

// CRUD tests (run individually)
insertTestData();

// findUser();

// updateUser();

// deleteUser();