const defines = {};

defines.windowWidth = 1024;
defines.windowHeight = 768;
defines.cannonDxToCenter = 300;

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
defines.roomFishMax = 45;

defines.levelMap = {
    1: {"needExp":1000}, // 1500
    2: {"needExp":2500}, // 3000
    3: {"needExp":5500}, // 5000
    4: {"needExp":10500}, // 8000
    5: {"needExp":18500}, // 12000
    6: {"needExp":30500}, // 18000
    7: {"needExp":50000}, // 19500
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

defines.skillIce = 10101;//冰冻技能
defines.skillTarget = 10201;//追踪技能

module.exports = defines;