var PORT = 8080; // default port 8080
var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



function generateRandomString() {
  let array = [];
  let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  for (var i = 0; i < 6; i++) {
    let math = Math.floor(Math.random() * 25)

    array.push(alphabet[math]);
  }

  return array.toString().split(",").join("");
}


function checkEmailForDuplicate(email) {

  for (var i in users) {

    if(users[i]["email"] === email){

      return true;
    }
    return false;
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
}

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.post("/login", (request, response) => {
  response.cookie('username',request.body.username);
  response.redirect('/urls/');
});

app.get("/register", (request, response) => {
  let templateVars = { urls: urlDatabase, username: request.cookies["username"] };
  response.render("register", templateVars);
});

app.post("/register", (request, response) => {
  let userID = generateRandomString ();

  if(request.body.email && request.body.password && !checkEmailForDuplicate(request.body.email) ){

    users[userID] = { id: userID, email: request.body.email, password: request.body.password};
    response.cookie('userID', userID);
    response.redirect('/urls/');
  } else if (checkEmailForDuplicate(request.body.email)) {
      response.status(400);
      alert('hello')
  }
  else {
      response.status(400);
      alert("a")
  }

});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase, username: request.cookies["username"] };
  response.render("urls_index", templateVars);
});

app.post("/urls/:short/delete", (request, response) => {
  delete urlDatabase[request.params.short];
  response.redirect('/urls/');
});

app.post("/logout", (request, response) => {
  response.clearCookie("username");
  response.redirect('/urls/');
});

app.post("/urls/:short/update", (request, response) => {
  urlDatabase[request.params.short] = request.body.longURL;
  response.redirect('/urls/');
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new", {username: request.cookies["username"]});
});

app.post("/urls", (request, response) => {
  let short = generateRandomString();
  urlDatabase[short] = request.body.longURL;
  response.redirect(`/urls/${short}`);
});

app.get("/urls/:id", (request, response) => {

  let templateVars = { shortURL: request.params.id, urls: urlDatabase, username: request.cookies["username"]};
  if(templateVars.shortURL){
    response.render("urls_show", templateVars);
  }
  else{
    alert('no url by that name');
  }
});


app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});