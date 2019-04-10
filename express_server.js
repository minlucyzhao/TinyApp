var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

//Tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//This needs to come before all of our routes
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.send("Hello!");
});

//http://localhost:8080/urls
app.get("/urls", (req, res) => {
  //urls = urlDatabase 
  let templateVars = { urls: urlDatabase }; 
  res.render("urls_index", templateVars);
});

//http://localhost:8080/urls/new
//Purpose: GET Route to Show the Form to the User
//THIS needs to be BEFORE app.get("/urls/:id", ...) B/C any call to /urls/new will be handled by app.get("/urls/:id", ...) (as Express will think that "new" is a route parameter)
//Rule of Thumb: Routes should be ordered from most specific to least specific
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });

//The "u" is to differentiate itself from /url/ and so it doesn't conflict with the other GET routes
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  longURL
  ? res.redirect(longURL) 
  : res.send(`${req.params.shortURL} is not a valid short URL`);
});

app.post("/urls", (req, res) => {
    let randomShortURL = generateRandomString();
    urlDatabase[randomShortURL] = req.body.longURL;
    res.redirect(`/urls/${randomShortURL}`);
});

//http://localhost:8080/urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

function generateRandomString() {
    let randomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let randomNumber = "";
    for (var i = 0; i < 6; i++) {
        randomNumber += randomCharacters.charAt(Math.floor(Math.random()*randomCharacters.length));
    }
    return randomNumber;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});