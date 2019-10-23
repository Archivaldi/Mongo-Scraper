var express = require("express");
var app = express();

app.set("view engine", "ejs");

var bodyParser = require("body-parser");

var cheerio = require("cheerio");

var mongojs = require("mongojs");

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var request = require("request");

var db = mongojs(databaseUrl, collections);


db.on("error", function(error) {
  console.log("Database Error:", error);
});



// Main route (simple Hello World Message)
app.get("/", function(req, res) {
    request.get("https://www.foxnews.com/politics", function(err,response, body){
        var $ = cheerio.load(body);
        var results = [];
        $("h4.title").each(function(i, element){
          var title = $(element).text();
          results.push({Title: title});
        })
        res.render("index", {results: results});
    });
  });

  app.listen("3000", function(){
      console.log("Server running on 3000");
  });