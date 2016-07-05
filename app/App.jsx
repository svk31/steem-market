var React = require("react");
var ReactDOM = require("react-dom");
var socketIO = require('socket.io-client')
import {Order} from "./marketUtils";
import DepthChart from "./DepthChart.jsx";
import config from "../config";
import moment from "moment";

require("./app.scss");

class App extends React.Component {

    constructor() {
        super();

        this.state = {
            apiReady: false,
            asks: [],
            bids: [],
            history: [],
            ticker: {}
        };
    }

    componentDidMount() {
        var socket = socketIO.connect(config.host);

        socket.on("connect", (res) => {
            console.log("connected");
        });

        socket.on('ticker', (data) => {
            this.setState({ticker: data});
        })

        socket.on('orderbook', (data) => {
            let bids = data.bids.map(bid => {
                return new Order(bid, "bid");
            });
            let asks = data.asks.map(ask => {
                return new Order(ask, "ask");
            });
            this.setState({
                bids, asks
            });
        });

        socket.on('tradehistory', (data) => {
            this.setState({history: data.sort((a, b) => {
                return (b.date === a.date ? (a.sbd - b.sbd) : (new Date(b.date) - new Date(a.date)));
            })});
        });
    }

    renderOrdersRows(orders, buy) {
        if (!orders.length) {
            return null;
        }
        var total = 0;
        return orders.map((order, index) => {
            if (index < 15) {
                total += order.getSBDAmount();
                let sbd = order.getSBDAmount().toFixed(3);
                let steem = order.getSteemAmount().toFixed(3);
                let price = order.getPrice().toFixed(5);
            return (
                <tr key={index + "_" + order.getPrice()}>
                    <td style={{textAlign: "right"}}>{buy ? total.toFixed(2) : price}</td>
                    <td style={{textAlign: "right"}}>{buy ? sbd : steem}</td>
                    <td style={{textAlign: "right"}}>{buy ? steem : sbd}</td>
                    <td style={{textAlign: "right"}}>{buy ? price : total.toFixed(2)}</td>
                </tr>
            );
            }
        }).filter(a => {
            return !!a;
        });
    }

    renderHistoryRows(history, buy) {
        if (!history.length) {
            return null;
        }

        return history.map((order, index) => {
            if (index < 15) {
                let sbd = order.sbd / 1000;
                let steem = order.steem / 1000;
                return (
                    <tr key={index + "_" + order.date}>
                        <td style={{textAlign: "right"}}>{(sbd).toFixed(2)}</td>
                        <td style={{textAlign: "right"}}>{(steem).toFixed(2)}</td>
                        <td style={{textAlign: "right"}}>{(sbd / steem).toFixed(5)}</td>
                        <td style={{textAlign: "right", fontSize: "90%"}}>{moment.utc(order.date).local().format('MM/DD/YYYY hh:mm:ss')}</td>
                    </tr>
                );
            }
        }).filter(a => {
            return !!a;
        });
    }

    renderBuySellHeader(buy) {
        return (
            <thead>
                <tr>
                    <th style={{textAlign: "right"}}>{buy ? "Total SD ($)" : "Price"}</th>
                    <th style={{textAlign: "right"}}>{buy ? "SD ($)" : "Steem"}</th>
                    <th style={{textAlign: "right"}}>{buy ? "Steem" : "SD ($)"}</th>
                    <th style={{textAlign: "right"}}>{buy ? "Price" : "Total SD ($)"}</th>
                </tr>
            </thead>
        );
    }

    render() {
        let {asks, bids, history, ticker} = this.state;

        let bidRows = this.renderOrdersRows(bids, true);
        let askRows = this.renderOrdersRows(asks, false);

        let bidHeader = this.renderBuySellHeader(true);
        let askHeader = this.renderBuySellHeader(false);

        let latest = history.length ? ((history[0].sbd / history[0].steem)).toFixed(5) :
            parseFloat(ticker.latest) !== 0 ? parseFloat(ticker.latest).toFixed(5) : "0.00000";

        let first = history.length ? ((history[history.length - 1].sbd / history[history.length - 1].steem)) :
            parseFloat(ticker.latest) !== 0 ? parseFloat(ticker.latest) : 0;

        let changePercent = (100 * (parseFloat(latest) - first)) / first;

        return (
            <div className="container">

                <div className="col-xs-12">
                    {Object.keys(ticker).length ?
                    <ul className="market-ticker">
                        <li><b>Last price</b>${latest}/STEEM (<span className={changePercent === 0 ? "" : changePercent < 0 ? "negative" : "positive"}>{changePercent.toFixed(3)}%</span>)</li>
                        <li><b>24h volume</b>${(ticker.sbd_volume / 1000).toFixed(4)}</li>
                        <li><b>Bid</b>${parseFloat(ticker.highest_bid).toFixed(5)}</li>
                        <li><b>Ask</b>${parseFloat(ticker.lowest_ask).toFixed(5)}</li>
                        <li><b>Spread</b>{(100 * (parseFloat(ticker.lowest_ask) - parseFloat(ticker.highest_bid)) / parseFloat(ticker.highest_bid)).toFixed(2)}%</li>

                    </ul> : null}
                </div>

                <div className="col-xs-12">
                    <DepthChart data={{asks, bids}} />
                </div>

                <div className="col-xs-6 col-lg-4">
                    <table className="table table-condensed table-striped">
                        <caption className="buy">Buy Steem</caption>
                        {bidHeader}
                        <tbody>
                                {bidRows}
                        </tbody>
                    </table>
                </div>
                <div className="col-xs-6 col-lg-4">
                    <table className="table table-condensed table-striped">
                        <caption className="sell">Sell Steem</caption>
                        {askHeader}
                        <tbody>
                                {askRows}
                        </tbody>
                    </table>
                </div>
                <div className="col-xs-12 col-lg-4">

                    <table className="table table-condensed table-striped">
                        <caption>Order history</caption>
                        <thead>
                            <tr>
                                <th style={{textAlign: "right"}}>SD ($)</th>
                                <th style={{textAlign: "right"}}>Steem</th>
                                <th style={{textAlign: "right"}}>Price</th>
                                <th style={{textAlign: "right"}}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                                {this.renderHistoryRows(history)}
                        </tbody>
                    </table>
                </div>
            </div>

        );
    }
}


ReactDOM.render(<App />, document.getElementById("content"));
