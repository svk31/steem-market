var steemWS = require("steem-rpc");
var deepEqual = require("deep-equal");
var config = require("./config");

var express = require('express');
var app = express();
app.use(express.static('dist'));
var server = app.listen(config.port);

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
        socket.emit('ticker', ticker);

        socket.on("disconnect", function() {
            console.log("user dcd");
            connectCounter--;
        });

    });
}

const options = {
    // user: "username",
    // pass: "password",
    config.wsApi,
    config.apis
};

var Api = steemWS(options);
var currentBlock;
var orderBook = {bids: [], asks: []};
var tradeHistory = [];
var ticker = {};

Api.get().initPromise.then((res) => {
    console.log("Connected:", res);
    updateState();
    startServer();
});

function updateState() {
    let startDateShort = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    startDateShort = new Date(startDateShort.getTime() - 120 * 50 * 1000);

    Promise.all([
            Api.get().database_api().exec("get_dynamic_global_properties", []),
            Api.get().database_api().exec("get_order_book", [1000]),
            Api.get().market_history_api().exec("get_trade_history", [
               startDateShort.toISOString().slice(0, -5),
               endDate.toISOString().slice(0, -5),
               100
           ]),
           Api.get().market_history_api().exec("get_ticker", [])
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


        if (!deepEqual(response[3], ticker)) {
            console.log("Ticker or volume changed at block #", currentBlock);
            if (io && "sockets" in io) {
                io.sockets.emit("ticker", response[3]);
            }

            ticker = response[3];
        }

        setTimeout(updateState, config.pollFrequency);
    })
}
