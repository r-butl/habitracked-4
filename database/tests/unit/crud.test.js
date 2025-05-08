///////////////////////////////////////////
// To run CRUD test enter:
// $ node --env-file=config.env dbtest.js
///////////////////////////////////////////
const { db, connectToDB, client }  = require("../../db/connection.js");

beforeAll(async () => {
  await connectToDB();
});

afterAll(async () => {
  await client.close();
});

describe("MongoDB CRUD Operations", () => {
  let usersCollection;
  const testUser = {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "test_password", // Ideally, hash passwords before storing
    };

  beforeAll(() => {
    usersCollection = db.collection("users");
  });

  test("Insert a user into the database", async () => {
    const result = await usersCollection.insertOne(testUser);
    expect(result.insertedId).toBeDefined();
  });

  test("Find the inserted user", async () => {
    const user = await usersCollection.findOne({ email: "johndoe@example.com" });
    expect(user).not.toBeNull();
    expect(user.name).toBe(testUser.name);
    expect(user.password).toBe(testUser.password);
  });

  test("Update the users name", async () => {
    const result = await usersCollection.updateOne(
      { email: "johndoe@example.com" },
      { $set: { name: "Johnathan Doe" } }
    );

    expect(result.matchedCount).toBe(1);
    expect(result.modifiedCount).toBe(1);
  });

  test("Delete the user", async () => {
    const result = await usersCollection.deleteOne({ email: "johndoe@example.com" });
    expect(result.deletedCount).toBe(1);

    const deletedUser = await usersCollection.findOne({ email: testUser.email });
    expect(deletedUser).toBeNull();
  });

});
