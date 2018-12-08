
//adds the dependencies for this web app
var PORT = 8080; // default port 8080
var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
//allows my app to use these npm libraries
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




//this function will generat a random 6 character string
function generateRandomString() {
  let array = [];
  let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  for (var i = 0; i < 6; i++) {
    let math = Math.floor(Math.random() * 25)
    array.push(alphabet[math]);
  }
  return array.toString().split(",").join("");
}

//this function will check a passed in email and compare it to all of the stored emails
//will return the id for use if there is a duplicate
function checkEmailForDuplicate(email) {
  for (var i in users) {
    if(users[i]["email"] === email){
      return users[i]["id"];
    }
  }
  return false;
}
//this function takes in an email and returns the password for that email
//if there is no existing password it returns an empty sting for bcypt compareSync
function checkEmailPassword(email) {
  for (var i in users) {
    if(users[i]["email"] === email){
      return users[i].password;
    }
    return "";
  }
}
// this function will returnn the urls that belong to a user
function urlsForUser(id) {
  var showUrls = {};
  for (var shortURL in urlDatabase){
    if( urlDatabase[shortURL].owner === id ){
      showUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return showUrls;
}
//url database with the shortUrl generated as the key
var urlDatabase = {
  "b2xVn2": {  longURL: "http://www.lighthouselabs.ca" , owner : "userRandomID"} ,

  "9sm5xK": {  longURL: "http://www.google.com", owner : "user2RandomID"}
};

//hashing the passwords for the two staic users
const hashedPasswordTestOne = bcrypt.hashSync("purple-monkey-dinosaur", 10);
const hashedPasswordTestTwo = bcrypt.hashSync("dishwasher-funk", 10);
//users object
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
//root directory
//if there is a logged in user it redirects to urls
//redirects to login if no user logged in
app.get("/", (request, response) => {
  if(request.cookies["userID"]) {
    response.redirect("/urls/");
  } else {
    response.redirect("/login");
  }
});
// if they try to access the login pavge while loggged in it will redirect them to the /urls page
app.get( "/login", (request, response) => {
  if(!request.cookies["userID"])  {
    let templateVars = { urls: urlDatabase, users: users[request.cookies["userID"]] };
    response.render("login", templateVars);
  } else{
    response.redirect("/urls");
  }
});
//will check if there is an existing email and will check the password for that email and then let them log in
//uses bcypt on the password
//If the user enters a valid email password combo they will be logged in with a userID cookie to remember them
app.post("/login", (request, response) => {
  var email = request.body.email;
  var hashedPassword = checkEmailPassword(email)
  var id = checkEmailForDuplicate(email);
  if(bcrypt.compareSync(request.body.password, hashedPassword) && id && hashedPassword){
    response.cookie('userID',id);
    response.redirect('/urls/');
  }
  else {
    response.status(403);
    response.redirect('/login/');
  }
});
//if the user tries to access this page while logged in it will redirect them to the /urls page
app.get("/register", (request, response) => {
  if(!request.cookies["userID"])  {
  let templateVars = { urls: urlDatabase, user: users[request.cookies["userID"]] };
  response.render("register", templateVars);
}else{
    response.redirect("/urls")
  }
});
//Will genererate a unique random string and assign it to their cookie
// will check that the email andpassword are valid inputs
//hashes their password with bcrypt
// if they enter an existing email it will render a html warning page
app.post("/register", (request, response) => {
  let userID = generateRandomString ();
  request.session.user_id = userID;
  if(request.body.email && request.body.password && !checkEmailForDuplicate(request.body.email) ){
    const hashedPassword = bcrypt.hashSync(request.body.password, 10);
    users[userID] = { id: request.session.user_id, email: request.body.email, password: hashedPassword};
    response.cookie('userID', request.session.user_id);
    response.redirect('/urls/');
  } else if (checkEmailForDuplicate(request.body.email)) {
      response.status(400);
      response.render('repeatEmail');
  } else {
      response.status(400);
      response.render('Needvalid')
  }

});
//requires the user to be logged in to see their shortened urls
//if they are not logged in they will be asked to login or register
//if they try to add a new url they will be asked to log in
app.get("/urls", (request, response) => {
  if(request.cookies["userID"]){
    var urlGenerated = urlsForUser(request.cookies["userID"]);
    let templateVars = { urls: urlGenerated, user: users[request.cookies["userID"]] };
    response.render("urls_index", templateVars);
  } else {
    let templateVars = { urls: urlGenerated, user: users[request.cookies["userID"]] };
    response.render("notLoggedIn",  templateVars);
  }
});
// will delete an existing shortend url if they are the owner of that shortend url
app.post("/urls/:short/delete", (request, response) => {
  if(urlDatabase[request.params.short].owner === request.cookies["userID"]){
    delete urlDatabase[request.params.short];
  }
  response.redirect('/urls/');
});
//will log out the user and clears their cookies
app.post("/logout", (request, response) => {
  response.clearCookie("userID");
  response.redirect('/urls/');
});
// allows the user to update the long url to a corrisponding shortend url,
// if they are the owner of the short url
app.post("/urls/:short/update", (request, response) => {
  if(urlDatabase[request.params.short].owner === request.cookies["userID"]){
    urlDatabase[request.params.short].longURL = request.body.longURL;
    response.redirect('/urls/')
  }
  else{
  response.redirect('/urls/' + request.params.short);
}
});
//only allows the user to make new urls if they are logged in
app.get("/urls/new", (request, response) => {
  if(request.cookies["userID"]){
    response.render("urls_new", {user: users[request.cookies["userID"]]});
  }
  else {
  response.redirect("/login");
}
});
//creates a new short url from a long url that the user inputs
app.post("/urls", (request, response) => {
  let short = generateRandomString();
  urlDatabase[short] = {"longURL": request.body.longURL, "owner": request.cookies["userID"]};
  response.redirect(`/urls/${short}`);
});
//only allows access to a short urls page if the current user is the owner of that short url
//sends html errors if they do not have the correct access or they there is no short url by that ID
app.get("/urls/:id", (request, response) => {
  let flag = false;
  let templateVars = { shortURL: request.params.id, urls: urlDatabase, user: users[request.cookies["userID"]]};
  for( var i in urlDatabase){
    if(templateVars.shortURL === i){
      flag = true;
    }
  }
  if(flag && request.cookies["userID"] === urlDatabase[request.params.id].owner){
      response.render("urls_show", templateVars);
  } else if(flag){
      response.render("doNotHaveRights")
  } else {
      response.render("noShortUrlByThatName")
  }
});
//redirects to the long url
//is usuable even if the user is not logged in
// this is for the user to share their shortend url as a link
app.get("/u/:shortURL", (request, response) => {
  var flag = false;
  for( var i in urlDatabase){
    if(request.params.shortURL === i){
      flag = true;
      let longURL = urlDatabase[request.params.shortURL];
      response.redirect(longURL.longURL);
    }
  }
  if(flag){
    let longURL = urlDatabase[request.params.shortURL];
    response.redirect(longURL.longURL);
  } else {
      response.render("noShortUrlByThatName")
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});