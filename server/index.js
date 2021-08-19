const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });
// const http = require('http')
// const server = http.createServer()
const jwt = require("jsonwebtoken");
const timeInterval = 1000;

let group = {};
// 多聊天室功能
// 对相同的roomid进行广播
wss.on("connection", function connection(ws) {
  ws.isAlive = true; //设置初始状态为true
  // 接收客户端的消息
  ws.on("message", function (msg) {
    const msgObj = JSON.parse(msg);
    if (msgObj.event === "enter") {

      ws.name = msgObj.message;
      ws.roomid = msgObj.roomid;
      if (!group[ws.roomid]) {
        group[ws.roomid] = 1;
      } else {
        group[ws.roomid]++;
      }
    }
    if (msgObj.event === "auth") {
      jwt.verify(msgObj.message, "secret", (err, decode) => {
        if (err) {
          // 鉴权失败
          ws.send(
            JSON.stringify({
              event: "noAuth",
              message: "please auth again",
            })
          );
          return;
        } else {
          // 鉴权成功
          console.log(decode);
          ws.isAuth = true;
          return;
        }
      });
      return;
    }
    if (!ws.isAuth) {
      // 非鉴权的请求
      return;
    }
    // 心跳检测
    if (msgObj.event === "heartbeat" && msgObj.message === "pong") {
      ws.isAlive = true;
      return;
    }
    // ws.send(msg)
    // 广播消息
    wss.clients.forEach((client) => {
      // 判断非自己的客户端 并且有连接的客户端
      // if(ws!==client&&client.readyState===WebSocket.OPEN){
      //   msgObj.num = wss.clients.size
      //   client.send(JSON.stringify(msgObj))
      // }
      if (client.readyState === WebSocket.OPEN && client.roomid === ws.roomid) {
        // 为了获取在线的聊天人数
        msgObj.num = group[ws.roomid];
        msgObj.name = ws.name;
        client.send(JSON.stringify(msgObj));
      }
    });
  });
  // 主动发送消息给客户端
  // ws.send('message from server')

  // 当ws客户端断开
  ws.on("close", function () {
    if (ws.name) {
      group[ws.roomid]--;
    }
    let msgObj = {};
    // 广播消息
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.roomid === ws.roomid) {
        // 为了获取在线的聊天人数
        msgObj.num = group[ws.roomid];
        msgObj.name = ws.name;
        msgObj.event = "out";
        client.send(JSON.stringify(msgObj));
      }
    });
  });
});

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      group[ws.roomid]--;
      return ws.terminate(); //关闭ws链接
    }
    // 主动发送心跳检测请求
    // 当客户端返回了消息后，主动设置flag为在线
    ws.isAlive = false;
    ws.send(
      JSON.stringify({
        event: "heartbeat",
        message: "ping",
        num: group[ws.roomid]
      })
    );
  });
}, timeInterval);
