var React = require("react");
var ReactDOM = require("react-dom");
var socketIO = require('socket.io-client')
import {Order} from "./marketUtils";
import DepthChart from "./DepthChart.jsx";
import config from "../config";


class App extends React.Component {

    constructor() {
        super();

        this.state = {
            apiReady: false,
            asks: [],
            bids: []
        };
    }

    componentDidMount() {
        var socket = socketIO.connect(config.host);

        socket.on("connect", (res) => {
            console.log("connected", res);
        });

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
            console.log("tradehistory:", data);
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

    render() {
        let {asks, bids} = this.state;

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

        return (
            <div className="container">
                <div className="col-xs-12">
                    <DepthChart data={{asks, bids}} />

                </div>

                <div className="col-xs-6">
                <table className="table table-condensed table-striped">
                    {headers}
                    <tbody>
                            {bidRows}
                    </tbody>
                </table>
                </div>
                <div className="col-xs-6">
                    <table className="table table-condensed table-striped">
                        {headers}
                        <tbody>
                                {askRows}
                        </tbody>
                    </table>
                </div>
            </div>

        );
    }
}


ReactDOM.render(<App />, document.getElementById("content"));
