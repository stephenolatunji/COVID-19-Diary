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
    text: {
        type: String,
        trim: true,
        require: true
    },
    image: [
        {type: String}
    ]
},{
    timestamps: true
}
);

const Diary = mongoose.model('Diary', diarySchema);



app.post('/', parser.array('image'), async(req, res) => {
    const image = {};
            image.url = req.file.url;
            image.id = req.file.public_id;
        const text = req.body;

        try{
            const diary = new Diary({
                text,
                image: image.url
            })
            await diary.save();
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

