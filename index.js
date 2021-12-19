

const http = require('http')
const app = require('./app')
const port = process.env.Port || 5010
const server = http.createServer(app)
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});
io.on("connection", (socket) => {
    console.log("client is connect socketid : ",socket.id)
    socket.on('disconnect', function () {
      console.log("disconnect")
    });
});

function getSocketIo(){
  return io;
}
server.listen(port,()=>{console.log(" server online")})

module.exports.getSocketIo=getSocketIo

