var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString() {
  let array = [];
  let alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  for (var i = 0; i < 6; i++) {
    let math = Math.floor(Math.random() * 25)

    array.push(alphabet[math]);
  }

  return array.toString().split(",").join("");
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.post("/urls/:short/delete", (request, response) => {
  delete urlDatabase[request.params.short];
  response.redirect('/urls/');
});

app.post("/urls/:short/update", (request, response) => {

  urlDatabase[request.params.short] = request.body.longURL;
  response.redirect('/urls/');

});

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.post("/urls", (request, response) => {

  let short = generateRandomString();
  urlDatabase[short] = request.body.longURL;

  response.redirect(`/urls/${short}`);


});

app.get("/urls/:id", (request, response) => {

  let templateVars = { shortURL: request.params.id, urls: urlDatabase };
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