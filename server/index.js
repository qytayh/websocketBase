const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let num = 0;
let group ={}
// 多聊天室功能
// 对相同的roomid进行广播
wss.on("connection", function connection(ws) {
  // 接收客户端的消息
  ws.on("message", function (msg) {
    const msgObj = JSON.parse(msg);
    if (msgObj.event === "enter") {
      ws.name = msgObj.message;
      ws.roomid = msgObj.roomid;
      num++;
      if(typeof group[ws.roomid] === undefined){
        group[ws.roomid]=1
      }else{
        group[ws.roomid]++
      }
    }
    // ws.send(msg)
    // 广播消息
    wss.clients.forEach((client) => {
      // 判断非自己的客户端 并且有连接的客户端
      // if(ws!==client&&client.readyState===WebSocket.OPEN){
      //   msgObj.num = wss.clients.size
      //   client.send(JSON.stringify(msgObj))
      // }
      if (client.readyState === WebSocket.OPEN&& client.roomid ===ws.roomid) {
        // 为了获取在线的聊天人数
        msgObj.num = group[ws.roomid];
        msgObj.name = ws.name
        client.send(JSON.stringify(msgObj));
      }
    });
  });
  // 主动发送消息给客户端
  // ws.send('message from server')

  // 当ws客户端断开
  ws.on("close", function () {
    if(ws.name){
      group[ws.roomid]--;
    }
    let msgObj = {}
    // 广播消息
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN&& client.roomid ===ws.roomid) {
        // 为了获取在线的聊天人数
        msgObj.num = group[ws.roomid];
        msgObj.name = ws.name;
        msgObj.event = 'out'
        client.send(JSON.stringify(msgObj));
      }
    });
  });
});
