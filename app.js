const PlayerController = require('./game/player');
const socket = require('socket.io');
const app = socket('3000');
const config = require('./config');
const mydb = require('./unit/db');
mydb.connect(config.mysqlConfig);

app.on('connection', function (socket) {
    console.log('a client connected');
    socket.emit('welcome');
    socket.on('notify', function (res) {
        let notifyData = res.data;
        let callbackIndex = res.callbackIndex;
        let msg = res.msg;
        if(msg != 'player_shot'){
            console.log(' client nofity data : ' + JSON.stringify(res));
        }
        switch (msg) {
            case 'login':
                mydb.checkAccount(notifyData.uid, notifyData.password, function (err, data) {
                    if(err){
                        socket.emit('notify', {msg:msg, callbackIndex:callbackIndex, data:{err:err}});
                    } else {
                        //账户不存在
                        if(data.length == 0){
                            //创建
                            mydb.insertAccountInfo({
                                uid: notifyData.uid,
                                password: notifyData.password,
                                nickname: notifyData.uid,
                                level: 1, exp: 0, vip: 0, silver: 100000, gold: 100000
                            });
                            //创建玩家
                            PlayerController.createPlayer(socket, {
                                uid: notifyData.uid,
                                nickname: notifyData.uid,
                                callbackIndex: callbackIndex,
                                level: 1, exp: 0, vip: 0, silver: 100000, gold: 100000
                            });
                        } else {
                            let accountData = data[0];
                            //玩家是否已经登陆
                            let player = PlayerController.getPlayer(accountData.uid);
                            if(player){
                                //踢掉
                                console.log('重复登陆，强制踢出');
                                player.forcedDisconnection();
                            }
                            //创建玩家
                            PlayerController.createPlayer(socket, {
                                uid: accountData.uid,
                                nickname: accountData.nickname,
                                callbackIndex: callbackIndex,
                                level: accountData.level, exp: accountData.exp, vip: accountData.vip, silver: accountData.silver, gold: accountData.gold
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