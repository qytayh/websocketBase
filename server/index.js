const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let num = 0;
wss.on("connection", function connection(ws) {
  // 接收客户端的消息
  ws.on("message", function (msg) {
    const msgObj = JSON.parse(msg);
    if (msgObj.event === "enter") {
      ws.name = msgObj.message;
      num++;
    }
    // ws.send(msg)
    // 广播消息
    wss.clients.forEach((client) => {
      // 判断非自己的客户端 并且有连接的客户端
      // if(ws!==client&&client.readyState===WebSocket.OPEN){
      //   msgObj.num = wss.clients.size
      //   client.send(JSON.stringify(msgObj))
      // }
      if (client.readyState === WebSocket.OPEN) {
        // 为了获取在线的聊天人数
        msgObj.num = num;
        client.send(JSON.stringify(msgObj));
      }
    });
  });
  // 主动发送消息给客户端
  // ws.send('message from server')

  // 当ws客户端断开
  ws.on("close", function () {
    if(ws.name){
      num--;
    }
    let msgObj = {}
    // 广播消息
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // 为了获取在线的聊天人数
        msgObj.num = num;
        msgObj.name = ws.name;
        msgObj.event = 'out'
        client.send(JSON.stringify(msgObj));
      }
    });
  });
});
