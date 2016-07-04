let precision = 1000; // SAME FOR SBD AND STEEM

class Order {
    constructor(data, type) {
        this.type = type;
        this.price = type === "ask" ? parseFloat(data.real_price) :
            (1 / parseFloat(data.real_price));
        this.steem = parseInt(data.steem, 10);
        this.sbd = parseInt(data.sbd, 10);
    }

    getSteemAmount() {
        return this.steem / precision;
    }

    getPrice() {
        return this.price;
    }

    getSBDAmount() {
        return this.sbd / precision;
    }
}

class Price {
    constructor(ratio) {
        this.ratio = ratio;
    }

    getPrice() {

    }

    getInvertedPrice() {
        return 1 / this.getPrice();
    }
}

class MarketHistory {

}

module.exports = {
    Order,
    MarketHistory
};
