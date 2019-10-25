const express = require("express");
const app = express();

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser())

const cheerio = require("cheerio");

const mongojs = require("mongojs");

const databaseUrl = "scraper";
const collections = ["scrapedData"];

const request = require("request");

const db = mongojs(databaseUrl, collections);


db.on("error", function (error) {
    console.log("Database Error:", error);
});

function updateDb(title, link, content) {
    db.scrapedData.update(
        { Title: title, Link: link },
        { $set: { Title: title, Link: link, Content: content } },
        { upsert: true },
    );
};

app.post("/saveArticle", function (req, res) {
    //res.json(req.body);
    var title = req.body.title;
    var link = req.body.link;
    var content = req.body.content;
    updateDb(title, link, content);
})

app.get("/savedArticles", function (req, res) {
    db.scrapedData.find(function (error, result) {
        res.render("savedArticles", { results: result });
    });
});

app.post("/addComment", function (req, res) {
    var id = req.body.id;
    var comment = req.body.newComment;
    db.scrapedData.update({ "_id": mongojs.ObjectID(id) }, { $push: { Comments: comment } }, function (error, response) {
        if (error) {
            console.log(error)
        }
    });
    res.redirect("/savedArticles");
})

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    request.get("https://www.foxnews.com/politics", function (err, response, body) {
        var $ = cheerio.load(body);
        var results = [];
        $("h4.title").each(function (i, element) {
            var title = $(element).text();
            var link = $(element).children().eq(0).attr("href");
            var content = $(element).parent().parent().children().eq(1).text();
            if (link[0] == "/") {
                link = "https://www.foxnews.com" + link;
            }
            if (content != "")
                results.push({ Title: title, Link: link, Content: content });
        });



        res.render("index", { results: results });
    });
});

app.listen("3000", function () {
    console.log("Server running on 3000");
});