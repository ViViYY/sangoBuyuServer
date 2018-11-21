const defines = {};

defines.initSilver = 10000;
defines.initGold = 0;

defines.get = 'get';
defines.set = 'set';
defines.both = 'both';

defines.roomPlayerNumberMax = 4;
defines.roomNumberMax = 1;

defines.cannonCost = 4;
defines.fishPathCount = 18;
defines.roomFishMin = 15;
defines.roomFishMax = 40;

defines.levelMap = {
    1: {"needExp":1000}, // 1500
    2: {"needExp":2500}, // 2500
    3: {"needExp":5000}, // 4000
    4: {"needExp":9000}, // 6000
    5: {"needExp":15000}, // 8500
    6: {"needExp":23500}, // 12000
    7: {"needExp":35500}, // 15000
};

defines.seat = {
    "DownLeft" : 0,
    "DownRight" : 1,
    "UpLeft" : 2,
    "UpRight" : 3
};

defines.roomType = {
    simple:1,
    hard:2,
};


defines.expMult = 1; //经验倍数
defines.silverMult = 1; //银币倍数
defines.goldMult = 1; //金币倍数

module.exports = defines;