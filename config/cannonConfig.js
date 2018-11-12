const CannonConfig = function (id, cid, level, power, s1, s2, s3, speed) {
    let that = {};
    let _id = id;
    let _cid = cid;
    let _level = level;
    let _power = power;
    let _s1 = s1;
    let _s2 = s2;
    let _s3 = s3;
    let _speed = speed;

    Object.defineProperty(that, 'id', {
        get: function () {return _id;}, enumerable: true,
    });
    Object.defineProperty(that, 'cid', {
        get: function () {return _cid;}, enumerable: true,
    });
    Object.defineProperty(that, 'level', {
        get: function () {return _level;}, enumerable: true,
    });
    Object.defineProperty(that, 'power', {
        get: function () {return _power;}, enumerable: true,
    });
    Object.defineProperty(that, 's1', {
        get: function () {return _s1;}, enumerable: true,
    });
    Object.defineProperty(that, 's2', {
        get: function () {return _s2;}, enumerable: true,
    });
    Object.defineProperty(that, 's3', {
        get: function () {return _s3;}, enumerable: true,
    });
    Object.defineProperty(that, 'speed', {
        get: function () {return _speed;}, enumerable: true,
    });

    return that;
};
module.exports = CannonConfig;