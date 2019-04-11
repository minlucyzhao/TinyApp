var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var app = express();

var PORT = 8080; // default port 8080

//Tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")
//Tells the Express app to use cookieParser as parameter for use
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Global Object "users"
const users = {}

//This needs to come before all of our routes
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.send("Hello!");
});

//http://localhost:8080/urls
app.get("/urls", (req, res) => {
  //urls = urlDatabase 
  let templateVars = {userID: req.cookies["userID"], urls: urlDatabase }; 
  res.render("urls_index", templateVars);
});

//http://localhost:8080/urls/new
//Purpose: GET Route to Show the Form to the User
//THIS needs to be BEFORE app.get("/urls/:id", ...) B/C any call to /urls/new will be handled by app.get("/urls/:id", ...) (as Express will think that "new" is a route parameter)
//Rule of Thumb: Routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
    let templateVars = {userID: req.cookies["userID"]}
    res.render("urls_new", templateVars);
  });

app.post("/urls", (req, res) => {
    let randomShortURL = generateRandomString();
    urlDatabase[randomShortURL] = req.body.longURL;
    res.redirect('/urls');
    // res.redirect(`/urls/${randomShortURL}`);
});


//---------------------------------------------------------------
//REGISTER
//from registration.ejs
//---------------------------------------------------------------
app.get("/register", (req, res) => {
    res.render("registration");
});

app.post("/register", (req, res) => {
    let userID = generateRandomString();
    users[userId] = {};
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
        users[userID]["id"] = userID;
        users[userID]["email"] = userEmail;
        users[userID]["password"] = userPassword;
        res.cookie("user_id", userID); //sets the cookie
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
//LOGOUT
//---------------------------------------------------------------
app.post("/logout", (req,res) => {
    res.clearCookie("userID");
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//LOGIN
//---------------------------------------------------------------
app.post("/login", (req,res) => {
    res.cookie("userID", req.body.userID);
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//DELETE FUNCTION
//---------------------------------------------------------------
//Deletes a URL resource when user press DELETE button
//from urls_index.ejs (http://localhost:8080/urls)
app.post("/urls/:shortURL/delete", (req,res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//EDIT FUNCTION
//---------------------------------------------------------------
//Updates longURL 
//from urls_show.ejs 
app.post("/urls/:shortURL/update", (req,res) => {
    delete urlDatabase[req.params.shortURL];
    urlDatabase[req.params.shortURL] = req.body.longURL;
    res.redirect("/urls");
});
//---------------------------------------------------------------

//The "u" is to differentiate itself from /url/ and so it doesn't conflict with the other GET routes
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  longURL
  ? res.redirect(longURL) 
  : res.send(`${req.params.shortURL} is not a valid short URL`);
});


//http://localhost:8080/urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = {userID: req.cookies["userID"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

// app.get("/hello", (req, res) => {
//     res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


//---------------------------------------------------------------
//GENERATES SHORTURL
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
//Listener
//---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//---------------------------------------------------------------