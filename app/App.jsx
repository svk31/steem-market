var React = require("react");
var ReactDOM = require("react-dom");
var socketIO = require('socket.io-client')
import {Order} from "./marketUtils";
import DepthChart from "./DepthChart.jsx";
import config from "../config";

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
            console.log("connected", res);
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
            this.setState({history: data});
        });
    }

    renderOrdersRows(orders) {
        if (!orders.length) {
            return null;
        }
        return orders.map((order, index) => {
            if (index < 10) {
            return (
                <tr key={index + "_" + order.getPrice()}>
                    <td style={{textAlign: "right"}}>{order.getSBDAmount().toFixed(4)}</td>
                    <td style={{textAlign: "right"}}>{order.getSteemAmount().toFixed(4)}</td>
                    <td style={{textAlign: "right"}}>{order.getPrice().toFixed(5)}</td>
                </tr>
            );
            }
        }).filter(a => {
            return !!a;
        })
    }

    renderHistoryRows(history) {
        if (!history.length) {
            return null;
        }

        return history.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        }).map((order, index) => {
            return (
                <tr key={index + "_" + order.date}>
                    <td style={{textAlign: "right"}}>{(order.sbd / 1000).toFixed(4)}</td>
                    <td style={{textAlign: "right"}}>{(order.steem / 1000).toFixed(4)}</td>
                    <td style={{textAlign: "right"}}>{order.date}</td>
                </tr>
            );
        })
    }

    render() {
        let {asks, bids, history, ticker} = this.state;

        let bidRows = this.renderOrdersRows(bids);
        let askRows = this.renderOrdersRows(asks);

        let headers = (
            <thead>
                <tr>
                    <th style={{textAlign: "right"}}>SD ($)</th>
                    <th style={{textAlign: "right"}}>Steem</th>
                    <th style={{textAlign: "right"}}>Price</th>
                </tr>
            </thead>
        );

        let hi

        return (
            <div className="container">

                <div className="col-xs-12">
                    {Object.keys(ticker).length ?
                    <ul className="market-ticker">
                        <li><b>Last price</b>${parseFloat(ticker.latest).toFixed(5)}/STEEM (+{parseFloat(ticker.percent_change).toFixed(2)}%)</li>
                        <li><b>24h volume</b>${(ticker.sbd_volume / 1000).toFixed(4)}</li>
                        <li><b>Bid</b>${parseFloat(ticker.highest_bid).toFixed(5)}</li>
                        <li><b>Ask</b>${parseFloat(ticker.lowest_ask).toFixed(5)}</li>

                    </ul> : null}
                </div>

                <div className="col-xs-12">
                    <DepthChart data={{asks, bids}} />
                </div>

                <div className="col-xs-6 col-lg-4">
                <table className="table table-condensed table-striped">
                    {headers}
                    <tbody>
                            {bidRows}
                    </tbody>
                </table>
                </div>
                <div className="col-xs-6 col-lg-4">
                    <table className="table table-condensed table-striped">
                        {headers}
                        <tbody>
                                {askRows}
                        </tbody>
                    </table>
                </div>
                <div className="col-xs-12 col-lg-4">

                    <table className="table table-condensed table-striped">
                        <thead>
                            <tr>
                                <th style={{textAlign: "right"}}>SD ($)</th>
                                <th style={{textAlign: "right"}}>Steem</th>
                                <th style={{textAlign: "right"}}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                                {this.renderHistoryRows(this.state.history)}
                        </tbody>
                    </table>
                </div>
            </div>

        );
    }
}


ReactDOM.render(<App />, document.getElementById("content"));
