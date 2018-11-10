const defines = require('./../defines');
const Fish = require('./fish');
let _fishIndex = 1;

const FISH_KINDS = [10101, 10201, 10301];

const Seat = function () {
    let that = {};

    return that;
};
const Room = function (roomId, roomType) {
    let that = {};
    let _roomId = roomId;
    let _roomType = roomType;
    let _playerList = [];
    let _fishList = [];
    Object.defineProperty(that, 'roomId', {
        get: function () {
            return _roomId;
        }
    });
    Object.defineProperty(that, 'roomType', {
        get: function () {
            return _roomType;
        }
    });
    Object.defineProperty(that, 'players', {
        get: function () {
            return _playerList;
        }
    });
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
    const _createFish = function () {
        const fishKind = FISH_KINDS[Math.floor(Math.random() * 3)];
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
        let data = [];
        for(let i = 0; i < _fishList.length; i++){
            let fish = _fishList[i];
            data.push({fid:fish.fid, kind:fish.kind, pathIndex:fish.pathIndex, step:fish.step});
            fish.moveStep();
        }
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.syncGameData(data, true);
            }
        }
        // console.log('rom: syncGameData：' + JSON.stringify(data));
    }, 50);
    //每5秒新增鱼
    setInterval(function () {
        let fishNumber = _fishList.length;
        if( fishNumber < 10 ){
            _createFish();
        }
    }, 5000);


    return that;
};
module.exports = Room;