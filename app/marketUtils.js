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

    constructor(bucket) {
        this.date = new Date(bucket.open + "+00:00").getTime();

        this.high = (bucket.high_sbd / bucket.high_steem);
        this.low = (bucket.low_sbd / bucket.low_steem);
        this.open = (bucket.open_sbd / bucket.open_steem);
        this.close = (bucket.close_sbd / bucket.close_steem);

        this.steemVolume = bucket.steem_volume / precision;
        this.sbdVolume = bucket.sbd_volume / precision;
    }

    getPriceData() {
        return [this.date, this.open, this.high, this.low, this.close];
    }

    getVolumeData() {
        return [this.date, this.sbdVolume];
    }
}

module.exports = {
    Order,
    MarketHistory
};
