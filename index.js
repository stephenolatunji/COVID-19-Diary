const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');


// Initialize middleware
app.use(express.json());
app.use(cors());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: "COVID-19",
    allowedFormats: ["jpg", "png", "jpeg"],
    transformation: [{width: 400, height: 400, crop: "limit"}]
});

const parser = multer({storage: storage});

// Initialize mongoose schema
const Schema = mongoose.Schema;
const diarySchema = Schema({
    name: {type: String, trim: true},
    fact: {type: String, trim: true},
    text: {
        type: String,
        trim: true,
        require: true
    },
    image1: {type: String},
    image2: {type: String}
},{
    timestamps: true
}
);

const Diary = mongoose.model('Diary', diarySchema);



app.post('/', parser.single('image'), async(req, res) => {
    const image1 = {};
            image1.url = req.file.url;
            image1.id = req.file.public_id;
    const image2 = {};
            image2.url = req.file.url;
            image2.id = req.file.public_id;
        const {text, fact, name } = req.body;

        try{
            const diary = new Diary({
                name,
                fact,
                text,
                image1: image1.url,
                image2: image2.url
            })
            await diary.save();
        }
        catch(err){
            res.status(500).send({Success: false, Error: err})
        }
});

app.get('/', async(req, res) =>{
    try{

        const diary = await Diary.find().lean();
        res.json(diary)
    }
    catch(err){
        res.status(500).send({Success: false, Error: err})
    }
});

app.get('/:_id', async(req, res)=> {
    try{

        const diary = await Diary.find(req.params._id).lean();
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

