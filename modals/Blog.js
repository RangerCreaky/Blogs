const mongoose = require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.MONGOURI);

const blogSchema =  new mongoose.Schema({
    userId : String, // This is the user id given vy mongo db of the user who uploaded it 
    Thumbnail : String, // Thumbnail of the image
    Background : String, // Background image of the blog
    Title : String, // title of the blog
    DescPhone : String,// description of the blog
    DescWeb : String,// description of the blog
    Topics : [String], // The topics of the blog
    Pictures : [String], // The uploaded images
    Date : String,
    UserName : String, // User name of the person
    Avatar : String,
    Body : String,
    Markdown : String // Matter after being converted to markdown
});

const Blog = mongoose.model('blog' , blogSchema);
module.exports = {Blog};