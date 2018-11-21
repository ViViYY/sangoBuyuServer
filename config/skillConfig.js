const SkillConfig = function (id, name, active, cd, des, level, nextId, cost_silver, cost_gold, need_level, pro1, num1, pro2, num2, pro3, num3) {
    let that = {};

    let _id = id;
    let _name = name;
    let _active = active;
    let _cd = cd;
    let _des = des;
    let _level = level;
    let _nextId = nextId;
    let _cost_silver = cost_silver;
    let _cost_gold = cost_gold;
    let _need_level = need_level;
    let _pro1 = pro1;
    let _num1 = num1;
    let _pro2 = pro2;
    let _num2 = num2;
    let _pro3 = pro3;
    let _num3 = num3;

    Object.defineProperty(that, 'id', {
        get: function () {return _id;}, enumerable: true,
    });
    Object.defineProperty(that, 'name', {
        get: function () {return _name;}, enumerable: true,
    });
    Object.defineProperty(that, 'active', {
        get: function () {return _active;}, enumerable: true,
    });
    Object.defineProperty(that, 'cd', {
        get: function () {return _cd;}, enumerable: true,
    });
    Object.defineProperty(that, 'des', {
        get: function () {return _des;}, enumerable: true,
    });
    Object.defineProperty(that, 'level', {
        get: function () {return _level;}, enumerable: true,
    });
    Object.defineProperty(that, 'nextId', {
        get: function () {return _nextId;}, enumerable: true,
    });
    Object.defineProperty(that, 'costSilver', {
        get: function () {return _cost_silver;}, enumerable: true,
    });
    Object.defineProperty(that, 'costGold', {
        get: function () {return _cost_gold;}, enumerable: true,
    });
    Object.defineProperty(that, 'needLevel', {
        get: function () {return _need_level;}, enumerable: true,
    });
    Object.defineProperty(that, 'pro1', {
        get: function () {return _pro1;}, enumerable: true,
    });
    Object.defineProperty(that, 'num1', {
        get: function () {return _num1;}, enumerable: true,
    });
    Object.defineProperty(that, 'pro2', {
        get: function () {return _pro2;}, enumerable: true,
    });
    Object.defineProperty(that, 'num2', {
        get: function () {return _num2;}, enumerable: true,
    });
    Object.defineProperty(that, 'pro3', {
        get: function () {return _pro3;}, enumerable: true,
    });
    Object.defineProperty(that, 'num3', {
        get: function () {return _num3;}, enumerable: true,
    });

    return that;
};
module.exports = SkillConfig;