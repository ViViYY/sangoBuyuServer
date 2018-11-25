const PlayerController = require('./game/player');
const defines = require('./defines');
const socket = require('socket.io');
const app = socket('3000');
const config = require('./config');
const mydb = require('./unit/db');
mydb.connect(config.mysqlConfig);
const RobotManager = require('./config/robotManager');
mydb.loadRobotData(function (data) {
    RobotManager.initRobot(data);
});
const ConfigManager = require('./config/configManager');
ConfigManager.loadConfig();
// let fish = ConfigManager.getFishConfig(10101);
// let fish = ConfigManager.getFishByRandom();
// console.log('fish = ' + JSON.stringify(fish));

// const fishPath = require('./fishPath');
// for(let i = 0; i < 13; i++){
//     let id = i + 1;
//     let path = fishPath[id]
//     console.log('path: ' + id + ' length = ' + path.length);
// }




app.on('connection', function (socket) {
    // console.log('a client connected');
    socket.emit('welcome');
    socket.on('notify', function (res) {
        let notifyData = res.data;
        let callbackIndex = res.callbackIndex;
        let msg = res.msg;
        if(msg != 'player_shot' && msg != 'hit_fish'){
            console.log(' client nofity data : ' + JSON.stringify(res));
        }
        switch (msg) {
            case 'login':
                mydb.checkAccount(notifyData.uid, notifyData.password, function (err, data) {
                    if(err){
                        socket.emit('notify', {msg:msg, callbackIndex:callbackIndex, data:{err:err}});
                    } else {
                        //账户不存在
                        if(data.length === 0){
                            console.log('notifyData = ' + JSON.stringify(notifyData));
                            //创建
                            mydb.insertAccountInfo({
                                uid: notifyData.uid,
                                password: notifyData.password,
                                nickname: notifyData.nickname,
                                avatarUrl: notifyData.avatarUrl,
                                level: 1, exp: 0, vip: 0, silver: defines.initSilver, gold: defines.initGold, s1:defines.skillIce, s2:defines.skillTarget
                            }, () => {
                                //创建玩家
                                PlayerController.createPlayer(socket, {
                                    uid: notifyData.uid,
                                    nickname: notifyData.nickname,
                                    avatarUrl: notifyData.avatarUrl,
                                    callbackIndex: callbackIndex,
                                    level: 1, exp: 0, vip: 0, silver: defines.initSilver, gold: defines.initGold, s1:defines.skillIce, s2:defines.skillTarget
                                });
                            });
                        } else {
                            let accountData = data[0];
                            //玩家是否已经登陆
                            let player = PlayerController.getPlayer(accountData.uid);
                            if(player){
                                //踢掉
                                console.log('重复登陆，强制踢出:');
                                player.forcedDisconnection();
                            }
                            //创建玩家
                            PlayerController.createPlayer(socket, {
                                uid: accountData.uid,
                                nickname: accountData.nickname,
                                avatarUrl: accountData.avatarUrl,
                                callbackIndex: callbackIndex,
                                level: accountData.level,
                                exp: accountData.exp,
                                vip: accountData.vip,
                                silver: accountData.silver,
                                gold: accountData.gold,
                                s1: accountData.s1,
                                s2: accountData.s2
                            });
                        }
                    }
                });
                break;
            default:
                break;
        }

    });
});
console.log('server start');