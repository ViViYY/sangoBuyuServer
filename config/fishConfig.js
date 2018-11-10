const FishConfig = function (id, fid, name, hp, gold, speed, isBoss) {
    let that = {};
    let _id = id;
    let _fid = fid;
    let _fishName = name;
    let _hp = hp;
    let _gold = gold;
    let _speed = speed;
    let _isBoss = isBoss;

    Object.defineProperty(that, 'id', {
        get: function () {return _id;}, enumerable: true,
    });
    Object.defineProperty(that, 'fid', {
        get: function () {return _fid;}, enumerable: true,
    });
    Object.defineProperty(that, 'fishName', {
        get: function () {return _fishName;}, enumerable: true,
    });
    Object.defineProperty(that, 'hp', {
        get: function () {return _hp;}, enumerable: true,
    });
    Object.defineProperty(that, 'gold', {
        get: function () {return _gold;}, enumerable: true,
    });
    Object.defineProperty(that, 'speed', {
        get: function () {return _speed;}, enumerable: true,
    });
    Object.defineProperty(that, 'isBoss', {
        get: function () {return _isBoss;}, enumerable: true,
    });

    return that;
};
module.exports = FishConfig;