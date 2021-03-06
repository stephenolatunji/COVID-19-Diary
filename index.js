const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const {CloudinaryStorage} = require('multer-storage-cloudinary');


// Initialize middleware
app.use(cors());
app.use(express.json());

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_KEY,
//     api_secret: process.env.CLOUDINARY_SECRET
// });

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     folder: "COVID-19",
//     allowedFormats: ["jpg", "png", "jpeg"],
//     transformation: [{width: 400, height: 600, crop: "limit"}]
// });

// const parser = multer({storage: storage});

// Initialize mongoose schema
const Schema = mongoose.Schema;

const diarySchema = new Schema({
    name: {type: String},
    location: {type: String},
    role: {type: String},
    moment: {type: String},
    wow: {type: String},
    caption: { type: String },
}
// ,{
//     timestamps: true
// }
);
const Diary = mongoose.model('Diary', diarySchema);


app.post('/uploader', async(req, res) => {

    // let image = [];
        const { name, location, role, moment, wow, caption } = req.body;
        

        // for (let i = 0; i < req.files.length; i++) {
        //     image.push(req.files[i].path);
        // }
        try{
            const diary = new Diary({
                name,
                location,
                role,
                moment,
                wow,
                caption
            });
            await diary.save();
            res.json(diary);
        }
        catch(err){
            res.status(500).send({
                Success: false, 
                Error: err
            })
        }      
});
app.get('/uploader', async(req, res) =>{
    try{

        const diary = await Diary.find();
        res.json(diary)
    }
    catch(err){
        res.status(500).send({Success: false, Error: err})
    }
});

app.get('/uploader/:_id', async(req, res)=> {
    try{

        const diary = await Diary.find({_id: req.params._id});
        res.json(diary)
    }
    catch(err){
        res.status(500).send({Success: false, Error: err})
    }
});



// Connect Database
const connectDB = async () => {
    try{

        await mongoose.connect(process.env.MONGO_URI, {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('DB Connected...')
    }
    catch(err){
        console.error(err.message);
    }
};
 
const port = process.env.PORT || 4000;


// Initialize Server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server started on port ${port}`)
    });
});

