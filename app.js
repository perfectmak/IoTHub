var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var expressHandleBars = require("express4-handlebars");
var handleBarsExtName = expressHandleBars.get("extname");

var routes = require("./routes/index");
var users = require("./routes/users");

var myWebSocket = require("./my_modules/myws/myws");

var app = express();


// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");
app.engine(handleBarsExtName, expressHandleBars.__express);
app.set("view engine", handleBarsExtName);

var viewsPath = "views";
expressHandleBars.set("layout_dir", path.join(viewsPath, "layout"));
// I think this is a bug but viewsPaths should be ommited for partials.
expressHandleBars.set("partials_dir", path.join("", "partials")); 
expressHandleBars.set("useLayout", true)
expressHandleBars.set("layout", "layout");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// this is the part that matters the most
app.use("/", routes);
app.use("/users", users);

//handle routes for websocket service
myWebSocket.start();
app.use("/ws", myWebSocket);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {}
  });
});


module.exports = app;
