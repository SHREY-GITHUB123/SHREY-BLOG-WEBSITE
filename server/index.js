require("dotenv").config();//environment variable
const express=require("express");
const cors=require("cors");
const app=express();
const path = require("path");
const mongoose =require('mongoose');
const userRoutes=require("./routers/userRoutes.js");
const postRoutes=require("./routers/postRoutes");
const {notFound,errorHandler}=require('./middleware/errorMiddleware');
const upload =require('express-fileupload');

app.use(express.json({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(cors({credentials:true,origin:"http://localhost:3000"}));
app.use(upload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);

app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error while connecting to the database", error);
    });