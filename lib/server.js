var url = require("url");
var http = require("http");
var Provider = require("./provider");
var WebSocket = require("ws");

module.exports = {
  create: function(options) {
    if (options == null) {
      options = {};
    }

    if (options.logger == null) {
      options.logger = {
        log: function() {}
      };
    }

    var logger = options.logger;
    var provider = new Provider(options);

    var server = http.createServer(function(request, response) {

      var headers = request.headers;
      var method = request.method;
      var url = request.url;
      var body = [];

      request.on('error', function(err) {
        // console.error(err);
      }).on('data', function(chunk) {
        body.push(chunk);
      }).on('end', function() {
        body = Buffer.concat(body).toString();
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.

        var headers = {
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*"
        };

        switch (method) {
          case "OPTIONS":
            headers["Content-Type"] = "text/plain"
            response.writeHead(200, headers);
            response.end("");
            break;
          case "POST":
            //console.log("Request coming in:", body);

            var payload;
            try {
              payload = JSON.parse(body);
            } catch(e) {
              headers["Content-Type"] = "text/plain";
              response.writeHead(400, headers);
              response.end("400 Bad Request");
              return;
            }

            // Log messages that come into the TestRPC via http
            if (payload instanceof Array) {
              // Batch request
              for (var i = 0; i < payload.length; i++) {
                var item = payload[i];
                logger.log(item.method);
              }
            } else {
              logger.log(payload.method);
            }

            provider.send(payload, function(err, result) {
              headers["Content-Type"] = "application/json";
              response.writeHead(200, headers);
              response.end(JSON.stringify(result));
            });

            break;
          default:
            response.writeHead(400, {
              "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "*",
              "Content-Type": "text/plain"
            });
            response.end("400 Bad Request");
            break;
        }
      });
    });

    var wss = new WebSocket.Server({ server });

    var oldListen = server.listen;

    server.listen = function() {
      var args = Array.prototype.slice.call(arguments);
      var callback = function() {};
      if (args.length > 0) {
        var last = args[args.length - 1];
        if (typeof last == "function") {
          callback = args.pop();
        }
      }

      var intermediary = function(err) {
        if (err) return callback(err);
        server.provider.manager.waitForInitialization(callback);
      };

      args.push(intermediary);

      oldListen.apply(server, args);
    }

    wss.on('connection', function connection(ws, req) {
      var location = url.parse(req.url, true);
      ws.on('message', function incoming(message) {
        var payload = JSON.parse(message);

        // Log messages that come into the TestRPC
        if (payload instanceof Array) {
          // Batch request
          for (var i = 0; i < payload.length; i++) {
            var item = payload[i];
            logger.log(item.method);
          }
        } else {
          logger.log(payload.method);
        }

        provider.send(payload, function(err, result) {
          if (!result.id) {
            result.id = new Date().getTime();
          }
          ws.send(JSON.stringify(result));
        });
      });
    });

    server.provider = provider;

    var oldClose = server.close;

    server.close = function(callback) {
      var args = Array.prototype.slice.call(arguments);
      server.provider.close(function(err) {
        if (err) return callback(err);
        oldClose.apply(server, args);
      });
    };

    return server;
  }
};
