const defines = require('./../defines');
const Fish = require('./fish');
const PlayerController = require('./player');
const ConfigManager = require('./../config/configManager');
const gameController = require('./gameController');
const RobotManager = require('./../config/robotManager');


let _fishIndex = 1;
const _fishMaxLimit = {1:{11101:1, 11001:1, 10901:2, 10801:3, 10701:3, 10601:3},
                       2:{11101:3, 11001:3, 10901:5, 10801:8, 10701:8, 10601:8}};

let robotCD = 5 * 1000;

const Room = function (roomId, roomType) {
    let that = {};
    let _host;
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


    const getFishNumberOfKind = function (fishKind) {
        let count = 0;
        for(let i = 0; i < _fishList.length; i++){
            let fish = _fishList[i];
            if(!fish.isDead() && fish.kind === fishKind){
                count++;
            }
        }
        return count;
    };

    //初始化鱼群
    for(let i = 0; i < (defines.roomFishMax + defines.roomFishMin) / 2; i++){
        let fishConfig = ConfigManager.getFishByRandom();
        let fishKind = fishConfig.fid;
        let num = getFishNumberOfKind(fishKind);
        let count = 0;
        while(_fishMaxLimit[_roomType][fishKind] && num > _fishMaxLimit[_roomType][fishKind] && count < 50){
            fishConfig = ConfigManager.getFishByRandom();
            fishKind = fishConfig.fid;
            num = getFishNumberOfKind(fishKind);
            count++;
        }
        let fish = Fish(_fishIndex++, fishKind);
        _fishList.push(fish);
        fish.setStepByRandom();
    }

    const timeStep = 50;
    let updateFunc = null;
    let fishUpdateFunc = null;
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
        //指定房主
        if(!_host){
            _host = player;
        }
        if(cb) cb(null, {roomId:_roomId, seatId:seatId, roomType:_roomType});
        if(getPlayerNumber() === 1 && !updateFunc){
            //每5秒新增鱼
            fishUpdateFunc = setInterval(function () {
                _createFish();
            }, 5000);

            //帧同步定时器
            updateFunc = setInterval(function () {
                let fishData = [];
                let deadData = [];
                for(let i = 0; i < _fishList.length; i++){
                    let fish = _fishList[i];
                    if(!fish.isDead()){
                        if(fish.iceTime === 5000){
                            fishData.push({fid:fish.fid, pathIndex:fish.pathIndex, step:fish.step, hp:fish.hp, maxHp:fish.maxHp, ice:5000, reverse:fish.reverse ? 1 : 2});
                        } else if(fish.iceTime === 0) {
                            fishData.push({fid:fish.fid, pathIndex:fish.pathIndex, step:fish.step, hp:fish.hp, maxHp:fish.maxHp, ice:0, reverse:fish.reverse ? 1 : 2});
                            fish.iceTime = -1;
                        } else {
                            fishData.push({fid:fish.fid, pathIndex:fish.pathIndex, step:fish.step, hp:fish.hp, maxHp:fish.maxHp, reverse:fish.reverse ? 1 : 2});
                        }
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
                        _player.playTime += timeStep;
                        _player.syncGameData(fishData, true);
                    }
                }
                // console.log('rom: syncGameData：' + JSON.stringify(fishData));
                //机器人
                if(_playerList.length < defines.roomPlayerNumberMax - 2 && getPlayerNumber() > 0){
                    if(robotCD < 0){
                        createRobot();
                        robotCD = Math.floor(Math.random() * 1000 * 5);
                    } else {
                        robotCD -= timeStep;
                    }
                }
                // 玩家自动行为
                for(let i = 0; i < _playerList.length; i++){
                    let _player = _playerList[i];
                    if(_player && !_player.isRobot){
                        // 发射炮弹
                        if(_player.autoShot){
                            // 金币是否足够
                            if(_player.silver < defines.cannonCost){
                                _player.stopAutoShot();
                            } else {
                                _player.shotCD -= timeStep;
                                if(_player.shotCD <= 0){
                                    _player.robotReset(_fishList, getFish(_player.targetFishId));
                                    // 没有目标
                                    if(_player.targetFishId === 0){

                                    } else {
                                        gameController.playerShot(_player, _player.targetFishRotation, 0);
                                    }
                                }
                            }
                        }
                    }
                }
                //机器人行为
                for(let i = 0; i < _playerList.length; i++){
                    let _player = _playerList[i];
                    if(_player && _player.isRobot){
                        _player.playTime += timeStep;
                        //没人房间加速离开
                        if(getPlayerNumber() === 0){
                            _player.playTime +=  100 * timeStep;
                        }
                        //人满房间加速离开
                        if(_playerList.length === defines.roomPlayerNumberMax && getPlayerNumber() > 0){
                            _player.playTime +=  100 * timeStep;
                        }
                        //退出
                        if(_player.playTime > 8 * 60 * 1000){
                            if(Math.random() < 0.15){
                                that.removePlayer(_player);
                                break;
                            } else {
                                _player.playTime = Math.random() * 5 * 60 * 1000;
                            }
                        }
                        // 没钱
                        if(_player.silver < 100){
                            that.removePlayer(_player);
                            break;
                        }
                        // 发射炮弹
                        _player.shotCD -= timeStep;
                        if(_player.shotCD <= 0){
                            _player.robotReset(_fishList, getFish(_player.targetFishId));
                            // 没有目标
                            if(_player.targetFishId === 0){

                            } else {
                                gameController.playerShot(_player, _player.targetFishRotation, 0);
                            }
                        }
                        // 使用技能1
                        _player.skill1CD -= timeStep;
                        if(_player.skill1CD <= 0){
                            _player.skill1CD = 20 * 1000;
                            if(Math.random() < 0.3){
                                that.useSkill(_player, defines.skillIce);
                            }
                        }
                    }
                }
            }, timeStep);
        }
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
        if(playerIndex === -1){
            if(cb) cb('[room] player is not in room ');
        } else {
            // console.log('[room:removePlayer] playerIndex :' + playerIndex);
            // console.log('[room:removePlayer] _playerList.length 1 :' + _playerList.length);
            _playerList.splice(playerIndex, 1);
            //更新房主
            if(_host && _host.uid === player.uid){
                _host = null;
                for(let i = 0; i < _playerList.length; i++){
                    let _player = _playerList[i];
                    if(_player && !_player.isRobot){
                        _host = _player;
                        break;
                    }
                }
            }
            // 归还机器人
            if(player.isRobot){
                console.log('robor out:' + player.nickname);
                RobotManager.returnRobot(player.robotId);
            }
            if(getPlayerNumber() === 0 && getRobotNumber() === 0 && updateFunc){
                console.log('房间没有玩家，停止');
                robotCD = Math.floor(Math.random() * 1000 * 5);
                clearInterval(updateFunc);
                updateFunc = null;
                clearTimeout(fishUpdateFunc);
            }
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
    that.playerShot = function (shotter, rotation, silver, targetFishId, cb) {
        // console.log('[room:playerShot]player shot:' + shotter.nickname + '  : rotation' + rotation);
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.playerShot({shotter:shotter.uid, rotation:rotation, silver:silver, targetFishId:targetFishId, auto:_player.autoShot ? 1 : 2}, true);
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
    that.playerSilverRefresh = function(player){
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.silverRefesh({uid:player.uid, silver:player.silver}, false);
            }
        }
    };
    const getPlayer = function (uid) {
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player && _player.uid === uid){
                return _player;
            }
        }
        return null;
    };
    const getPlayerNumber = function () {
        let num = 0;
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player && !_player.isRobot){
                num++;
            }
        }
        return num;
    };
    const getRobotNumber = function () {
        let num = 0;
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player && _player.isRobot){
                num++;
            }
        }
        return num;
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
            for(let i = 0; i < 5; i++){
                _createFish();
            }
            return;
        }
        // console.log('kill fish = ' + JSON.stringify(fish));
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
        if(index === -1){
            console.warn('[room:removeFish] err, fish is not exist :' + fid);
        } else {
            _fishList.splice(index, 1);
        }
    };
    that.hitFish = function (player, bulletUId, fid, cb) {
        if(!_host){
            console.warn('[room]:hitFish : host is not exist');
            return;
        }
        if(_host.uid != player.uid){
            return;
        }
        let shotPlayer = getPlayer(bulletUId);
        if(!shotPlayer){
            return;
        }
        const cannonConfig = ConfigManager.getCannonConfigByLevel(shotPlayer.level);
        let fish = getFish(fid);
        if(!fish){
            //console.warn('[room:hitFish] err, fish is not exist :' + fid);
        } else {
            fish.beHit(cannonConfig.power);
            //是否击杀
            if(fish.isDead()){
                killFish(shotPlayer, fish);
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
    that.useSkill = function (player, skillId, cb) {
        switch (skillId) {
            case defines.skillIce:
                for(let i = 0; i < _fishList.length; i++){
                    let fish = _fishList[i];
                    if(fish && !fish.isDead()){
                        fish.iceTime = 5000;
                    }
                }
                break;
            case defines.skillTarget:

                break;
            default:
                if(cb) cb('技能不存在');
                break;
        }
        if(cb) cb(null, {uid:player.uid, skillId:skillId});
    };

    const createRobot = function () {
        const rid = RobotManager.getRobotIdByRandom();
        if(-1 === rid){
            console.log('没有空闲机器人');
            console.log('现有可用机器人：' + RobotManager.getNumberOfIdle());
            return;
        }
        if(0 === rid){
            console.log('没有去除机器人');
            console.log('现有可用机器人：' + RobotManager.getNumberOfIdle());
            return;
        }
        const robotData = RobotManager.takeRobot(rid);
        let robot = PlayerController.createRobot({
            uid: 'buyurobot' + robotData.id,
            nickname: robotData.nickname,
            avatarUrl: robotData.avatarUrl,
            level: robotData.level, exp: robotData.exp, vip: robotData.vip, silver: robotData.silver, gold: robotData.gold, s1:robotData.s1, s2:robotData.s2
        });
        robot.robotId = robotData.id;
        that.joinPlayer(robot);
        console.log('创建机器人：' + robot.nickname + ' seat:' + robot.seatId);
        console.log('现有可用机器人：' + RobotManager.getNumberOfIdle());
    };

    const _createFish = function () {
        let fishNumber = _fishList.length;
        if( fishNumber >= defines.roomFishMax ){
            return;
        }
        let fishConfig = ConfigManager.getFishByRandom();
        // console.log('fishConfig:' + JSON.stringify(fishConfig));
        let fishKind = fishConfig.fid;
        let num = getFishNumberOfKind(fishKind);
        let count = 0;
        while(_fishMaxLimit[_roomType][fishKind] && num > _fishMaxLimit[_roomType][fishKind] && count < 50){
            fishConfig = ConfigManager.getFishByRandom();
            fishKind = fishConfig.fid;
            num = getFishNumberOfKind(fishKind);
            count++;
        }
        let fish = Fish(_fishIndex++, fishKind);
        // console.log('新增鱼:' + fish.fid + ' - ' + fish.kind + ' - ' + fish.pathIndex);
        _fishList.push(fish);
        for(let i = 0; i < _playerList.length; i++){
            let _player = _playerList[i];
            if(_player){
                _player.createFish({fid:fish.fid, kind:fish.kind, pathIndex:fish.pathIndex, step:fish.step}, true);
            }
        }
    };

    return that;
};
module.exports = Room;