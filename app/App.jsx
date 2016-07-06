var React = require("react");
var ReactDOM = require("react-dom");
var socketIO = require('socket.io-client')
import {Order, MarketHistory, TradeHistory} from "./marketUtils";
import DepthChart from "./DepthChart.jsx";
import PriceChart from "./PriceChart.jsx";
import config from "../config";
import moment from "moment";
import Highcharts from "highcharts/highstock";

require("./app.scss");

Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

class App extends React.Component {

    constructor() {
        super();

        this.state = {
            apiReady: false,
            asks: [],
            bids: [],
            history: [],
            ticker: {},
            priceHistory: [],
            priceTop: true,
            historyIndex: 0,
            buyIndex: 0,
            sellIndex: 0
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

        socket.on('markethistory', (data) => {
            this.setState({priceHistory: data.map(bucket => {
                return new MarketHistory(bucket);
            })});
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

            let history =  data.map(fill => {
                return new TradeHistory(fill);
            })

            this.setState({history: history.sort((a, b) => {
                return (b.date === a.date ? (a.getSBDAmount() - b.getSBDAmount()) : (b.date - a.date));
            })});
        });
    }

    renderOrdersRows(orders, buy) {
        if (!orders.length) {
            return null;
        }
        let {buyIndex, sellIndex} = this.state;

        var total = 0;
        return orders.map((order, index) => {
            if (index >= (buy ? buyIndex : sellIndex) && index < ((buy ? buyIndex : sellIndex) + 10)) {
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

        let {historyIndex} = this.state;

        return history.map((order, index) => {
            if (index >= historyIndex && index < (historyIndex + 10)) {

                return (
                    <tr key={index + "_" + order.date} className={order.type === "buy" ? "buy" : "sell"}>
                        <td style={{textAlign: "right"}}>{moment.utc(order.date).local().format('MM/DD/YYYY HH:mm:ss')}</td>
                        <td style={{textAlign: "right"}}>{order.getPrice().toFixed(5)}</td>
                        <td style={{textAlign: "right"}}>{order.getSteemAmount().toFixed(2)}</td>
                        <td style={{textAlign: "right"}}>{order.getSBDAmount().toFixed(2)}</td>
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

    _toggleChartPosition() {
        this.setState({
            priceTop: !this.state.priceTop
        });
    }

    _toggleSideBySideCharts() {
        this.setState({
            sideBySide: !this.state.sideBySide
        });
    }

    _setHistoryPage(back) {
        let newIndex = this.state.historyIndex + (back ? 10 : -10);
        newIndex = Math.min(Math.max(0, newIndex), this.state.history.length - 10);
        this.setState({
            historyIndex: newIndex
        });
    }

    _setBuySellPage(back, type) {
        let indexKey = type === "buy" ? "buyIndex" : "sellIndex";
        let arrayKey = type === "buy" ? "bids" : "asks";
        let newIndex = this.state[indexKey] + (back ? 10 : -10);

        newIndex = Math.min(Math.max(0, newIndex), this.state[arrayKey].length - 10);
        let newState = {};
        newState[indexKey] = newIndex;
        this.setState(newState);
    }

    render() {
        let {asks, bids, history, ticker, priceHistory, priceTop,
            historyIndex, buyIndex, sellIndex} = this.state;

        let bidRows = this.renderOrdersRows(bids, true);
        let askRows = this.renderOrdersRows(asks, false);

        let bidHeader = this.renderBuySellHeader(true);
        let askHeader = this.renderBuySellHeader(false);

        let latest = parseFloat(ticker.latest).toFixed(5);

        let changePercent = parseFloat(ticker.percent_change);

        let priceChart = priceHistory.length ? <PriceChart priceHistory={priceHistory} /> : null;

        return (
            <div className="container">

                <div className="col-xs-12">
                    <div className="btn btn-default pull-left" onClick={this._toggleChartPosition.bind(this)}>Switch charts</div>
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

                    {priceTop ? priceChart :
                        <DepthChart data={{asks, bids}} />
                    }
                </div>

                <div className="col-xs-6 col-lg-4">
                    <table className="table table-condensed table-striped buy">
                        <caption>Buy Steem</caption>
                        {bidHeader}
                        <tbody>
                                {bidRows}
                        </tbody>
                    </table>
                    <nav>
                      <ul className="pager" style={{marginTop: 0, marginBottom: 0}}>
                        <li className={"previous" + (buyIndex === 0 ? " disabled" : "")}>
                            <a onClick={this._setBuySellPage.bind(this, false, "buy")} aria-label="Previous">
                                <span aria-hidden="true">&larr; Higher</span>
                            </a>
                        </li>
                        <li className={"next" + (buyIndex >= (bids.length - 10) ? " disabled" : "")}>
                            <a onClick={this._setBuySellPage.bind(this, true, "buy")} aria-label="Previous">
                                <span aria-hidden="true">Lower &rarr;</span>
                            </a>
                        </li>
                      </ul>
                    </nav>
                </div>

                <div className="col-xs-6 col-lg-4">
                    <table className="table table-condensed table-striped sell">
                        <caption>Sell Steem</caption>
                        {askHeader}
                        <tbody>
                                {askRows}
                        </tbody>
                    </table>
                    <nav>
                      <ul className="pager" style={{marginTop: 0, marginBottom: 0}}>
                        <li className={"previous" + (sellIndex === 0 ? " disabled" : "")}>
                            <a onClick={this._setBuySellPage.bind(this, false, "sell")} aria-label="Previous">
                                <span aria-hidden="true">&larr; Lower</span>
                            </a>
                        </li>
                        <li className={"next" + (sellIndex >= (asks.length - 10) ? " disabled" : "")}>
                            <a onClick={this._setBuySellPage.bind(this, true, "sell")} aria-label="Previous">
                                <span aria-hidden="true">Higher &rarr;</span>
                            </a>
                        </li>
                      </ul>
                    </nav>
                </div>
                <div className="col-xs-12 col-lg-4">

                    <table className="table table-condensed trade-history">
                        <caption>Order history</caption>
                        <thead>
                            <tr>
                                <th style={{textAlign: "center"}}>Date</th>
                                <th style={{textAlign: "right"}}>Price</th>
                                <th style={{textAlign: "right"}}>Steem</th>
                                <th style={{textAlign: "right"}}>SD ($)</th>
                            </tr>
                        </thead>
                        <tbody>
                                {this.renderHistoryRows(history)}
                        </tbody>
                    </table>

                    <nav>
                      <ul className="pager" style={{marginTop: 0, marginBottom: 0}}>
                        <li className={"previous" + (historyIndex === 0 ? " disabled" : "")}>
                            <a onClick={this._setHistoryPage.bind(this, false)} aria-label="Previous">
                                <span aria-hidden="true">&larr; Newer</span>
                            </a>
                        </li>
                        <li className={"next" + (historyIndex >= (history.length - 10) ? " disabled" : "")}>
                            <a onClick={this._setHistoryPage.bind(this, true)} aria-label="Previous">
                                <span aria-hidden="true">Older &rarr;</span>
                            </a>
                        </li>
                      </ul>
                    </nav>
                </div>

                <div className="col-xs-12" style={{paddingTop: 20, paddingBottom: 20}}>
                    {!priceTop ? priceChart :
                        <DepthChart data={{asks, bids}} />
                    }
                </div>
            </div>

        );
    }
}


ReactDOM.render(<App />, document.getElementById("content"));
