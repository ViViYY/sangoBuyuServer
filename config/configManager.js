const t_fish_config = require('./../t_fish_config');
const FishConfig = require('./fishConfig');
const t_cannon_config = require('./../t_cannon_config');
const CannonConfig = require('./cannonConfig');


const TAG = '[ConfigManager]:';
let _fishList = {};
let _fishCount = 0;
let _cannonList = {};
let _cannonCount = 0;

//load all config
exports.loadConfig = function () {
    console.log(TAG + ' load all config start --------------------------------------------- ');
    loadFishConfig();
    loadCannonConfig();
    console.log(TAG + ' load all config end --------------------------------------------- ');
};

// -------------------------------------- fish config
const loadFishConfig = function () {
    for(let i = 0; i < t_fish_config.length; i++){
        const config = t_fish_config[i];
        let fish = FishConfig(config.id, config.fid, config._name, config.hp, config.silver, config.gold, config.exp, config.speed, config.isBoss, config.deadSound);
        _fishList[fish.fid] = fish;
        _fishCount++;
    }
    console.log(TAG + ' fish count: ' + _fishCount);
};
exports.getFishConfig = function (fid) {
    let fish = _fishList[fid];
    if(!fish) {
        console.warn(TAG + 'getFishConfig err, fish is not exist, fid = ' + fid);
    }
    return fish;
};
//随机获取一条鱼
exports.getFishByRandom = function () {
    let keys = Object.keys(_fishList);
    let randonFid = keys[Math.floor(Math.random() * keys.length)];
    // console.log('randonFid = ' + randonFid);
    const fishConfig = _fishList[randonFid];
    if(fishConfig){
       return fishConfig;
    }
    console.warn(TAG + 'getFishByRandom err');
    return null;
};

// -------------------------------------- cannon config
const loadCannonConfig = function () {
    for(let i = 0; i < t_cannon_config.length; i++){
        const config = t_cannon_config[i];
        let cannon = CannonConfig(config.id, config.cid, config.level, config.power, config.s1, config.s2, config.s3, config.speed);
        _cannonList[cannon.id] = cannon;
        _cannonCount++;
    }
    console.log(TAG + ' cannon count: ' + _cannonCount);
};
exports.getCannonConfig = function (id) {
    let cannon = _cannonList[id];
    if(!cannon) {
        console.warn(TAG + 'getCannonConfig err, cannon is not exist, cid = ' + id);
    }
    return cannon;
};
exports.getCannonConfigByLevel = function (level) {
    let cannon = null;
    for(let key in _cannonList){
        const config = _cannonList[key];
        if(config && config.level === level){
            cannon = config;
            break;
        }
    }
    if(!cannon) {
        console.warn(TAG + 'getCannonConfigByLevel err, cannon is not exist, level = ' + level);
    }
    return cannon;
};