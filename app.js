const expressSanitizer = require("express-sanitizer"),
      methodOverride = require("method-override"),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      express = require("express"),
      moment = require("moment"),
      path = require("path"),
      app = express();
      PORT = process.env.PORT || 3000;
      
app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static(path.join(__dirname, "/public")));
mongoose.connect('mongodb://localhost:27017/blogapp', {useNewUrlParser: true, useUnifiedTopology: true});

// SET UP THE SCHEMA
const blogSchema = mongoose.Schema({
                title: String,
                image: {type: String, default: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60"},
                body: {type: String, default: "No content was written" },
                created: {type: String, default: moment().format("dddd, MMMM Do YYYY")}
});

// COMPILING A MONGOOSE MODEL FOR OUR SCHEMA
const Blog = mongoose.model("Blog", blogSchema);


// ROUTES
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

app.get("/blogs/new" , (req, res) => {
    res.render("new");
});

app.post("/blogs", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log(req.body.blog.body);
    Blog.create(req.body.blog, (err, blog) => {
        if (err) {
             res.redirect('/blogs/new');
        } else {
            res.redirect("/blogs/" + blog._id)
        }
    })
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, blogFound) => {
        if (err || blogFound === null) {
            res.redirect('/blogs');
        } else {
            res.render("show", {blog: blogFound})
        }
    });    
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            console.log(err);
        } else {
            res.render("edit", {blog: foundBlog});
        }
    })
});

app.put("/blogs/:id", (req, res) => {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, foundBlog) => {
        if (err) {
            res.redirect("/blogs")
        } else {
            res.redirect(`/blogs/${foundBlog._id}`)
        }
    })
});


app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err, deletedBlog) => {
        if (err) {
            console.log(err);
        } else {
             res.redirect("/blogs");
        }
    })
});


// SETTING UP THE PORT 
app.listen(PORT, () => {
    console.log("The Blog App is up and running!");
})      

