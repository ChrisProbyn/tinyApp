
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

  "9sm5xK": {  longURL: "http://www.google.com", owner : "user2RandomID"},

  "asdfasdf": { longURL: "reddit.com", owner: "user2RandomID" }
};

var id = "user2RandomID";
console.log(urlsForUser(id));