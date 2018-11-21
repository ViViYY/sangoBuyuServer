const fishPath = require('./../fishPath');
const ConfigManager = require('./../config/configManager');
const FishConfig = require('./../config/fishConfig');
const defines = require('./../defines');

const Fish = function (fid, kind) {
    let that = {};
    let _fid = fid;
    let _kind = kind;
    let _pathIndex = Math.floor(Math.random() * defines.fishPathCount + 1);
    let _step = 0;
    let _pathPoints = fishPath[_pathIndex];

    let _config = ConfigManager.getFishConfig(_kind);
    let _maxHp = _config.hp;
    let _hp = _config.hp;
    let _killer = null;

    let _reverse = false;

    let _iceTime = -1;

    //getter ande setter
    {
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
        Object.defineProperty(that, 'maxHp', {
            get: function () {return _maxHp;}, enumerable: true,
        });
        Object.defineProperty(that, 'hp', {
            get: function () {return _hp;}, enumerable: true,
        });
        Object.defineProperty(that, 'fishName', {
            get: function () {return _config.fishName;}, enumerable: true,
        });
        Object.defineProperty(that, 'silver', {
            get: function () {return _config.silver;}, enumerable: true,
        });
        Object.defineProperty(that, 'gold', {
            get: function () {return _config.gold;}, enumerable: true,
        });
        Object.defineProperty(that, 'exp', {
            get: function () {return _config.exp;}, enumerable: true,
        });
        Object.defineProperty(that, 'killer', {
            get: function () {return _killer;}, set: function (val) {_killer = val;}, enumerable: true,
        });
        Object.defineProperty(that, 'iceTime', {
            get: function () {return _iceTime;}, set: function (val) {_iceTime = val;}, enumerable: true,
        });
        Object.defineProperty(that, 'reverse', {
            get: function () {return _reverse;}, set: function (val) {_reverse = val;}, enumerable: true,
        });
    }

    that.moveStep = function () {
        if(_iceTime > 0){
            _iceTime -= 50;
            if(_iceTime < 0) _iceTime = 0;
            return;
        }
        if(!_reverse){
            _step++;
        } else {
            _step--;
        }
        if(_step > _pathPoints.length - 1){
            _step = _pathPoints.length - 1;
            _reverse = true;
        } else if(_step < 0){
            _step = 0;
            _reverse = false;
        }
    };
    that.setStepByRandom = function () {
        _step = Math.floor(Math.random() * _pathPoints.length);
    };
    that.beHit = function (power) {
        _hp -= power;
        _hp = Math.max(_hp, 0);
    };
    that.isDead = function () {
        return _hp === 0;
    };
    that.getFishPosition = function (dstep) {
        let targetStep;
        if(!that.reverse){
            targetStep = _step + dstep;
            if(targetStep > _pathPoints.length - 1){
                targetStep = _pathPoints.length - 1;
            }
        } else {
            targetStep = _step - dstep;
            if(targetStep < 0){
                targetStep = 0;
            }
        }
        const data = _pathPoints[targetStep];
        return [data[0], data[1]];
    };

    return that;
};
module.exports = Fish;