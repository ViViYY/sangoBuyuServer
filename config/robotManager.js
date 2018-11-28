

let _robotCount = 0;
let _robotList = [];
let _robotTakeOut = {};
const logPrint = false;

//初始化机器人
exports.initRobot = function (robotData) {
    for(let index in robotData){
        let _robot = robotData[index];
        _robotList[_robot.id] = _robot;
        _robotCount++;
    }
    console.log('[RobotManager]: robot count: ' + _robotCount);
};
// 拿走机器人
exports.takeRobot = function (rid) {
    const robot = _robotList[rid];
    if(!robot){
        console.warn('[robotManager:takeRobot]机器人不存在, rid = ' + rid);
        return null;
    }
    if(_robotTakeOut[rid]){
        console.warn('[robotManager:takeRobot]机器人已被拿走, rid = ' + rid);
        return null;
    }
    if(logPrint) console.log('[RobotManager]取走机器人:' + robot.id + '-' + robot.nickname);
    _robotTakeOut[rid] = true;
    return robot;
};
// 归还机器人
exports.returnRobot = function (rid) {
    const robot = _robotList[rid];
    if(!robot){
        console.warn('[robotManager:returnRobot]机器人不存在 = ' + robot.id + '-' + robot.nickname);
        return;
    }
    if(!_robotTakeOut[rid]){
        console.warn('[robotManager:takeRobot]机器人没有被拿走 = ' + robot.id + '-' + robot.nickname);
        return;
    }
    if(logPrint) console.log('[RobotManager]归还机器人:' + robot.id + '-' + robot.nickname);
    _robotTakeOut[rid] = false;
    console.log('现有可用机器人：' + this.getNumberOfIdle());
};
//机器人是否闲置状态
exports.isRobotIdle = function (rid) {
    if(!_robotTakeOut[rid]){
        return true;
    }
    if(!_robotTakeOut[rid]){
        return true;
    }
    return false;
};
// 随机获取闲置机器人id
exports.getRobotIdByRandom = function () {
    let copyList = _robotList.slice(0);

    while(copyList.length > 1){
        let rand = 1 + Math.floor(Math.random() * (copyList.length - 1));
        if(_robotTakeOut[rand]){
            copyList.splice(rand, 1);
            continue;
        }
        copyList.length = 0;
        return rand;
    }
    copyList.length = 0;
    return -1;
};
//获取可用机器人个数
exports.getNumberOfIdle = function () {
    let count = 0;
    for(let i = 0; i < _robotList.length; i++){
        const robot = _robotList[i];
        if(robot && !_robotTakeOut[robot.id]){
            count++;
        }
    }
    return count;
};