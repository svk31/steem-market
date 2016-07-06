module.exports = function (Api) {
    return {
        getDynamicGlobal: function() {
            return Api.get().database_api().exec("get_dynamic_global_properties", []);
        },

        getOrderBook: function() {
            return Api.get().database_api().exec("get_order_book", [1000]);
        },

        getTradeHistory: function() {
            let startDateShort = new Date();
            let endDate = new Date();
            endDate.setDate(endDate.getDate());
            startDateShort = new Date(startDateShort.getTime() - 200 * 50 * 1000);

            return Api.get().market_history_api().exec("get_trade_history", [
               startDateShort.toISOString().slice(0, -5),
               endDate.toISOString().slice(0, -5),
               200
            ]);
        },

        getTicker: function() {
            return Api.get().market_history_api().exec("get_ticker", []);
        },

        getMarketHistory: function() {
            let startDateShort = new Date();
            let endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);
            startDateShort = new Date(startDateShort.getTime() - 3600 * 50 * 1000);

            return Api.get().market_history_api().exec("get_market_history", [
                300,
                startDateShort.toISOString().slice(0, -5),
                endDate.toISOString().slice(0, -5)
            ]);
        }
    }
}
