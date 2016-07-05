import numeral from "numeral";

module.exports = {
    format_number: (number, decimals, trailing_zeros = true) => {
        if(isNaN(number) || !isFinite(number) || number === undefined || number === null) return "";
        let zeros = ".";
        for (var i = 0; i < decimals; i++) {
            zeros += "0";
        }
        let num = numeral(number).format("0,0" + zeros);
        if( num.indexOf('.') > 0 && !trailing_zeros)
           return num.replace(/0+$/,"").replace(/\.$/,"")
        return num
    }
};
