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
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "1" }
  };


  const users = { 
    "1": {
      id: "1", 
      email: "user@example.com", 
      password: "test"
    },
  };

  
  function generateRandomString() {
    return Math.random().toString(36).substring(2,8);
  };

  function findUserByEmail(email) {
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

const urlsForUser = (user) => {
  let filteredUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === user) {
      filteredUrls[url] = { longURL: urlDatabase[url].longURL, userID: user }
    }
  }
  return filteredUrls;
};

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  if (!userID) {
    res.send('Please Register or Login');
  } else {
     const userURLS = urlsForUser(userID);
      const templateVars = { urls: userURLS, email: users[userID].email };
      res.render("urls_index", templateVars);
  }
});

  app.get("/urls/new", (req, res) => {
    const user = req.cookies["user_id"];
    if (!user) {
      res.redirect('/login');
    } else {
      const templateVars = { email: users[user].email };
      res.render("urls_new", templateVars);
    }
  });

  app.get("/urls/:shortURL", (req, res) => {
    const user = req.cookies["user_id"];
    if (!user) {
      res.send('Please Register or Login');
    }  if (user) {
      const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: users[user].email};
      res.render("urls_show", templateVars);
    }
  });
  
  app.get('/u/:id', (req, res) => {
    res.redirect(`${urlDatabase[req.params.id].longURL}`);
  });

  app.post("/urls", (req, res) => {
    const user = req.cookies["user_id"];
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: user };
    res.redirect("/urls");
  });


  app.post("/urls/:shortURL/delete", (req, res) => {
    const user = req.cookies["user_id"];
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

  app.post("/urls/:shortURL/update", (req, res) => {
    const user = req.cookies["user_id"];
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

  app.get('/login', (req, res) => {
    res.render("login")      
  });

  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = findUserByEmail(email);
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
    const user = findUserByEmail(email);
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