const fishPath = require('./../fishPath');

const Fish = function (fid, kind) {
    let that = {};
    let _fid = fid;
    let _kind = kind;
    let _pathIndex = Math.floor(Math.random() * 3 + 1);
    let _step = 0;
    let _pathPoints = fishPath[_pathIndex];
    Object.defineProperty(that, 'fid', {
        get: function () {return _fid;}, enumerable: true,
    });
    Object.defineProperty(that, 'kind', {
        get: function () {return _kind;}, enumerable: true,
    });
    Object.defineProperty(that, 'pathIndex', {
        get: function () {return _pathIndex;}, enumerable: true,
    });
    Object.defineProperty(that, 'step', {
        get: function () {return _step;}, enumerable: true,
    });


    that.moveStep = function () {
        _step++;
        if(_step >= _pathPoints.length){
            _step = 0;
        }
    };

    return that;
};
module.exports = Fish;