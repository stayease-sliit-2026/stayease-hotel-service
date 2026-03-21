const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3002;

// Connect to MongoDB, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Hotel service running: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Docs:   http://localhost:${PORT}/docs`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });