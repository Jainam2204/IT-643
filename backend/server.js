const dotenv = require("dotenv");
const { createServer } = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const { initRealtime } = require("./services/realtime");

dotenv.config();
connectDB();

const server = createServer(app);
initRealtime(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));