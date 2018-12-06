var PORT = 8080; // default port 8080
var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// TO DO:
// if i go to urls/anything it tries to update it

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

      return users[i]["id"];
    }
    return false;
  }
}
function checkEmailPassword(email,password) {

  for (var i in users) {

    if(users[i]["email"] === email && users[i]["password"] === password){

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

app.get( "/login", (request, response) => {
  let templateVars = { urls: urlDatabase, users: users[request.cookies["userID"]] };
  response.render("login", templateVars);
});

app.post("/login", (request, response) => {

  var email = request.body.email;
  var password = request.body.password;
  var id = checkEmailForDuplicate(email);

  if(checkEmailPassword(email,password)){
    response.cookie('userID',id);
    response.redirect('/urls/');
  }
  else {
    response.status(403);
    response.redirect('/login/');
  }
});

app.get("/register", (request, response) => {
  let templateVars = { urls: urlDatabase, user: users[request.cookies["userID"]] };
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
      response.render('notfound')
  }
  else {
      response.status(400);
      response.render('notfound')
  }

});

app.get("/urls", (request, response) => {

  let templateVars = { urls: urlDatabase, user: users[request.cookies["userID"]] };
  response.render("urls_index", templateVars);
});

app.post("/urls/:short/delete", (request, response) => {
  delete urlDatabase[request.params.short];
  response.redirect('/urls/');
});

app.post("/logout", (request, response) => {
  response.clearCookie("userID");
  response.redirect('/urls/');
});

app.post("/urls/:short/update", (request, response) => {
  urlDatabase[request.params.short] = request.body.longURL;
  response.redirect('/urls/');
});

app.get("/urls/new", (request, response) => {
  response.render("urls_new", {user: users[request.cookies["userID"]]});
});

app.post("/urls", (request, response) => {
  let short = generateRandomString();
  urlDatabase[short] = request.body.longURL;
  response.redirect(`/urls/${short}`);
});

app.get("/urls/:id", (request, response) => {

  let templateVars = { shortURL: request.params.id, urls: urlDatabase, user: users[request.cookies["userID"]]};
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