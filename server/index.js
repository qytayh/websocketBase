const WebSocket = require('ws')
const wss = new WebSocket.Server({port:3000})

wss.on('connection',function connection(ws){
  // 接收客户端的消息
  ws.on('message',function(msg){
    // ws.send(msg)
    // 广播消息
    wss.clients.forEach((client)=>{
      // 判断非自己的客户端 并且有连接的客户端
      if(ws!==client&&client.readyState===WebSocket.OPEN){
        client.send(msg.toString())
      }
    })
  })
  // 主动发送消息给客户端
  // ws.send('message from server')
})