var steemWS = require("steem-rpc");
var deepEqual = require("deep-equal");

var express = require('express');
var app = express();
app.use(express.static('dist'));
var server = app.listen(3000);

var io = require('socket.io')(server);
var connectCounter = 0;

function startServer() {
    app.get('/', function (req, res) {
      res.sendFile(__dirname + '/dist/index.html');
    });

    io.on('connection', function (socket) {
        connectCounter++;
        console.log('user connected, total users:', connectCounter);
        socket.emit('orderbook', orderBook);
        socket.emit('tradehistory', tradeHistory);

        socket.on("disconnect", function() {
            console.log("user dcd");
            connectCounter--;
        });

    });
}

const options = {
    // user: "username",
    // pass: "password",
    url: "ws://127.0.0.1:8090",
    apis: ["database_api", "market_history_api"]
};

var Api = steemWS(options);
var currentBlock;
var orderBook;
var tradeHistory;

Api.get().initPromise.then((res) => {
    console.log("Connected:", res);
    updateState();
    startServer();
});

function updateState() {
    let startDateShort = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    startDateShort = new Date(startDateShort.getTime() - 3600 * 50 * 1000);

    Promise.all([
            Api.get().database_api().exec("get_dynamic_global_properties", []),
            Api.get().database_api().exec("get_order_book", [1000]),
            Api.get().market_history_api().exec("get_trade_history", [
               startDateShort.toISOString().slice(0, -5),
               endDate.toISOString().slice(0, -5),
               100
           ])
    ])
    .then(function(response) {
        currentBlock = response[0].head_block_number;
        if (!deepEqual(response[1], orderBook)) {
            console.log("Orderbook changed at block #", currentBlock);
            if (io && "sockets" in io) {
                io.sockets.emit("orderbook", response[1]);
            }

            orderBook = response[1];
        }

        if (!deepEqual(response[2], tradeHistory)) {
            console.log("Orderbook changed at block #", currentBlock);
            if (io && "sockets" in io) {
                io.sockets.emit("tradehistory", response[2]);
            }

            tradeHistory = response[2];
        }

        setTimeout(updateState, 1500);
    })
}
