// load the things we need
var express = require('express');
var app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { findUserByEmail, urlsForUser, generateRandomString } = require('./helper');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['b6d0e7eb-8c4b-4ae4-8460-fd3a08733dcb', '1fb2d767-ffbf-41a6-98dd-86ac2da9392e']
}));


// set the view engine to ejs

app.set('view engine', 'ejs');



const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "12s1vd" }
};


const users = { 
  "12s1vd": {
    id: "12s1vd", 
    email: "user@example.com", 
    password: '$2b$10$zp8yf/f8NiVRxNzxzHHgFOzKKkuNFeeUkdnWfQJRtsiJJ0bRx1Bjy'
  },
};




// Displays the index page
app.get('/', function(req, res) {
    const userID = req.session.user_id;
    const user = users[userID];
    const urls = urlsForUser(userID, urlDatabase);
    if (!user) {
      res.redirect("/login");
      return;
    }
    // const templateVars = {
    //   urls,
    //   email: user.email
    // }
      // res.render("urls_index", templateVars);
      res.redirect("/urls");
});


// Displays the about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});


// show the user's URL's
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.send('Please Register or Login');
  } else {
     const userURLS = urlsForUser(userID, urlDatabase);
      const templateVars = { urls: userURLS, email: users[userID].email };
      res.render("urls_index", templateVars);
  }
});

// Displays the create new URL form
  app.get("/urls/new", (req, res) => {
    const user = req.session.user_id;
    if (!user) {
      res.redirect('/login');
    } else {
      const templateVars = { email: users[user].email };
      res.render("urls_new", templateVars);
    }
  });

// Displays the user's URLs
  app.get("/urls/:shortURL", (req, res) => {
    const userID = req.session.user_id;
    const shortURL = req.params.shortURL;
    const url = urlDatabase[shortURL];
    if (!userID) {
      res.status(403);
      return res.send('Error 403: Please Register or Login');
    }  
    if (userID !== url.userID) {
      res.status(403);
      res.send("This URL does not belong to you");
      return;
    }
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: users[userID].email};
    res.render("urls_show", templateVars);
    
  });

  // Displays the longURL page
  app.get('/u/:shortURL', (req, res) => {
    const shortURL = req.params.shortURL;
    if (!urlDatabase[shortURL]) {
      res.status(404);
      res.send("This URL does not exist")
      return;
    }
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(`${longURL}`);
  });


// Creates a new shortURL
  app.post("/urls", (req, res) => {
    const user = req.session.user_id;
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: user };
    res.redirect(`/urls/${shortURL}`);
  });


// Deletes a user's URL
  app.post("/urls/:shortURL/delete", (req, res) => {
    const user = req.session.user_id;
    if (!user) {
      res.send('Please Register or Login');
    } else {
      const key = req.params.shortURL;
      if (user === urlDatabase[key].userID) {
        delete urlDatabase[key];
        res.redirect("/urls");
      } else {
        res.send('Unauthorized access');
      }
    }
  });

// Updates a user's URL, then redirects to the URL's page.
  app.post("/urls/:shortURL/update", (req, res) => {
    const user = req.session.user_id;
    if (!user) {
      res.send('Please Register or Login');
    } else {
      const key = req.params.shortURL;
      if (user === urlDatabase[key].userID) {
        const key = req.params.shortURL;
        const longURL = req.body.longURL;
        urlDatabase[key].longURL = longURL;
        res.redirect("/urls");
      } else {
        res.send('Unauthorized access');
      }
    }
  });

// Displays the login page
  app.get('/login', (req, res) => {
    const userID = req.session.user_id;
    if (userID) {
      res.redirect("/urls");
      return;
    }
    res.render("login")      
  });


// Logs in the user, if the email address and password match, then redirects to the user's URL's page
  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = findUserByEmail(email, users);
    if (!user || password === "") {
      res.status(403);
      return res.send('Error: 403');  
    } 
    if (bcrypt.compareSync("password", user.password)) {
      res.status(403);
      return res.send('Error: 403'); 
    }
    req.session.user_id = user.id;
    res.redirect("/urls");
  });


// Logs out the current user.
  app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
  });


// Displays the register page for new users.
  app.get('/register', (req, res) => {
    const userID = req.session.user_id;
    if (userID) {
      res.redirect("/urls");
      return;
    }
    res.render("register")      
  });


// Registers a new user and redirects to the URL page.
  app.post('/register', (req, res) => {
    const user_id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = findUserByEmail(email, users);
    if (!email || password === "") {
      res.status(403);
      res.send('Error: 403');
    } else {
      users[user_id] = { id: user_id, email: email, password: hashedPassword };
      req.session.user_id = user_id;
      res.redirect("/urls");
    }
  });



app.listen(8080);
console.log('8080 is the magic port');