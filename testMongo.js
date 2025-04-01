const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB successfully!");

        const db = client.db("test2");  // Use the correct database
        const patientsCollection = db.collection("patients");

        const patients = await patientsCollection.find({}).toArray();
        console.log("Patients:", patients);
    } catch (error) {
        console.error("❌ Connection error:", error);
    } finally {
        await client.close();
    }
}

connectDB();