var React = require("react");

class OrderRow extends React.Component {

    constructor(props) {
        super();

        this.state = {
            animate: props.animate && props.index !== 9
        };

        this.timeout = null;
    }

    _clearAnimate() {
        setTimeout(() => {
            this.setState({
                animate: false
            });
        }, 1000);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.buy) {
            if (!this.props.order.equals(nextProps.order)) {
                this.setState({
                    animate: true
                }, this._clearAnimate);
            }
            // if (this.props.index === 0) {
            //     console.log("*******\n", nextProps.order.getSBDAmount(), this.props.order.getSBDAmount());
            //     console.log(nextProps.order.getSteemAmount(), this.props.order.getSteemAmount());
            //     console.log(nextProps.order.getPrice(), this.props.order.getPrice());
            // }

            if (nextProps.order.getSBDAmount() !== this.props.order.getSBDAmount()) {
                console.log("Row #", this.props.index, "SBD amount changed from", this.props.order.getSBDAmount(), "to", nextProps.order.getSBDAmount());
                this.setState({animate: true}, this.clearAnimate);
            }
        }
    }

    componentDidMount() {
        if (this.state.animate) {
            setTimeout(() => {
                this.setState({animate: false});
            }, 500);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !this.props.order.equals(nextProps.order) ||
            this.props.total !== nextProps.total ||
            this.state.animate !== nextState.animate
        );
    }

    render() {
        let {order, buy, total} = this.props;

        let sbd = order.getSBDAmount().toFixed(3);
        let steem = order.getSteemAmount().toFixed(3);
        let price = order.getStringPrice();

        return (
            <tr className={this.state.animate ? "Animate" : ""}>
                <td style={{textAlign: "right"}}>{buy ? total.toFixed(2) : price}</td>
                <td style={{textAlign: "right"}}>{buy ? sbd : steem}</td>
                <td style={{textAlign: "right"}}>{buy ? steem : sbd}</td>
                <td style={{textAlign: "right"}}>{buy ? price : total.toFixed(2)}</td>
            </tr>
        )
    }

}

export default class Orderbook extends React.Component {

    constructor() {
        super();

        this.state = {
            buyIndex: 0,
            sellIndex: 0,
            animate: false
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
            animate: true
            });
        }, 2000);
    }

    _setBuySellPage(back) {

        let type = this.props.buy ? "buy"  : "sell";
        let indexKey = type === "buy" ? "buyIndex" : "sellIndex";

        let newIndex = this.state[indexKey] + (back ? 10 : -10);

        newIndex = Math.min(Math.max(0, newIndex), this.props.orders.length - 10);

        let newState = {};
        newState[indexKey] = newIndex;
        // Disable animations while paging
        if (newIndex !== this.state[indexKey]) {
            newState.animate = false;
        }
        // Reenable animatons after paging complete
        this.setState(newState, () => {
            this.setState({animate: true})
        });
    }

    renderBuySellHeader() {
        let {buy} = this.props;

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

    renderOrdersRows() {
        let {buy, orders} = this.props;

        if (!orders.length) {
            return null;
        }
        let {buyIndex, sellIndex} = this.state;

        var total = 0;
        return orders
        .map((order, index, array) => {

            if (index >= (buy ? buyIndex : sellIndex) && index < ((buy ? buyIndex : sellIndex) + 10)) {
                total += order.getSBDAmount();

                return (
                    <OrderRow animate={this.state.animate} key={order.getPrice()} index={index} order={order} total={total} buy={buy} />
                );
            }
        }).filter(a => {
            return !!a;
        });
    }

    render() {
        let {buy, orders} = this.props;
        let {buyIndex, sellIndex} = this.state;

        let currentIndex = buy ? buyIndex : sellIndex;

        return (
            <div>
                <table className={"table table-condensed table-striped orderbook " + (buy ? "buy" : "sell")}>
                    <caption>{buy ? "Buy" : "Sell"} Steem</caption>
                    {this.renderBuySellHeader()}
                    <tbody>
                            {this.renderOrdersRows()}
                    </tbody>
                </table>
                <nav>
                  <ul className="pager" style={{marginTop: 0, marginBottom: 0}}>
                    <li className={"previous" + (currentIndex === 0 ? " disabled" : "")}>
                        <a onClick={this._setBuySellPage.bind(this, false)} aria-label="Previous">
                            <span aria-hidden="true">&larr; {buy ? "Higher" : "Lower"}</span>
                        </a>
                    </li>
                    <li className={"next" + (currentIndex >= (orders.length - 10) ? " disabled" : "")}>
                        <a onClick={this._setBuySellPage.bind(this, true)} aria-label="Next">
                            <span aria-hidden="true">{buy ? "Lower" : "Higher"} &rarr;</span>
                        </a>
                    </li>
                  </ul>
                </nav>
            </div>

        )
    }
}
