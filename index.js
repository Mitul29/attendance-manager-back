const express = require("express");
const config = require("./src/config");
const connectDB = require("./src/config/db");

const router = require("./src/router");

const app = express();
connectDB();

app.use(express.static("public"));
app.use(express.json());
app.use(router);

const PORT = config.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
