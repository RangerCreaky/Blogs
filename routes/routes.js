const express = require('express');
const router = express.Router();
const passport = require('passport');
const {User} = require("../modals/User");
const {Blog} = require("../modals/Blog");
const multer = require("multer");
const path = require("path");
const {markdown} = require('../controller/markdown');
const { description } = require('../controller/description');
require('../controller/googleAuth')(passport);

// @ MIDDLEWARE : This middleware function is meant to check wheather the user is authenticated or not
const checkAuth = (req , res , next)=>{
    if(req.isAuthenticated()){
        res.set('cache-control' , 'no-cache , private , no-store , must-revalidate , post-check     = 0 , pre-check = 0');
        next();
    }
    else{
        console.log('error');
        res.redirect("/google");
    }
}

// @MULTER middleware
const storageSingle = multer.diskStorage({
    destination : "./public/uploads/photos",
    filename : (req , file , cb)=>{
        cb(null , file.fieldname+"_"+Date.now()+path.extname(file.originalname));
    }
});

// const stoargeMultiple = multer.diskStorage({
//     destination : "./public/uploads/images",
//     filename : (req , file , cb)=>{
//         cb(null , file.feildname+"_"+Date.now()+path.extname(file.originalname));
//     }
// })

const upload = multer({storage : storageSingle});
const cpUpload = upload.fields([{ name: 'banner', maxCount: 1 }, { name: 'images', maxCount: 8 } , {name : 'thumbnail' , maxCount : 1}]);
// const uploadMultiple = multer({
//     storage : stoargeMultiple,
//     fileFilter : (req , file , cb)=>{
//         let validExtensions = ['.png' , 'jpg' , '.jpeg'];
//         let ext = path.extname(file.originalname);
//         if(!validExtensions.includes(ext)){
//             return cb(new Error('please choose .png/.jpg/.jpeg files only'));
//         }
//         cb(null , true);
//     }
// });

// @ROUTE GET: index
// @DESC : This is the index route
// @ACCESS : public
router.get("/" , (req , res)=>{
    if(req.isAuthenticated()){
        res.render('index' , {logged : true , user : req.user});
    }
    else res.render('index' , {logged : false , user : {}});
});


// @ROUTE GET : profile
// @DESC : This is the profile route which shall be changed in future
// @ACCESS : private
router.get("/blogs" , checkAuth , (req , res)=>{
    Blog.find({} , (err , data)=>{
        if(err){
            console.log(err);
        }
        if(data){
            res.render('blogs' , {user : req.user , blogs : data , showAll : true , count : 1});
        }
    })
});

// @ROUTE GET : your-blogs
// @DESC : This route shows all the blogs written by the current user
// @ACCESS : private
router.get("/your-blogs" , checkAuth ,  (req , res)=>{
    Blog.find({} , (err , data)=>{
        if(err){
            console.log(err);
        }
        if(data){
            let numBlogs = 0;
            data.forEach(element => {
                if(req.user.id === element.userId ){
                    numBlogs++;
                }
            });
            // console.log("user.id" , req.user.id);
            // console.log("blogs.userId" , blogs.userId);
            res.render('blogs' , {user : req.user , blogs : data , showAll : false , count : numBlogs});
        }
    });
});

// @ROUTE GET : google and google/callback
// @DESC : Need to learn more wbout what they actually do
// @ACCESS : public obviously because they are responsible to log the user in
router.get("/google" , passport.authenticate('google' , { scope : ['profile' , 'email'] }));

router.get("/google/callback" , passport.authenticate('google' , {failureRedirect : "/"}) , (req , res)=>{
    res.redirect("/blogs");
});

// @ROUTE GET : write
// @DESC : This is to fill the mark down , title , desc etc 
// @ACCESS : private
router.get("/write" , checkAuth , (req , res)=>{
    res.render('write' , {user : req.user , blog : {} , edit : false});
});

// @ROUTE GET : /update
// @DESC : This route is to update the blog post
// ACCESS : private
router.get("/update/:id" , (req , res)=>{
    Blog.findById(req.params.id , (err , data)=>{
        if(err){
            console.log(err);
        }
        if(data){
            res.render("write" , {user : req.user , blog : data , edit : true});
        }
    });
});

// @ROUTE GET : logout 
// @DESC : the logout rout which will destroy the user's session
// @ACCESS : private
router.get("/logout" , (req , res)=>{
    req.logout();
    res.set('cache-control' , 'no-cache , private , no-store , must-revalidate , post-check= 0 , pre-check = 0');
    req.session.destroy((err)=>{
        res.redirect("/");
    });
});

// @ROUTE GET : /blogs/:id
// @DESC : It takes to the individual blog
// ACCESS : private
router.get("/blogs/:id" , checkAuth ,  (req , res)=>{
    Blog.find({_id : req.params.id} , (err , data)=>{
        if(err){
            console.log(err);
        }
        if(data){
            // console.log(data[0].Markdown);
            res.render('individualBlog' , {user : req.user , blog : data[0] , edit : false});
        }
    });
});

// @ROUTE GET : /edit/:id
// @DESC : This route is responsible to show the edit and delete buttons in for the blogs written by the user
// @ACCESS : Private
router.get("/edit/:id" , checkAuth ,  (req , res)=>{
    const id = req.params.id;
    Blog.find({_id : id} , (err , data)=>{
        if(err){
            console.log(err);
        }
        if(data){
            res.render("individualBlog" , {user : req.user , blog : data[0] , edit : true});
        }
    });
});




//POST REQUEST
// @ROUTER POST : upload
// @DESC : This is to upload the blog written by the user
// @ACCESS : private
router.post("/upload" , cpUpload , async (req , res)=>{
    let currBlogId;
    let markdownData = await markdown(req.body.markdown , req.files.images);

    let descObj = await description(req.body.desc);

    console.log(req.user.id);
    let date = new Date();
    let currDate = date.toDateString();

    let topicArr = req.body.topics.split(',');

    let imageArr = [];
    if(req.files.images){
        req.files.images.forEach(element => {
            imageArr.push(element.filename);
        });
    }
    // Else an error should be thrown
    
    const blog = new Blog({
        userId :  req.user.id,
        Thumbnail : req.files.thumbnail[0].filename,
        Background : req.files.banner[0].filename,
        Title : req.body.title,
        DescPhone : descObj.phone,
        DescWeb : descObj.web,
        Topics : topicArr,
        Pictures : imageArr,
        Date : currDate,
        UserName : req.user.nickname,
        Avatar : req.user.avatar,
        Body : req.body.markdown,
        Markdown : markdownData
    });

    await blog.save((err , data)=>{
        if(err){
            console.log(err);
        }
        if(data){
            currBlogId = data.id;
            User.updateOne({id : req.user.id} , {$push : {blogID : currBlogId}} , (err)=>{
                if(err){
                    console.log(err);
                }
                else{
                    res.redirect('/blogs');
                }
            });
        }
    });
}); 

// @ROUTE POST : /update/:id
// @DESC : This updates the blog
// @ACCESS : private
router.post("/update/:id" , cpUpload , async (req , res)=>{
    let descObj = await description(req.body.desc); 
    let markdownData = await markdown(req.body.markdown , req.files.images);
    let imageArr = [];
    if(req.files.images){
        req.files.images.forEach(element => {
            imageArr.push(element.filename);
        });
    }
    let topicArr = req.body.topics.split(',');
    await Blog.findByIdAndUpdate(req.params.id , {$set : 
        {
            Title : req.body.title ,
            DescPhone : descObj.phone ,
            DescWeb : descObj.web , 
            Markdown : markdownData,
            Pictures : imageArr,
            Topics : topicArr
        }
    });

    res.redirect(`/edit/${req.params.id}`);
});

// @ROUTE DELETE : /delete/:id
// @DESC : This deletes that pirticular blog
// @ACCESS : private
router.delete("/delete/:id" , checkAuth , async (req , res)=>{
    await Blog.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.params.id , {$pull : {blogID : req.params.id}});
    res.redirect("/blogs");
});


// @ROUTE : temp
router.get("/temp" , (req , res)=>{
    res.render("individualBlog" , {user : req.user});
})

module.exports = router;