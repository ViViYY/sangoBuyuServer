const defines = require('./../defines');
const Room = require('./room');
const mydb = require('./../unit/db');
let _roomSimpleList = [];
let _roomHardList = [];
let _roomIdIndex = 1;

exports.joinHall = function (player, cb) {
    let playerNumberSimple = this.getSimpleRoomPlayerNumber();
    let playerNumberHard = this.getHardRoomPlayerNumber();
    cb(null, {numSimple:playerNumberSimple, numHard:playerNumberHard});
};
exports.getSimpleRoomPlayerNumber = function () {
    let playerNumberSimple = 0;
    for(let i = 0; i < _roomSimpleList.length; i++){
        let roomSimple = _roomSimpleList[i];
        if(roomSimple){
            playerNumberSimple += roomSimple.getPlayerList().length;
        }
    }
    return playerNumberSimple;
};
exports.getHardRoomPlayerNumber = function () {
    let playerNumberHard = 0;
    for(let i = 0; i < _roomHardList.length; i++){
        let roomHard = _roomHardList[i];
        if(roomHard){
            playerNumberHard += roomHard.getPlayerList().length;
        }
    }
    return playerNumberHard;
};
exports.getRoom = function (roomId) {
    let roomTarget;
    for(let i = 0; i < _roomSimpleList.length; i++){
        let room = _roomSimpleList[i];
        if(room && room.roomId === roomId){
            roomTarget = room;
            break;
        }
    }
    if(!roomTarget){
        for(let i = 0; i < _roomHardList.length; i++){
            let room = _roomHardList[i];
            if(room && room.roomId === roomId){
                roomTarget = room;
                break;
            }
        }
    }
    if(!roomTarget) {
        console.warn(' gameController: player get room error, room id:' + roomId );
    }
    return roomTarget;
};
exports.getEmptyRoom = function (roomType) {
    let _roomList;
    if(roomType === defines.roomType.simple){
        _roomList = _roomSimpleList;
    } else if(roomType === defines.roomType.hard){
        _roomList = _roomHardList;
    }
    let roomTarget;
    for(let i = 0; i < _roomList.length; i++){
        let room = _roomList[i];
        if(room && !room.isFull()){
            roomTarget = room;
            break;
        }
    }
    return roomTarget;
};
exports.joinRoom = function (roomId, player, roomType, cb) {
    let roomTarget;
    if(0 === roomId){
        roomTarget = this.getEmptyRoom(roomType);
    } else {
        roomTarget = this.getRoom(roomId);
    }
    if(!roomTarget){
        //新建房间
        roomTarget = Room(_roomIdIndex++, roomType);
        if(roomType === defines.roomType.simple){
            _roomSimpleList.push(roomTarget);
        } else if(roomType === defines.roomType.hard){
            _roomHardList.push(roomTarget);
        }
    }
    if(roomTarget.isFull()){
        cb('room :' + roomId + ' is full ');
    } else {
        roomTarget.joinPlayer(player, cb);
    }
};
exports.exitRoom = function (player, cb) {
    let room = this.getRoom(player.roomId);
    if(!room){
        cb('room is not exsit : roomId:' + player.roomId);
    } else {
        room.removePlayer(player, cb);
    }
};
exports.sendRoomDataToPlayer = function (player, cb) {
    let room = this.getRoom(player.roomId);
    if(!room){
        cb('room not exsit');
        console.log('gameController:player ask room data err ,player : ' + player.nickname);
        return;
    }
    let playerList = [];
    let roomPlayerList = room.getPlayerList();
    for(let i = 0; i < roomPlayerList.length; i++){
        let _player = roomPlayerList[i];
        console.log('_player: ' + JSON.stringify(_player));
        if(_player){
            playerList.push({
                uid: _player.uid,
                nickname: _player.nickname,
                avatarUrl: _player.avatarUrl,
                silver: _player.silver,
                vip: _player.vip,
                level: _player.level,
                exp: _player.exp,
                silver: _player.silver,
                gold: _player.gold,
                seatId:_player.seatId
            });
        }
    }
    let fishList = [];
    let roomFishData = room.getFishList();
    for(let i = 0; i < roomFishData.length; i++) {
        let _fish = roomFishData[i];
        if(_fish){
            fishList.push({fid:_fish.fid, kind:_fish.kind, pathIndex:_fish.pathIndex, step:_fish.step, hp:_fish.hp, maxHp:_fish.maxHp, ice:_fish.iceTime});
        }
    }
    cb(null, {playerList:playerList, fishList:fishList});
};

exports.playerShot = function (shotter, rotation, targetFishId, cb) {
    //silver是否足够
    if(shotter.silver < defines.cannonCost){
        if(cb) cb('[gameController:playerShot]silver is not enough');
        return;
    }
    shotter.silver -= defines.cannonCost;

    if(!shotter.isRobot){
        mydb.updateAccountInfo(shotter.uid, {
            silver:shotter.silver
        });
    } else {
        mydb.updateRobotInfo(shotter.robotId, {
            silver:shotter.silver
        });
    }
    // console.log('player shot:' + shotter.nickname + '  : rotation' + rotation);
    let room = this.getRoom(shotter.roomId);
    if(!room){
        cb('[gameController:playerShot]room is not exsit : roomId:' + shotter.roomId);
    } else {
        room.playerShot(shotter, rotation, shotter.silver, targetFishId, cb);
    }
};
exports.hitFish = function (player, bulletUId, fid, cb) {
    let room = this.getRoom(player.roomId);
    if(!room){
        cb('[gameController:hitFish]room is not exsit : roomId:' + player.roomId);
    } else {
        room.hitFish(player, bulletUId, fid, cb);
    }
};
exports.useSkill = function (player, skillId, cb) {
    let room = this.getRoom(player.roomId);
    if(!room){
        cb('[gameController:hitFish]room is not exsit : roomId:' + player.roomId);
    } else {
        room.useSkill(player, skillId, cb);
    }
};