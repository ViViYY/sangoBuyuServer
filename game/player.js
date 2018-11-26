const defines = require('./../defines');
const gameController = require('./gameController');
const mydb = require('./../unit/db');
const configManager = require('./../config/configManager');

const Player = function (socket, data, isRobot) {
    let that = {};
    let _socket = socket;
    let _uid = data.uid;
    let _nickname = data.nickname;
    let _avatarUrl = data.avatarUrl;
    let _level = data.level;
    let _exp = data.exp;
    let _vip = data.vip;
    let _silver = data.silver;
    if(isRobot && _silver < 6000){
        _silver += 10000;
    }
    let _gold = data.gold;
    let _s1 = data.s1;
    let _s2 = data.s2;

    let _isRobot = isRobot;
    let _playTime = Math.random() * 5 * 60 * 1000;
    let _shotCD = 180;

    let _autoShot = false;

    let _roomId = 0;
    let _seatId = 0;
    let _targetFishId = 0;
    let _targetFishRotation = 0;
    let _skill1CD = 20 * 1000;

    let skillCdMap = {};

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
        Object.defineProperty(that, 'avatarUrl', {
            get: function () {
                return _avatarUrl;
            }, set: function (val) {
                _avatarUrl = val;
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
        Object.defineProperty(that, 's1', {
            get: function () {
                return _s1;
            }, set: function (val) {
                _s1 = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 's2', {
            get: function () {
                return _s2;
            }, set: function (val) {
                _s2 = val;
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
        Object.defineProperty(that, 'isRobot', {
            get: function () {
                return _isRobot;
            }, set: function (val) {
                _isRobot = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'playTime', {
            get: function () {
                return _playTime;
            }, set: function (val) {
                _playTime = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'shotCD', {
            get: function () {
                return _shotCD;
            }, set: function (val) {
                _shotCD = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'targetFishId', {
            get: function () {
                return _targetFishId;
            }, set: function (val) {
                _targetFishId = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'targetFishRotation', {
            get: function () {
                return _targetFishRotation;
            }, set: function (val) {
                _targetFishRotation = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'skill1CD', {
            get: function () {
                return _skill1CD;
            }, set: function (val) {
                _skill1CD = val;
            }, enumerable: true,
        });
        Object.defineProperty(that, 'autoShot', {
            get: function () {
                return _autoShot;
            }, set: function (val) {
                _autoShot = val;
            }, enumerable: true,
        });
    }


    console.log('player: login：' + _nickname);
    const notify = function (msg, index, data, noLog) {
        if(!noLog)console.log(' server send player info : msg: ' + msg + ' , callbackIndex:' + index + " , data:" + JSON.stringify(data));
        if(_socket && !isRobot) _socket.emit('notify', {msg:msg, callbackIndex:index, data:data});
    };
    notify('login', data.callbackIndex, {err: null, data: {
            uid: _uid,
            nickname: _nickname,
            avatarUrl: _avatarUrl,
            level: _level,
            exp: _exp,
            vip: _vip,
            silver: _silver,
            gold: _gold,
            s1: _s1,
            s2: _s2
        }
    });
    // notify('login', data.callbackIndex, {err: '不认识你'});
    console.log('create player modul');
    if(_socket){
        _socket.on('disconnect', function () {
            console.log(' player disconnect : ' + _nickname);
            removePlayer(that);
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
                        notify('ask_room_data', _callbackIndex, {err:err, data:resData}, true);
                    });
                    break;
                case 'player_shot':
                    that.autoShot = false;
                    gameController.playerShot(that, _data.rotation, _data.targetFishId, function (err, resData) {
                        if(err){
                            console.log('player: player_shot + ' + _nickname  + ' err : ' + err);
                        } else {
                            console.log('player: player_shot：' + _nickname);
                        }
                    });
                    break;
                case 'hit_fish':
                    gameController.hitFish(that, _data.uid, _data.fishId, function (err, resData) {
                        if(err){
                            console.log('player: hit_fish + ' + _nickname  + ' err : ' + err);
                        } else {
                            console.log('player: hit_fish：' + _nickname);
                        }
                    });
                    break;
                case 'use_skill':
                    //cd检测
                    const timeStamp = Date.parse(new Date().toString());
                    if(skillCdMap[_data.skillId]){
                        const skillConfig = configManager.getSkill(_data.skillId);
                        if(timeStamp - skillCdMap[_data.skillId] < skillConfig.cd){
                            notify('use_skill', _callbackIndex, {err:'技能cd未好,剩余时间：' + (skillConfig.cd - (timeStamp - skillCdMap[_data.skillId])) / 1000 + '秒'});
                            return;
                        }
                    }
                    skillCdMap[_data.skillId] = timeStamp;
                    gameController.useSkill(that, _data.skillId, function (err, resData) {
                        if(err){
                            console.log('player: use_skill + ' + _nickname  + ' err : ' + err);
                        } else {
                            console.log('player: use_skill：' + _nickname + ' : ' + _data.skillId);
                        }
                        notify('use_skill', _callbackIndex, {err:err, data:resData});
                    })
                    break;
                case 'auto_shot':
                    //金币是否是足够
                    if(that.silver >= defines.cannonCost){
                        if(_data.auto === 1){
                            if(!that.autoShot){
                                that.autoShot = true;
                                notify('setAutoShot', -1, {err:null, auto:1});
                            }
                        } else {
                            if(that.autoShot){
                                that.autoShot = false;
                                notify('setAutoShot', -1, {err:null, auto:2});
                            }
                        }
                    }
                case 'share_coin':
                    if(_data.type === 1){
                        that.award(1000, 0, 0);
                        notify('use_skill', _callbackIndex, {err:null, data:{type:1, silver:that.silver}});
                        let room = gameController.getRoom(_roomId);
                        if(room){
                            room.playerSilverRefresh(that);
                        }
                    } else if(_data.type === 2){
                        that.award(3000, 0, 0);
                        notify('use_skill', _callbackIndex, {err:null, data:{type:2, silver:that.silver}});
                        let room = gameController.getRoom(_roomId);
                        if(room){
                            room.playerSilverRefresh(that);
                        }
                    }
                default:
                    break;
            }
        });
    }
    //停止自动攻击
    that.stopAutoShot = function () {
        that.autoShot = false;
        notify('setAutoShot', -1, {err:null, auto:2});
    };
    //强制断开连接
    that.forcedDisconnection = function () {
        notify('message', -1, {msg:'账号在别处登陆'}, true);
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
                avatarUrl: _player.avatarUrl,
                silver: _player.silver,
                vip: _player.vip,
                level: _player.level,
                exp: _player.exp,
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
        that.silver += silver * defines.silverMult;
        that.gold += gold * defines.goldMult;
        that.exp += exp * defines.expMult;
        let levelObj = defines.levelMap[_level];
        let nextLevelObj = defines.levelMap[_level + 1];
        if(nextLevelObj && _exp >= levelObj.needExp){
            _level ++;
            let room = gameController.getRoom(_roomId);
            if(room){
                room.playerLevelUp(_uid, _level);
            }
        }
        if(!that.isRobot){
            mydb.updateAccountInfo(_uid, {
                silver:_silver,
                gold:_gold,
                exp:_exp,
                level:_level
            });
        } else {
            mydb.updateRobotInfo(that.robotId, {
                silver:_silver,
                gold:_gold,
                exp:_exp,
                level:_level
            });
        }
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
    //金币刷新
    that.silverRefesh = function (data, noLog) {
        if (!noLog)console.log('player: silverRefesh：' + JSON.stringify(data));
        notify('silver_refresh', -1, {err:null, data:data}, noLog);
    };
    //////////////////////////////////////////////////// robot
    that.robotReset = function (fishList, fish) {
        //鱼群没有鱼
        if(fishList.length === 0){
            that.targetFishId = 0;
            that.targetFishRotation = 0;
            return;
        }
        if(that.shotCD <= 0){
            that.shotCD = 180;
        }
        let fishTarget = fish;
        let fishPos;
        if(fishTarget){
            fishPos = fishTarget.getFishPosition(0);
            if(fishPos[0] < -defines.windowWidth / 2 || fishPos[0] > defines.windowWidth / 2 || fishPos[1] < -defines.windowHeight / 2 || fishPos[1] > defines.windowHeight / 2){
                fishTarget = null;
            }
        }
        if(!fishTarget){
            fishTarget = fishList[Math.floor(Math.random() * (fishList.length - 1))];
            fishPos = fishTarget.getFishPosition(0);
            let count = 0;
            while(fishPos[0] < -defines.windowWidth / 2 || fishPos[0] > defines.windowWidth / 2 || fishPos[1] < -defines.windowWidth / 2 || fishPos[1] > defines.windowWidth / 2){
                fishTarget = fishList[Math.floor(Math.random() * (fishList.length - 1))];
                fishPos = fishTarget.getFishPosition(0);
                count++;
                if(count > 10){
                    that.targetFishId = 0;
                    that.targetFishRotation = 0;
                    return;
                }
            }
            that.targetFishId = fishTarget.fid;
        }
        let forwardStep = 30;
        //冰冻状态
        if(fishTarget.iceTime > 0){
            forwardStep = 0;
        }
        fishPos = fishTarget.getFishPosition(forwardStep);
        let pos = [-defines.cannonDxToCenter, -defines.windowHeight / 2];
        switch (that.seatId) {
            case defines.seat.DownLeft:
                pos = [-defines.cannonDxToCenter, -defines.windowHeight / 2];
                that.targetFishRotation = Math.atan2(fishPos[1] - pos[1], pos[0] - fishPos[0]) * 180 / Math.PI - 90;
                break;
            case defines.seat.DownRight:
                pos = [defines.cannonDxToCenter, -defines.windowHeight / 2];
                that.targetFishRotation = Math.atan2(fishPos[1] - pos[1], pos[0] - fishPos[0]) * 180 / Math.PI - 90;
                that.targetFishRotation = -that.targetFishRotation;
                break;
            case defines.seat.UpLeft:
                pos = [-defines.cannonDxToCenter, defines.windowHeight / 2];
                that.targetFishRotation = Math.atan2(fishPos[1] - pos[1], pos[0] - fishPos[0]) * 180 / Math.PI - 90;
                that.targetFishRotation = -that.targetFishRotation - 180;
                break;
            case defines.seat.UpRight:
                pos = [defines.cannonDxToCenter, defines.windowHeight / 2];
                that.targetFishRotation = Math.atan2(fishPos[1] - pos[1], pos[0] - fishPos[0]) * 180 / Math.PI - 90;
                that.targetFishRotation = that.targetFishRotation + 180;
                break;
            default:
                break;
        }
    };
    return that;
};
let _playerList = [];
exports.createPlayer = function (socket, data) {
    let player = new Player(socket, data, false);
    _playerList.push(player);
};
exports.createRobot = function (data) {
    let robot = new Player(null, data, true);
    return robot;
};
exports.getPlayer = function (uid) {
    for(let i = 0; i < _playerList.length; i++){
        let player = _playerList[i];
        if(player && player.uid === uid){
            return player;
        }
    }
    return null;
};
removePlayer = function (player) {
    let playerIndex = -1;
    for(let i = 0; i < _playerList.length; i++){
        let _player = _playerList[i];
        if(_player && _player.uid === player.uid){
            playerIndex = i;
        }
    }
    if(playerIndex < 0){
        console.warn('removePlayer err: player is not exsit!!!');
    } else {
        //room移除
        if(player.roomId) {
            console.log('[player]:disconnect, and remove from room ,roomId:' + player.roomId);
            let room = gameController.getRoom(player.roomId);
            if(room){
                room.removePlayer(player);
            }
        }
        //list移除
        // console.log("_playerList 1 = " + _playerList.length);
        _playerList.splice(playerIndex, 1);
        // console.log("_playerList 2 = " + _playerList.length);
    }
};