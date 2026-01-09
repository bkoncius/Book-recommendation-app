const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
    origin:["http://localhost:5174"],
};
app.use(cors(corsOptions));

app.get("/api", (req,res)=>{
res.json({message: "hello from express"});
});

app.listen(5000, ()=>{
    console.log("server running on port 5000");
});