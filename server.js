const express = require("express");
const app = express();
require("dotenv").config();
const connectDB = require("./config/db");
const userRoute = require("./routes/userRoute");

app.use(express.json());
app.use("/api/users", userRoute);

app.get("/health",(req,res)=>{
    res.send("Backend Is Running")
});

const PORT = process.env.PORT || 6002
connectDB();

app.listen(PORT, () => {
    console.log(`Server Is Running on port ${PORT}`);
});