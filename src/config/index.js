const dotenv = require("dotenv");
dotenv.config();

module.exports = { PORT, MONGO_URI, JWT_SECRET } = process.env;
