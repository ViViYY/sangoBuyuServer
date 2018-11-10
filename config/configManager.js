const t_fish_config = require('./../t_fish_config');
const FishConfig = require('./fishConfig');


const TAG = '[ConfigManager]:';
let _fishList = {};
let _fishCount = 0;

//load all config
exports.loadConfig = function () {
    console.log(TAG + ' load all config start --------------------------------------------- ');
    loadFishConfig();
    console.log(TAG + ' load all config end --------------------------------------------- ');
};

//fish config
const loadFishConfig = function () {
    for(let i = 0; i < t_fish_config.length; i++){
        const config = t_fish_config[i];
        let fish = FishConfig(config.id, config.fid, config._name, config.hp, config.gold, config.speed, config.isBoss);
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