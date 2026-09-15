require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

console.log("Loading worker routes...");

const workerRoutes = require("./routes/workerRoutes");
app.use("/api/workers", workerRoutes);

const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});