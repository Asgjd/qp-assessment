const dotenv = require("dotenv");
const app = require("./src/app");
const connectDB = require("./src/utils/mongoUtils");

// Load environment variables
dotenv.config();

// Connect to MongoDB
let connectDb = async () => {
  await connectDB.connect();
};
connectDb();
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});