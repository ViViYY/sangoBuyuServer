const defines = require('./../defines');
const gameController = require('./gameController');

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

    const setDefineProperty = function (type, propertyName, propertyValue) {
        switch (type) {
            case defines.get :
                Object.defineProperty(that, propertyName, {
                    get:function () {return propertyValue;}
                });
                break;
            case defines.set :
                Object.defineProperty(that, propertyName, {
                    set:function (value) {propertyValue = value;}
                });
                break;
            case defines.both :
                Object.defineProperty(that, propertyName, {
                    get:function () {return propertyValue;},
                    set:function (value) {propertyValue = value;}
                });
                break;
            default:
                break;
        }
    };
    console.log('player: login：' + _nickname);
    const notify = function (msg, index, data, noLog) {
        if(!noLog)console.log(' server send player info : msg: ' + msg + ' , callbackIndex:' + index + " , data:" + JSON.stringify(data));
        _socket.emit('notify', {msg:msg, callbackIndex:index, data:data});
    };
    setDefineProperty(defines.both, 'uid', _uid);
    setDefineProperty(defines.both, 'nickname', _nickname);
    setDefineProperty(defines.both, 'level', _level);
    setDefineProperty(defines.both, 'exp', _exp);
    setDefineProperty(defines.both, 'vip', _vip);
    setDefineProperty(defines.both, 'silver', _silver);
    setDefineProperty(defines.both, 'gold', _gold);
    setDefineProperty(defines.both, 'roomId', _roomId);
    setDefineProperty(defines.both, 'seatId', _seatId);
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
        if(_msg != 'player_shot') {
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
            default:
                break;
        }
    });
    //强制断开连接
    that.forcedDisconnection = function () {
        console.log('player disconnected forced :' + _nickname);
        _socket.disconnect();
        removePlayer(_uid);
    };
    //其他玩家进入
    that.onPlayerJoin = function (_player) {
        console.log('player: onplayerJoinRoom：' + _player.nickname);
        notify('playerJoinRoom', -1, {err:null, data:{
                uid: _player.uid,
                nickname: _player.nickname,
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
    that.createFish = function (data, noLog) {
        if (!noLog)console.log('player: createFish：' + JSON.stringify(data));
        notify('fishCreate', -1, {err:null, data:{fishData:data}}, noLog);
    };
    //玩家发射炮弹
    that.playerShot = function (data, noLog) {
        if (!noLog)console.log('player: playerShot：' + JSON.stringify(data));
        notify('player_shot', -1, {err:null, data:data}, noLog);
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
removePlayer = function (uid) {
    let playerIndex;
    for(let i = 0; i < _playerList.length; i++){
        let player = _playerList[i];
        if(player && player.uid == uid){
            playerIndex = i;
        }
    }
    if(!playerIndex){
        console.warn('removePlayer err: player is not exsit!!!');
    } else {
        console.log("_playerList 1 = " + _playerList.length);
        _playerList.splice(playerIndex, 1);
        console.log("_playerList 2 = " + _playerList.length);
    }
};