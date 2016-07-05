var steemWS = require("steem-rpc");
var deepEqual = require("deep-equal");
var config = require("../config");

var express = require('express');
var app = express();
app.use(express.static('dist'));
var server = app.listen(config.port);
var ApiCalls = require("./apiCalls");
var io = require('socket.io')(server);
var connectCounter = 0;

console.log("*** Server listening at port:", config.port, "***");

function startServer() {
    app.get('/', function (req, res) {
      res.sendFile(__dirname + '/dist/index.html');
    });

    io.on('connection', function (socket) {
        connectCounter++;
        console.log('user connected, total users:', connectCounter);

        // Broadcast data to newly connected user
        for (let event in marketCache) {
            socket.emit(event, marketCache[event]);
        }

        // Decrement user count on disconnect
        socket.on("disconnect", function() {
            connectCounter--;
        });

    });
}

const options = {
    // user: "username",
    // pass: "password",
    url: config.wsApi,
    apis: config.apis
};

var Api = steemWS(options);
var apiCalls = ApiCalls(Api);
var currentBlock;

var marketCache = {
    orderbook: {bids: [], asks: []},
    tradehistory: [],
    ticker: {},
    markethistory: []
}

Api.get().initPromise.then((res) => {
    console.log("Api ready, connected to:", res, "\n");
    updateState();
    startServer();
});

function updateState() {
    Promise.all([
            apiCalls.getDynamicGlobal(),
            apiCalls.getOrderBook(),
            apiCalls.getTradeHistory(),
            apiCalls.getTicker(),
            apiCalls.getMarketHistory()
    ])
    .then(function(response) {
        currentBlock = response[0].head_block_number;

        checkChangeAndEmit("orderbook", response[1]);
        checkChangeAndEmit("tradehistory", response[2]);
        checkChangeAndEmit("ticker", response[3]);
        checkChangeAndEmit("markethistory", response[4]);

        setTimeout(updateState, config.pollFrequency);
    }).catch(err => {
        console.log("Api error:", err);
    })
}

function checkChangeAndEmit(event, incoming) {
    if (!deepEqual(incoming, marketCache[event])) {
        console.log(event, "changed at block #", currentBlock);
        if (io && "sockets" in io) {
            io.sockets.emit(event, incoming);
        }

        marketCache[event] = incoming;
    }
}
