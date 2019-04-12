
//---------------------------------------------------------------
//TINYAPP: A SHORTURL & LONGURL CONVERSION ENGINE
//---------------------------------------------------------------


//---------------------------------------------------------------
//VARIABLES
//---------------------------------------------------------------
const bodyParser = require("body-parser");
var express = require("express");
var cookieParser = require('cookie-parser');

var app = express();
var PORT = 8080; 
//---------------------------------------------------------------


//---------------------------------------------------------------
//DATA
//---------------------------------------------------------------
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Global Object "users"
const users = {};
//---------------------------------------------------------------


//---------------------------------------------------------------
//INITIALIZATION
//---------------------------------------------------------------
//Tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")

//Tells the Express app to use cookieParser as parameter for use
app.use(cookieParser());

//This needs to come before all of our routes
app.use(bodyParser.urlencoded({extended: true}));
//---------------------------------------------------------------


//---------------------------------------------------------------
//MAIN PAGE
//http://localhost:8080/urls
//---------------------------------------------------------------
app.get("/urls", (req, res) => {
    //let cookie_id = res.cookie("Cookies ", res.cookie).userID
    let templateVars = {
      user_id: req.cookies["user_id"], 
      urls: urlDatabase,
      email: users[req.cookies["user_id"]].email
    }; 
  res.render("urls_index", templateVars);
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//PAGE FOR EACH SHORTURL
//http://localhost:8080/urls/:shortURL
//---------------------------------------------------------------
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {
        user_id: req.cookies["user_id"], 
        shortURL: req.params.shortURL, 
        longURL: urlDatabase[req.params.shortURL] 
    };
    res.render("urls_show", templateVars);
  });
//---------------------------------------------------------------


//---------------------------------------------------------------
//PAGE TO CREATE NEW URL
//http://localhost:8080/urls/new
//---------------------------------------------------------------
//Purpose: GET Route to Show the Form to the User
//THIS needs to be BEFORE app.get("/urls/:id", ...) B/C any call to /urls/new will be handled by app.get("/urls/:id", ...) (as Express will think that "new" is a route parameter)
//Rule of Thumb: Routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
    let templateVars = {
        user_id: req.cookies["user_id"]}
    res.render("urls_new", templateVars);
  });

app.post("/urls", (req, res) => {
    let randomShortURL = generateRandomString();
    urlDatabase[randomShortURL] = req.body.longURL;
    res.redirect('/urls');
    // res.redirect(`/urls/${randomShortURL}`);
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//USER REGISTER
//from registration.ejs
//---------------------------------------------------------------
app.get("/register", (req, res) => {
    res.render("registration");
});

app.post("/register", (req, res) => {
    console.log("1111");
    let user_id = generateRandomString();
    users[user_id] = {};
    let userEmail = req.body.email;
    let userPassword = req.body.password;

    if (req.body.email === "" | req.body.password === "") {
        res.status(400);
        res.send("Please input an email and/or password.");
    } else if (emailLookup(userEmail)) {
        res.status(400);
        res.send("Your email already exists.");
    } else {
        //add a new user object to the global user (id, email, password)
        users[user_id]["id"] = user_id;
        users[user_id]["email"] = userEmail;
        users[user_id]["password"] = userPassword;
        res.cookie("user_id", users[user_id]["id"]); //sets the cookie
        res.redirect("/urls");
    }
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//EMAIL LOOKUP
//helper function
//---------------------------------------------------------------
function emailLookup(userEmail) {
    for (user in users) {
        if (userEmail === users[user]["email"]) {
            return true;
        }
    }
    return false;
}
//---------------------------------------------------------------


//---------------------------------------------------------------
//LOGIN
//---------------------------------------------------------------
app.get ("/login", (req,res) => {
    res.render("/login");
})

app.post("/login", (req,res) => {
    res.cookie("user_id", req.body.userID);
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//LOGOUT
//---------------------------------------------------------------
app.post("/logout", (req,res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//DELETE URL
//---------------------------------------------------------------
//Deletes a URL resource when user press DELETE button
//from urls_index.ejs (http://localhost:8080/urls)
app.post("/urls/:shortURL/delete", (req,res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//EDIT LONGURL
//---------------------------------------------------------------
//Updates longURL 
//from urls_show.ejs 
app.post("/urls/:shortURL/update", (req,res) => {
    delete urlDatabase[req.params.shortURL];
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//DISPLAY urlDatabase ARRAY OF OBJECTS
//helper function
//---------------------------------------------------------------
//The "u" is to differentiate itself from /url/ and so it doesn't conflict with the other GET routes
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  longURL
  ? res.redirect(longURL) 
  : res.send(`${req.params.shortURL} is not a valid short URL`);
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//DISPLAY urlDatabase ARRAY OF OBJECTS
//helper function
//---------------------------------------------------------------
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
//---------------------------------------------------------------


// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


//---------------------------------------------------------------
//GENERATES SHORTURL
//helper function
//---------------------------------------------------------------
function generateRandomString() {
    let randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let randomNumber = "";
    for (var i = 0; i < 6; i++) {
        randomNumber += randomCharacters.charAt(Math.floor(Math.random()*randomCharacters.length));
    }
    return randomNumber;
}
//---------------------------------------------------------------


//---------------------------------------------------------------
//LISTENER
//---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//---------------------------------------------------------------