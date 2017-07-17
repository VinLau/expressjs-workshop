var express = require('express');
var app = express();
var mysql = require('promise-mysql');
var RedditAPI = require('./reddit');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

var connection = mysql.createPool({
   host: 'localhost',
   user: 'root', // CHANGE THIS :)
   password: 'root',
   database: 'reddit',
   connectionLimit: 10
});

var myReddit = new RedditAPI(connection);

app.set('view engine', 'pug');

//setting middleware
app.use('/files', express.static(__dirname + '/static_files')); //Serves resources from static_files folder


app.get('/hello', function (req, res) {
   if (req.query.name) {
      res.send(" <h1> Hello " + req.query.name + " </h1> ");
   }
   else {
      res.send("<h1> Hello World!</h1>");
   }
});

app.get('/calculator/:operation', function (req, res) { //http://127.0.0.1:3333/calculator/multiply?num1=200&num2=500   <-- try this
   if (req.params.operation !== "add" && req.params.operation !== "multiply") {
      console.log("user made faulty operation choice!!!!!!!" + req.params.operation);
      res.status(400).send('Bad request, you sent the wrong operation!!!');
   }
   let numOne = 0;
   let numTwo = 0;
   let solNum;
   if (req.query.num1) {
      numOne = parseInt(req.query.num1); //if we didnt parse int it would return a concatenated string during 'add'
   }
   if (req.query.num2) {
      numTwo = parseInt(req.query.num2);
   }
   if (req.params.operation === "add") {
      solNum = numOne + numTwo;
   }
   else {
      solNum = numOne * numTwo;
   }
   res.send({
      operation: req.params.operation,
      firstOperand: numOne,
      secondOperand: numTwo,
      solution: solNum
   });

});

app.get('/posts', function (req, res) {
   myReddit.getAllPosts()
      .then(function (response) {
         console.log(response);
         return response
      })
      // .then(function (response) {
      //    let output = `<div id="posts"> <h1>List of posts</h1> <ul class="posts-list">`;
      //
      //    response.forEach(function (elemObj) {
      //       let name = elemObj.user.username ? elemObj.user.username : ""; //check if a variable exists
      //       let title = elemObj.title ? elemObj.title : "";
      //       let url = elemObj.url ? elemObj.url : "";
      //       output +=
      //          `
      //       <li class="post-item">
      //           <h2 class="post-item__title">
      //               <a href="` + url + `"> ` + title + ` </a>
      //           </h2>
      //           <p>Created by ` + name + `</p>
      //       </li>
      //       `
      //    });
      //
      //    output += ` </ul> </div> `
      //    res.send(output);
      // })
      .then(function (posts){
         //console.log(posts, "response array")
         res.render('post-list', { posts : posts} ); //NOTE: we are sending an object with the array as an object field to PUG, PUG accepts objects!!
      })
});

app.get('/new-post', function (req, res) {
   // res.send(
   // `
   //  <form action="/createPost" method="POST"><!-- why does it say method="POST" ?? -->
   //      <p>
   //          <input type="text" name="url" placeholder="Enter a URL to content">
   //      </p>
   //      <p>
   //          <input type="text" name="title" placeholder="Enter the title of your content">
   //      </p>
   //          <button type="submit">Create!</button>
   //  </form>
   // `
   // );
   res.render('create-content');
});

app.post('/createPost', urlencodedParser, function (req, res){
   if (!req.body) { return res.sendStatus(400) }
   console.log(req.body);
   myReddit.createPost({
      userId : 1,
      title : req.body.title,
      url : req.body.url,
      subredditId : 1
   });
   res.redirect("/posts")
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(3333, "127.0.0.1", function () {
   console.log('Example app listening at http://%s', "127.0.0.1");
});
