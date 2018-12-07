var PORT = 8080; // default port 8080
var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [1],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))




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
  }
  return false;
}

function checkEmailPassword(email) {
  for (var i in users) {
    if(users[i]["email"] === email){
      return users[i].password;
    }
}


}
// function urlsOwnedByID(userID){
//   var array = [];
//   //j is short url
//     for (var j in urlDatabase){
//       urlDatabase[j].owner === userID
//         //array.push(urlDatabase[j]);
//         return true;
//     }
//     //return array;
//     return false;
// }

function urlsForUser(id) {
  var showUrls = {};
  for (var shortURL in urlDatabase){
    if( urlDatabase[shortURL].owner === id ){
      showUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return showUrls;
}

var urlDatabase = {
  "b2xVn2": {  longURL: "http://www.lighthouselabs.ca" , owner : "userRandomID"} ,

  "9sm5xK": {  longURL: "http://www.google.com", owner : "user2RandomID"}
};


const hashedPasswordTestOne = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const hashedPasswordTestTwo = bcrypt.hashSync("dishwasher-funk", 10);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPasswordTestOne
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPasswordTestTwo,
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

  var hashedPassword = checkEmailPassword(email)
  //write a function that will get the hashed password for the email which you will supply
   bcrypt.compareSync(request.body.password, hashedPassword);
  var id = checkEmailForDuplicate(email);


  if(bcrypt.compareSync(request.body.password, hashedPassword)){
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
  request.session.user_id = userID;

  if(request.body.email && request.body.password && !checkEmailForDuplicate(request.body.email) ){
    const hashedPassword = bcrypt.hashSync(request.body.password, 10);
    users[userID] = { id: request.session.user_id, email: request.body.email, password: hashedPassword}; //add bcrypt
    response.cookie('userID', request.session.user_id);

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
  if(request.cookies["userID"]){
    var urlGenerated = urlsForUser(request.cookies["userID"]);
    let templateVars = { urls: urlGenerated, user: users[request.cookies["userID"]] };
    response.render("urls_index", templateVars);
  }
  else {
    response.redirect("/login")
  }

});

app.post("/urls/:short/delete", (request, response) => {

  if(urlDatabase[request.params.short].owner === request.cookies["userID"]){
    delete urlDatabase[request.params.short];
  }
  response.redirect('/urls/');
});

app.post("/logout", (request, response) => {
  response.clearCookie("userID");
  response.redirect('/urls/');
});

app.post("/urls/:short/update", (request, response) => {

  if(urlDatabase[request.params.short].owner === request.cookies["userID"]){
    urlDatabase[request.params.short].longURL = request.body.longURL;
    response.redirect('/urls/')
  }
  response.redirect('/urls/'+request.params.short);
});

app.get("/urls/new", (request, response) => {
  if(request.cookies["userID"]){
    response.render("urls_new", {user: users[request.cookies["userID"]]});
  }
  response.redirect("/login");
});

app.post("/urls", (request, response) => {
  let short = generateRandomString();
  urlDatabase[short] = request.body.longURL;
  response.redirect(`/urls/${short}`);
});

app.get("/urls/:id", (request, response) => {

  let flag = false;

  let templateVars = { shortURL: request.params.id, urls: urlDatabase, user: users[request.cookies["userID"]]};
    for( var i in urlDatabase){
      if(templateVars.shortURL === i){
        flag = true;
      }
    }

    if(flag && request.cookies["userID"]){

      response.render("urls_show", templateVars);
    } else {
      response.redirect("/urls")
    }


});


app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});