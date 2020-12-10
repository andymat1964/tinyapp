// load the things we need
var express = require('express');
var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  const users = { 
    user_id: {
      id: "1", 
      email: "user@example.com", 
      password: "test"
    },
  };

  
  function generateRandomString() {
    return Math.random().toString(36).substring(2,8);
  };

  function emailLookup(email) {
    for (let user in users) {
      if (email === users[user].email) {
        return users[user];
      }
    }
    return null;
  };

// index page
app.get('/', function(req, res) {
    var mascots = [
        { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
        { name: 'Tux', organization: "Linux", birth_year: 1996},
        { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
    ];
    var tagline = "No programming concept is complete without a cute animal mascot.";

    res.render('pages/index', {
        mascots: mascots,
        tagline: tagline
    });
});

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.get("/urls", (req, res) => {
    const user_id = req.cookies["user_id"];
    // console.log("userid in /urls:", user_id);
    let email;
    if (user_id !== undefined)  {
      if (users[user_id]) {
        email = users[user_id].email;
      }
    }
    const templateVars = { urls: urlDatabase, email: email };
    res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
    const user_id = req.cookies["user_id"];
    console.log(user_id);
    let email;
    if (user_id !== undefined)  {
      if (users[user_id]) {
        email = users[user_id].email;
      }
    }
    const templateVars = { urls: urlDatabase, email: email };
    res.render("urls_new", templateVars);
  });

  app.get("/urls/:shortURL", (req, res) => {
    const user_id = req.cookies["user_id"];
    let email;
    if (user_id !== undefined)  {
      if (users[user_id]) {
        email = users[user_id].email;
      }
    }
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: email};
    res.render("urls_show", templateVars);
  });


  app.post("/urls", (req, res) => {
    res.send("/urls/:shortURL");
  });

  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    const key = req.params.shortURL;
    delete urlDatabase[key];
    res.redirect("/urls");
  });

  app.post("/urls/:shortURL/update", (req, res) => {
    const key = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[key] = longURL;
    res.redirect("/urls");
  });

  app.get('/login', (req, res) => {
    res.render("login")      
  });

  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = emailLookup(email);
    console.log(user);
    if (!user) {
      res.status(403);
      return res.send('Error: 403');  
    } 
    if (password !== user.password) {
      res.status(403);
      return res.send('Error: 403'); 
    }
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  });

  app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
    res.redirect("/urls");
  });

  app.get('/register', (req, res) => {
    res.render("register")      
  });

  app.post('/register', (req, res) => {
    const user_id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const user = emailLookup(email);
    if (!email || password === "") {
      res.status(403);
      res.send('Error: 403');
    } else {
      users[user_id] = { id: user_id, email: email, password: password };
      res.cookie("user_id", user_id);
      res.redirect("/urls");
    }
  });




app.listen(8080);
console.log('8080 is the magic port');