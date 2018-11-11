const defines = {};
defines.get = 'get';
defines.set = 'set';
defines.both = 'both';

defines.roomPlayerNumberMax = 4;
defines.roomNumberMax = 1;

defines.cannonCost = 4;

defines.levelMap = {
    1: {"needExp":1000}, // 1000
    2: {"needExp":2000}, // 1500
    3: {"needExp":3500}, // 2000
    4: {"needExp":5500}, // 2500
    5: {"needExp":8000}, // 3000
    6: {"needExp":11000}, // 4000
    7: {"needExp":15000}, // 5000
};

defines.roomType = {
    simple:1,
    hard:2,
};

module.exports = defines;