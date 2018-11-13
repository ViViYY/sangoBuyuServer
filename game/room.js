const defines = require('./../defines');
const Fish = require('./fish');
const ConfigManager = require('./../config/configManager');

let _fishIndex = 1;

const Room = function (roomId, roomType) {
    let that = {};
    let _roomId = roomId;
    let _roomType = roomType;
    let _playerList = [];
    let _fishList = [];

    //getter and setter
    {
        Object.defineProperty(that, 'roomId', {
            get: function () {return _roomId;}, enumerable: true,
        });
        Object.defineProperty(that, 'roomType', {
            get: function () {return _roomType;}, enumerable: true,
        });
        Object.defineProperty(that, 'players', {
            get: function () {return _playerList;}, enumerable: true,
        });
    }

    //初始化鱼群
    for(let i = 0; i < (defines.roomFishMax + defines.roomFishMin) / 2; i++){
        const fishConfig = ConfigManager.getFishByRandom();
        const fishKind = fishConfig.fid;
        let fish = Fish(_fishIndex++, fishKind);
        _fishList.push(fish);
        fish.setStepByRandom();
    }

    that.joinPlayer = function (player, cb) {
        let seatId = 0;
        let b = true;
        while(b) {
            let haveSameSeatId = false;
            for(let i = 0; i < _playerList.length; i++){
                let _player = _playerList[i];
                if(_player && _player.seatId === seatId){
                    haveSameSeatId = true;
                    break;
                }
            }
            if(haveSameSeatId){
                seatId++;
                if(seatId >= defines.roomPlayerNumberMax){
                    b = false;
                    console.warn('[room:]joinPlayer:,error , join failed:' + player.nickname);
                    return;
                }
            } else {
                b = false;
            }
        }
        player.seatId = seatId;
        player.roomId = _roomId;
        // 房间被广播通知
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.onPlayerJoin(player);
            }
        }
        _playerList.push(player);
        cb(null, {roomId:_roomId, seatId:seatId, roomType:_roomType});
    };
    that.removePlayer = function (player, cb) {
        let playerIndex = -1;
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player && _player.uid === player.uid){
                playerIndex = i;
                break;
            }
        }
        if(playerIndex == -1){
            if(cb) cb('[room] player is not in room ');
        } else {
            // console.log('[room:removePlayer] playerIndex :' + playerIndex);
            // console.log('[room:removePlayer] _playerList.length 1 :' + _playerList.length);
            _playerList.splice(playerIndex, 1);
            // console.log('[room:removePlayer] _playerList.length 2 :' + _playerList.length);
            if(cb) cb(null, {});
            //广播
            for(let i = 0; i < _playerList.length; i++){
                let _player = _playerList[i];
                if(_player && _player.uid != player.uid){
                    _player.removePlayer({uid:player.uid}, true);
                }
            }
        }
    };
    that.playerShot = function (shotter, rotation, cb) {
        // console.log('[room:playerShot]player shot:' + shotter.nickname + '  : rotation' + rotation);
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player && _player.uid != shotter.uid){
                _player.playerShot({shotter:shotter.uid, rotation:rotation}, true);
            }
        }
    };
    that.isFull = function () {
        if (_playerList.length < defines.roomPlayerNumberMax) {
            return false;
        }
        return true
    };
    that.getPlayerList = function () {
        return _playerList;
    };
    that.getFishList = function () {
        return _fishList;
    };
    const getFish = function (fid) {
        for(let i = 0; i < _fishList.length; i++){
            let fish = _fishList[i];
            if(fish && fish.fid === fid){
                return fish;
            }
        }
        return null;
    };
    const killFish = function (player, fish) {
        // console.log('[room:killFish], player : ' + player.nickname + " kill fish: " + fish.fishName + ' ,  get silver :' + fish.silver);
        // removeFish(fish.fid);
        player.award(fish.silver, fish.gold, fish.exp);
        fish.killer = player.uid;
        //补充
        let fishNumber = _fishList.length;
        if( fishNumber < defines.roomFishMin ){
            _createFish();
            return;
        }
        // console.log('kill fish = ' + JSON.stringify(fish));
        //广播击杀
        // for(let i = 0; i < _playerList.length; i++){
        //     let _player = _playerList[i];
        //     if(_player){
        //         _player.killFish({killer:player.uid, fid:fish.fid, silver:fish.silver, gold:fish.gold});
        //     }
        // }
    };
    const removeFish = function (fid) {
        let index = -1;
        for(let i = 0; i < _fishList.length; i++){
            let fish = _fishList[i];
            if(fish && fish.fid === fid){
                index = i;
                break;
            }
        }
        if(index == -1){
            console.warn('[room:removeFish] err, fish is not exist :' + fid);
        } else {
            _fishList.splice(index, 1);
        }
    };
    that.hitFish = function (player, fid, cb) {
        const cannonConfig = ConfigManager.getCannonConfigByLevel(player.level);
        let fish = getFish(fid);
        if(!fish){
            //console.warn('[room:hitFish] err, fish is not exist :' + fid);
        } else {
            fish.beHit(cannonConfig.power);
            //是否击杀
            if(fish.isDead()){
                killFish(player, fish);
            }
        }
    };
    that.playerLevelUp = function (uid, level) {
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.levelUp({uid:uid, level:level}, false);
            }
        }
    };
    const _createFish = function () {
        let fishNumber = _fishList.length;
        if( fishNumber > defines.roomFishMax ){
            return;
        }
        const fishConfig = ConfigManager.getFishByRandom();
        // console.log('fishConfig:' + JSON.stringify(fishConfig));
        const fishKind = fishConfig.fid;
        let fish = Fish(_fishIndex++, fishKind);
        // console.log('新增鱼:' + fish.fid + ' - ' + fish.kind);
        _fishList.push(fish);
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.createFish({fid:fish.fid, kind:fish.kind, pathIndex:fish.pathIndex, step:fish.step}, true);
            }
        }
    };
    //帧同步定时器
    setInterval(function () {
        let fishData = [];
        let deadData = [];
        for(let i = 0; i < _fishList.length; i++){
            let fish = _fishList[i];
            if(!fish.isDead()){
                fishData.push({fid:fish.fid, pathIndex:fish.pathIndex, step:fish.step, hp:fish.hp, maxHp:fish.maxHp});
                fish.moveStep();
            } else {
                deadData.push(fish);
                fishData.push({fid:fish.fid, pathIndex:fish.pathIndex, step:fish.step, hp:fish.hp, maxHp:fish.maxHp, killer:fish.killer, silver:fish.silver, gold:fish.gold});
            }
        }
        //移除死鱼
        for(let i = 0; i < deadData.length; i++){
            let fishDead = deadData[i];
            if(fishDead){
                removeFish(fishDead.fid);
            }
        }
        if(deadData.length > 0){
            // console.log('移除死鱼：' + deadData.length);
            deadData.length = 0;
        }
        //同步
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.syncGameData(fishData, true);
            }
        }
        // console.log('rom: syncGameData：' + JSON.stringify(data));
    }, 50);
    //每5秒新增鱼
    setInterval(function () {
        _createFish();
    }, 5000);


    return that;
};
module.exports = Room;