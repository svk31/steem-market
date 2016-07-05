import React from "react";
var ReactHighstock = require("react-highcharts/dist/ReactHighstock");

export default class DepthChart extends React.Component {

    shouldComponentUpdate(nextProps, nextState) {
        if (this.refs.depthChart) {
            let {flatAsks, flatBids} = this.flattenOrders(nextProps)

            this.refs.depthChart.chart.series[0].setData(flatBids);
            this.refs.depthChart.chart.series[1].setData(flatAsks);
            return false;
        }
        return true;
    }

    flattenOrders(props) {
        let {data} = props;
        let power = 1;
        if (!data.bids && !data.asks) {
            return {
                flatAsks: [],
                flatBids: [],
                power
            };
        }

        let flatAsks = data.asks.reduce((previous, current) => {
            let value = previous.length ? previous[previous.length - 1][1] : 0;
            previous.push([current.getPrice(), current.getSBDAmount() + value])
            return previous;
        }, []);

        let flatBids = data.bids.reduce((previous, current) => {
            let value = previous.length ? previous[previous.length - 1][1] : 0;
            previous.push([current.getPrice(), current.getSBDAmount() + value])
            return previous;
        }, []).sort((a,b) => {
            return a[0] - b[0];
        });



        if (flatBids.length) {
            while ((flatBids[flatBids.length - 1][0] * power) < 1) {
                power *= 10;
            }
        } else if (flatAsks.length) {
            while ((flatAsks[0][0] * power) < 1) {
                power *= 10;
            }
        }

        power *= 10;

        if (power !== 1) {
            if (flatBids.length) {
                flatBids.forEach(bid => {
                    bid[0] *= power;
                })
            }

            if (flatAsks.length) {
                flatAsks.forEach(ask => {
                    ask[0] *= power;
                })
            }
        }

        return {
            flatAsks, flatBids, power
        };
    }

    render() {

        let {data} = this.props;
        if (!data.bids && !data.asks) {
            return null;
        }
        
        let {flatAsks, flatBids, power} = this.flattenOrders(this.props);

        let config = {
            chart: {
                type: "area",
                backgroundColor: "rgba(255, 0, 0, 0)",
                spacing: [10, 0, 5, 0],
                height: 300
            },
            title: {
                text: null
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            dataGrouping: {
                enabled: false
            },
            tooltip: {
                shared: false,
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                formatter: function() {
                    let name = this.series.name.split(" ")[0];
                    return `<span style="font-size: 90%;">Price: ${(this.x / power).toFixed(4)} $/STEEM</span><br/><span style="color:${this.series.color}">\u25CF</span>${name}: <b>${this.y.toFixed(4)} SD ($)</b>`;
                },
                style: {
                    color: "#FFFFFF"
                }
            },
            series: [],
            yAxis: {
                labels: {
                    align: "left"
                },
                title: {
                    text: null,
                    style: {
                        color: "#FFFFFF"
                    }
                },
                gridLineWidth: 1,
                crosshair: {
                    snap: false
                },
                currentPriceIndicator: {
                    enabled: false
                }
            },
            xAxis: {
                labels: {
                    formatter: function () {return this.value / power; }
                },
                ordinal: false,
                lineColor: "#000000",
                title: {
                    text: null
                },
                plotLines: []
            },
            plotOptions: {
                area: {
                    animation: false,
                    marker: {
                        enabled: false
                    },
                    series: {
                        enableMouseTracking: false
                    }
                }
            }
        };

        if (flatBids.length) {
            config.series.push({
                step: "right",
                name: `Bid`,
                data: flatBids,
                fillColor: "#c2dfc9",
                color: "#339349"
            });
        }

        if (flatAsks.length) {
            config.series.push({
                step: "left",
                name: `Ask`,
                data: flatAsks,
                fillColor: "#e4bdb9",
                color: "#a42015"
            });
        }

        if (flatBids.length > 0 && flatAsks.length > 0) {
            let middleValue = (parseFloat(flatAsks[0][0]) + parseFloat(flatBids[flatBids.length - 1][0])) / 2;

            config.xAxis.min = middleValue * 0.1 // middleValue * (this.props.noFrame ? 0.8 : 0.50);
            config.xAxis.max = middleValue * 1.7;
            // console.log("middleValue:", middleValue, "flatAsks", flatAsks, "flatBids", flatBids);
        };

        return (
            <div>{flatBids.length || flatAsks.length ? <ReactHighstock ref="depthChart" config={config}/> : null}</div>
        );
    }
}
