const WebSocket = require('ws')
const ws = new WebSocket('ws://127.0.0.1:3000')
ws.on('open',function(){
  ws.send('client say hello')
  ws.on('message',function(msg){
    console.log(msg)
  })
})