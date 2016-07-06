import React from "react";
var ReactHighstock = require("react-highcharts/dist/ReactHighstock");
import Highcharts from "highcharts/highstock";

require("./highstock-current-price-indicator.js");

let colors = {
    bidColor: "#258A14",
    bidFillColor: "rgba(80, 210, 194, 0.5)",
    askColor: "#EA340B",
    askFillColor: "rgba(227, 116, 91, 0.5)",
    callColor: "#BBBF2B",
    settleColor: "rgba(125, 134, 214, 1)",
    settleFillColor: "rgba(125, 134, 214, 0.5)",
    positiveColor: "rgba(110, 193, 5, 1)",
    negativeColor: "rgba(225, 66, 74, 1)",
    primaryText: "#3F2E55",
    lightTextColor: "#3F2E55",
    volumeColor: "#848484",

    //tooltip
    tooltipBackgroundColor: "rgba(255,255,255, 0.9)",
    tooltipColor: "#000",
    tooltipFillColor: "#000",
    //axis
    axisLabelsColor: "#000",
    axisLineColor: "#000"
};

class PriceChart extends React.Component {

    constructor(props) {
        super();

        let data = this.constructData(props.priceHistory);

        this.state = data;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.refs.priceChart) {
            let {priceData, volumeData} = this.constructData(nextProps.priceHistory);

            this.refs.priceChart.chart.series[0].setData(volumeData);
            this.refs.priceChart.chart.series[1].setData(priceData);
            return false;
        }
        return true;
    }

    constructData(priceHistory) {
        let priceData = [], volumeData = [];
        if (!priceHistory.length) {
            return {
                    priceData,
                    volumeData
            }
        }

        priceHistory.map(entry => {
            priceData.push(entry.getPriceData());
            volumeData.push(entry.getVolumeData());
        });

        return {
            priceData,
            volumeData
        };
    }

    render() {
        let {priceData, volumeData} = this.state;

        let positiveColor = "#339349";
        let negativeColor = "#a42015";

        // Find max volume
        // let maxVolume = 0;
        let volumeColors = [], colorByPoint = false;

        // if (volumeData.length === priceData.length) {
        //     colorByPoint = true;
        // }
        // for (var i = 0; i < volumeData.length; i++) {
        //     maxVolume = Math.max(maxVolume, volumeData[i][1]);
            // if (colorByPoint) {
            //     volumeColors.push(priceData[i][1] <= priceData[i][4] ? positiveColor : negativeColor);
            // }
        // }

        // Find highest price
        // let maxPrice = 0;
        // if (priceData.length) {
        //     for (var i = 0; i < priceData.length; i++) {
        //         maxPrice = Math.max(maxPrice, priceData[i][2]);
        //     }
        // }

        let minDate = new Date();
        minDate.setDate(minDate.getDate() - 1);

        let config = {
            chart: {
                backgroundColor: "rgba(255, 0, 0, 0)",
                dataGrouping: {
                    enabled: false
                },
                pinchType: "x",
                spacing: [20, 10, 5, 10],
                alignTicks: false
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
            scrollbar: {
                enabled: false
            },
            navigator: {
                enabled: true,
                height: 30,
                margin: 10
            },
            rangeSelector: {
                enabled: false
            },
            plotOptions: {
                candlestick: {
                    oxymoronic: false,
                    animation: false,
                    color: negativeColor,
                    lineColor: negativeColor,
                    upColor: positiveColor,
                    upLineColor: positiveColor,
                    lineWidth: 2
                },
                column: {
                    animation: false,
                    borderColor: "#000000"
                },
                series: {
                    marker: {
                        enabled: false
                    },
                    enableMouseTracking: true
                }
            },
            tooltip: {
                enabledIndicators: true,
                shared: true,
                borderWidth: 0,
                shadow: false,
                useHTML: true,
                padding: 0,
                formatter: function () {
                    let precision = 5;

                    let time =  Highcharts.dateFormat("%Y-%m-%d %H:%M", this.x);

                    if (!this.points || this.points.length === 0) {
                        return "";
                    }

                    return ("<span style='color: " + colors.tooltipColor +";fill: "+ colors.tooltipFillColor + "'>" +
                             "<b>Open:&nbsp;&nbsp;&nbsp;</b>" + Highcharts.numberFormat(this.points[1].point.open, precision, ".", ",") +
                             "<b>&nbsp;&nbsp;High:&nbsp;&nbsp;&nbsp;</b>" + Highcharts.numberFormat(this.points[1].point.high, precision, ".", ",") +
                             "<b>&nbsp;&nbsp;Time:&nbsp;&nbsp;&nbsp;</b>" + time +
                             "<br/><b>Close:&nbsp;&nbsp;&nbsp;</b>" + Highcharts.numberFormat(this.points[1].point.close, precision, ".", ",") +
                             "<b>&nbsp;&nbsp;Low:&nbsp;&nbsp;&nbsp;&nbsp;</b>" + Highcharts.numberFormat(this.points[1].point.low, precision, ".", ",") +
                             "<b>&nbsp;&nbsp;Vol:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>" + Highcharts.numberFormat(this.points[1] ? this.points[0].point.y : 0, precision, ".", ",") + "&nbsp;&nbsp;" + "SD" + "<br/>"
                             + "</span>");

                },
                positioner: function () {
                    return { x: 50, y: -5 };
                }
            },
            series: [
                {
                    type: "column",
                    name: "Volume",
                    data: volumeData,
                    color: "rgb(132, 132, 132)",
                    yAxis: 1
                },
                {
                    id: "primary",
                    type: "candlestick",
                    name: "Price",
                    data: priceData
                }
            ],
            yAxis: [{
                labels: {
                    align: "left",
                    x: 10,
                    format: "{value:,." + (4) + "f}"
                },
                opposite: true,
                title: {
                    text: null,
                },
                offset: 5,
                lineWidth: 1,
                lineColor: "rgba(183, 183, 183, 0.29)",
                gridLineWidth: 1,
                plotLines: [],
                crosshair: {
                    snap: false
                },
                startOnTick: false,
                endOnTick: true,
                showLastLabel: true,
                maxPadding: 0,
                currentPriceIndicator: {
                    precision: 5,
                    backgroundColor: "#C38B8B",
                    borderColor: "#000000",
                    lineColor: "#C38B8B",
                    lineDashStyle: "Solid",
                    lineOpacity: 0.8,
                    enabled: priceData.length > 0,
                    style: {
                        color: "#ffffff",
                        fontSize: "10px"
                    },
                    x: -15,
                    y: 0,
                    zIndex: 99,
                    width: 65
                },
                height: "90%"
            },
                {
                    labels: {
                        align: "left",
                        x: 10,
                        formatter: function() {
                            if (this.value !== 0) {
                                if ( this.value > 1000000 ) {
                                    return Highcharts.numberFormat( this.value / 1000, 2) + "M";
                                } else if ( this.value > 1000 ) {
                                    return Highcharts.numberFormat( this.value / 1000, 1) + "k";
                                } else {
                                    return this.value;
                                }
                            } else {
                                return null;
                            }
                        }
                    },
                    opposite: false,
                    offset: 5,
                    gridLineWidth: 0,
                    lineWidth: 1,
                    lineColor: "rgba(183, 183, 183, 0.29)",
                    endOnTick: true,
                    showLastLabel: true,
                    title: {
                        text: null,
                        style: {
                            color: "#FFFFFF"
                        }
                    },
                    showFirstLabel: true,
                    min: 0,
                    crosshair: {
                        snap: false
                    },
                    height: "50%",
                    top: "50%"
                }],
            xAxis: {
                type: "datetime",
                lineWidth: 1,
                title: {
                    text: null
                },
                plotLines: [],
                min: minDate.getTime()

            }
        };

        // Add plotline if defined
        // if (this.props.plotLine) {
        //     config.xAxis.plotLines.push({
        //         color: "red",
        //         id: "plot_line",
        //         dashStyle: "longdashdot",
        //         value: this.props.plotLine,
        //         width: 1,
        //         zIndex: 5
        //     });
        // }

        // Fix the height if defined, if not use offsetHeight
        config.chart.height = 300;


        // Add onClick eventlistener if defined
        if (this.props.onClick) {
            config.chart.events = {
                click: this.props.onClick
            };
        }

        return (
            <div className="">
                <div className="" style={{margin: 10}}>
                    <div style={{paddingTop: 0, paddingBottom: "0.5rem"}}>
                        {priceData && volumeData ? <ReactHighstock ref="priceChart" config={config}/> : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default PriceChart;
