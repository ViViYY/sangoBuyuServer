const defines = require('./../defines');
const gameController = require('./gameController');
const mydb = require('./../unit/db');

const Player = function (socket, data) {
    let that = {};
    let _socket = socket;
    let _uid = data.uid;
    let _nickname = data.nickname;
    let _level = data.level;
    let _exp = data.exp;
    let _vip = data.vip;
    let _silver = data.silver;
    let _gold = data.gold;
    let _roomId = 0;
    let _seatId = 0;

    //getter ande setter
    {
        Object.defineProperty(that, 'uid', {
            get: function () {
                return _uid;
            }, set: function (val) {
                _uid = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'nickname', {
            get: function () {
                return _nickname;
            }, set: function (val) {
                _nickname = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'level', {
            get: function () {
                return _level;
            }, set: function (val) {
                _level = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'exp', {
            get: function () {
                return _exp;
            }, set: function (val) {
                _exp = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'vip', {
            get: function () {
                return _vip;
            }, set: function (val) {
                _vip = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'silver', {
            get: function () {
                return _silver;
            }, set: function (val) {
                _silver = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'gold', {
            get: function () {
                return _gold;
            }, set: function (val) {
                _gold = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'roomId', {
            get: function () {
                return _roomId;
            }, set: function (val) {
                _roomId = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'seatId', {
            get: function () {
                return _seatId;
            }, set: function (val) {
                _seatId = val;
            }, enumerable: true,
        });
    }


    console.log('player: login：' + _nickname);
    const notify = function (msg, index, data, noLog) {
        if(!noLog)console.log(' server send player info : msg: ' + msg + ' , callbackIndex:' + index + " , data:" + JSON.stringify(data));
        _socket.emit('notify', {msg:msg, callbackIndex:index, data:data});
    };
    notify('login', data.callbackIndex, {err: null, data: {
            uid: _uid,
            nickname: _nickname,
            level: _level,
            exp: _exp,
            vip: _vip,
            silver: _silver,
            gold: _gold
        }
    });
    // notify('login', data.callbackIndex, {err: '不认识你'});
    console.log('create player modul');
    _socket.on('disconnect', function () {
        console.log(' player disconnect : ' + _nickname);
        gameController.exitRoom(that, function (err, resData) {

        });
    });
    _socket.on('notify', function (notifyData) {
        let _msg = notifyData.msg;
        let _callbackIndex = notifyData.callbackIndex;
        let _data = notifyData.data;
        if(_msg != 'player_shot' && _msg != 'hit_fish') {
            console.log('#player nofity data# : ' + JSON.stringify(notifyData));
        }
        switch (_msg) {
            case 'join_hall':
                gameController.joinHall(that, function (err, resData) {
                    if(err){
                        console.log('player: join_hall + ' + _nickname  + ' err : ' + err);
                    } else {
                        console.log('player: join_hall：' + _nickname);
                    }
                    notify('join_hall', _callbackIndex, {err:err, data:resData});
                });
                break;
            case 'join_room':
                gameController.joinRoom(0, that, _data.roomType, function (err, resData) {
                    if(err){
                        console.log('player: join_room + ' + _nickname  + ' err : ' + err);
                    } else {
                        console.log('player: join_room：' + _nickname);
                    }
                    notify('join_room', _callbackIndex, {err:err, data:resData});
                });
                break;
            case 'exit_room':
                gameController.exitRoom(that, function (err, resData) {
                    if(err){
                        console.log('player: exit_room + ' + _nickname  + ' err : ' + err);
                    } else {
                        console.log('player: exit_room：' + _nickname);
                    }
                    console.log('[player] player leave room:' + _nickname);
                    let playerNumberSimple = gameController.getSimpleRoomPlayerNumber();
                    let playerNumberHard = gameController.getHardRoomPlayerNumber();
                    resData.numSimple = playerNumberSimple;
                    resData.numHard = playerNumberHard;
                    notify('exit_room', _callbackIndex, {err:err, data:resData});
                });
                break;
            case 'ask_room_data':
                gameController.sendRoomDataToPlayer(that, function (err, resData) {
                    if(err){
                        console.log('player: ask_room_data + ' + _nickname  + ' err : ' + err);
                    } else {
                        console.log('player: ask_room_data：' + _nickname);
                    }
                    notify('ask_room_data', _callbackIndex, {err:err, data:resData});
                });
                break;
            case 'player_shot':
                gameController.playerShot(that, _data.rotation, function (err, resData) {
                    if(err){
                        console.log('player: player_shot + ' + _nickname  + ' err : ' + err);
                    } else {
                        console.log('player: player_shot：' + _nickname);
                    }
                });
                break;
            case 'hit_fish':
                gameController.hitFish(that, _data.fishId, function (err, data) {
                    if(err){
                        console.log('player: hit_fish + ' + _nickname  + ' err : ' + err);
                    } else {
                        console.log('player: hit_fish：' + _nickname);
                    }
                });
                break;
            default:
                break;
        }
    });
    //强制断开连接
    that.forcedDisconnection = function () {
        console.log('player disconnected forced :' + _nickname);
        _socket.disconnect();
        removePlayer(that);
    };
    //其他玩家进入
    that.onPlayerJoin = function (_player) {
        console.log('player: onplayerJoinRoom：' + _player.nickname);
        notify('playerJoinRoom', -1, {err:null, data:{
                uid: _player.uid,
                nickname: _player.nickname,
                silver: _player.silver,
                vip: _player.vip,
                level: _player.level,
                exp: _player.exp,
                silver: _player.silver,
                gold: _player.gold,
                seatId:_player.seatId
            }});
    };
    //其他玩家离开
    that.removePlayer = function (data, noLog) {
        console.log('player: removePlayer：' + JSON.stringify(data));
        notify('player_exit', -1, {err:null, data:data});
    };
    //同步帧数据
    that.syncGameData = function (data, noLog) {
        if (!noLog)console.log('player: syncGameData：' + JSON.stringify(data));
        notify('syncGameData', -1, {err:null, data:{fishData:data}}, noLog);
    };
    //新建鱼
    that.createFish = function (fishData, noLog) {
        if (!noLog)console.log('player: createFish：' + JSON.stringify(data));
        notify('fishCreate', -1, {err:null, data:{fishData:fishData}}, noLog);
    };
    //玩家发射炮弹
    that.playerShot = function (data, noLog) {
        if (!noLog)console.log('player: playerShot：' + JSON.stringify(data));
        notify('player_shot', -1, {err:null, data:data}, noLog);
    };
    //击杀鱼得奖励
    that.award = function (silver, gold, exp) {
        that.silver += silver;
        _gold += gold;
        _exp += exp;
        console.log('_roomId = ' + _roomId);
        let levelObj = defines.levelMap[_level];
        let nextLevelObj = defines.levelMap[_level + 1];
        if(nextLevelObj && _exp >= levelObj.needExp){
            _level ++;
            let room = gameController.getRoom(_roomId);
            if(room){
                room.playerLevelUp(_uid, _level);
            }
        }
        mydb.updateAccountInfo(_uid, {
            silver:_silver,
            gold:_gold,
            exp:_exp,
            level:_level
        });
    };
    //广播升级
    that.levelUp = function (data, noLog) {
        if (!noLog)console.log('player: levelUp：' + JSON.stringify(data));
        notify('level_up', -1, {err:null, data:data}, noLog);
    };
    //广播击杀
    that.killFish = function (data, noLog) {
        if (!noLog)console.log('player: killFish：' + JSON.stringify(data));
        notify('kill_fish', -1, {err:null, data:data}, noLog);
    };

    return that;
};
let _playerList = [];
exports.createPlayer = function (socket, data) {
    let player = new Player(socket, data);
    _playerList.push(player);
};
exports.getPlayer = function (uid) {
    for(let i = 0; i < _playerList.length; i++){
        let player = _playerList[i];
        if(player && player.uid == uid){
            return player;
        }
    }
    return null;
};
removePlayer = function (player) {
    let playerIndex;
    for(let i = 0; i < _playerList.length; i++){
        let _player = _playerList[i];
        if(_player && _player.uid === player.uid){
            playerIndex = i;
        }
    }
    if(!playerIndex){
        console.warn('removePlayer err: player is not exsit!!!');
    } else {
        //room移除
        if(player.roomId) {
            let room = gameController.getRoom(player.roomId);
            if(room){
                room.removePlayer(player);
            }
        }
        //list移除
        console.log("_playerList 1 = " + _playerList.length);
        _playerList.splice(playerIndex, 1);
        console.log("_playerList 2 = " + _playerList.length);
    }
};