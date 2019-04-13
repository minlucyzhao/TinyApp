
//---------------------------------------------------------------
//TINYAPP: A SHORTURL & LONGURL CONVERSION ENGINE
//---------------------------------------------------------------


//---------------------------------------------------------------
//VARIABLES
//---------------------------------------------------------------
const bodyParser = require("body-parser");
var express = require("express");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

var app = express();
var PORT = 8080; 
//---------------------------------------------------------------


//---------------------------------------------------------------
//DATA
//---------------------------------------------------------------
// var urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "jD34P" },
    b2xVn2: { longURL: "www.lighthouse.ca", userID: "aJ48lW" }
  };

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    },
    "aJ48lW": {
      id: "aJ48lW", 
      email: "user3@example.com", 
      password: "hello-world"
    }
  }
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

app.use(cookieSession({
    name: 'session',
    keys: ['key1'],
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
//---------------------------------------------------------------


//---------------------------------------------------------------
//RETURN LONGURLs GIVEN USERID
//---------------------------------------------------------------
function urlsForUser(id) {
    let userURLs = {};
    for (key in urlDatabase) {
        if (urlDatabase[key].userID === id) {
            userURLs[key] = urlDatabase[key].longURL;
        }
    }
    return userURLs;
}
//---------------------------------------------------------------


//---------------------------------------------------------------
//MAIN PAGE
//http://localhost:8080/urls
//---------------------------------------------------------------
app.get("/urls", (req, res) => {
    //let cookie_id = res.cookie("Cookies ", res.cookie).userID
    console.log("users:", users);
    console.log(req.cookies["user_id"]);

    let urls = {};
    let templateVars = {
        user_id: req.cookies["user_id"], 
        urls: {},
        email: users[req.cookies["user_id"]]["email"]
      }; 
    
    if(req.cookies["user_id"]) {
        templateVars.urls = {
            ...
            urlsForUser(req.cookies["user_id"])
        };
    }

    console.log(templateVars);
    res.render("urls_index", templateVars);
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
    if (!req.cookies["user_id"]) {
        res.redirect("/login");
    } else {
        let templateVars = {
            user_id: req.cookies["user_id"],
            email: users[req.cookies["user_id"]].email
        };
        res.render("urls_new", templateVars);
    }
  });

app.post("/urls", (req, res) => {
    let randomShortURL = generateRandomString();
    urlDatabase[randomShortURL] = {
        longURL: req.body.longURL,
        userID: req.cookies["user_id"]
    };
    res.redirect("/urls");
    // res.redirect(`/urls/${randomShortURL}`);
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//PAGE FOR EACH SHORTURL
//http://localhost:8080/urls/:shortURL
//---------------------------------------------------------------
app.get("/urls/:shortURL", (req, res) => {
    if (!req.cookies["user_id"]) {
        res.redirect("/login");
    } else {
        let templateVars = {
            user_id: req.cookies["user_id"], 
            shortURL: req.params.shortURL, 
            longURL: urlDatabase[req.params.shortURL].longURL,
            email: users[req.cookies["user_id"]].email
        };
        res.render("urls_show", templateVars);
    }
  });
//---------------------------------------------------------------


//---------------------------------------------------------------
//USER REGISTER
//from registration.ejs
//---------------------------------------------------------------
app.get("/register", (req, res) => {
    console.log(req.cookies["user_id"]);
    console.log(users);
    let templateVars = {};
    if (req.cookies["user_id"] === undefined) {
        res.render("registration", {user_id: undefined});
    } else {
        res.redirect("/urls");
    }
});

app.post("/register", (req, res) => {
    // const hashed = bcrypt.hashSync(req.body.password, 10);
    let user_id = generateRandomString();
    users[user_id] = {};
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    let hashedPassword = bcrypt.hashSync(userPassword,10);

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
        users[user_id]["password"] = hashedPassword;
        res.cookie("user_id", users[user_id]["id"]); //sets the cookie
        res.redirect("/urls");
    }
    console.log(hashedPassword);
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//EMAIL LOOKUP IMPORTANT (Functions should start with verb)
//helper function 
//---------------------------------------------------------------
function emailLookup(userEmail, users) {
    for (user in users) {
        if (userEmail === users[user]["email"]) {
            return true;
        }
    }
    return false;
}
//---------------------------------------------------------------


//---------------------------------------------------------------
//PASSWORD LOOKUP IMPORTANT (Functions should start with verb)
//helper function
//---------------------------------------------------------------
function passwordLookup(userPassword, users) {
    for (user in users) {
        if (userPassword === users[user]["password"]) {
            return true;
        }
    }
    return false;
}
//---------------------------------------------------------------


//---------------------------------------------------------------
//LOGIN
//---------------------------------------------------------------
app.get("/login", (req,res) => {
    let templateVars = {};
    if (req.cookies["user_id"] === undefined) {
        templateVars = {
            user_id: req.cookies["user_id"], 
        }; 
        res.render("login", templateVars);
    } else {
        res.redirect("/urls");
    }
})

app.post("/login", (req,res) => {
    //check userDatabase if email and password exist
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    let userId = findUserId(userEmail, userPassword);
    console.log("before", userId);
    console.log("userPassword: ", userPassword);
    console.log("userId", userId);
    console.log("from userId", users[userId].password);

    if(userId === "") {
        console.log("entered",userId);
        res.status(403);
        res.send("Email and/or Password cannot be found.");
    } else if (!bcrypt.compareSync(userPassword, users[userId].password)) {
        res.status(403);
        res.send("Password is incorrect. Try again!");
    } else {
        res.cookie("user_id", userId);
        res.redirect("/urls");
    }
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//LOGOUT
//---------------------------------------------------------------
app.get("/logout", (req,res) => {
    res.clearCookie("user_id");
    res.redirect("login");
});

app.post("/logout", (req,res) => {
    res.clearCookie("user_id");
    res.redirect("/login");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//DELETE URL
//from urls_index.ejs (http://localhost:8080/urls)
//---------------------------------------------------------------
app.post("/urls/:shortURL/delete", (req,res) => {
    if (!req.cookies["user_id"]) {
        res.redirect("/login");
    } else {
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");
    }
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//EDIT LONGURL
//from urls_show.ejs (http://localhost:8080/urls)
//---------------------------------------------------------------
app.post("/urls/:shortURL/update", (req,res) => {
    if (!req.cookies["user_id"]) {
        res.redirect("/login");
    } else {
        urlDatabase[req.params.shortURL].longURL = req.body.longURL;
        res.redirect("/urls");
    }
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//FIND USER_ID WITH USER EMAIL
//helper function
//---------------------------------------------------------------
function findUserId(userEmail, userPassword) {
    console.log("user object", users);
    let user_id = "";
    for(user in users) {
        console.log(users[user]);
        if (users[user]["email"] === userEmail && bcrypt.compareSync(userPassword, users[user]["password"])) {
            user_id = users[user]["id"];
            break;
        }
    }
    console.log("user_id from function", user_id);
    return user_id;
}
//---------------------------------------------------------------


//---------------------------------------------------------------
//DISPLAY urlDatabase ARRAY OF OBJECTS
//---------------------------------------------------------------
//The "u" is to differentiate itself from /url/ and so it doesn't conflict with the other GET routes
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
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


//---------------------------------------------------------------
//OUTPUT HELLO WORLD 
//---------------------------------------------------------------
app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//---------------------------------------------------------------


//---------------------------------------------------------------
//GENERATES SHORT URL
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