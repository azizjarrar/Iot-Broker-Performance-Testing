const express = require('express')
const cors =require('cors')
const app = express()
const oneClient= require('./oneClient')
var whitelist = ['http://127.0.0.1:5010/']
const index = require('./index.js');
var corsOptions = {
  credentials: true, 
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  }
}
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.post("/starttest",(req,res)=>{
  try{
  const io=index.getSocketIo()
  const mqtt = require('mqtt')
 /******************************************************/
/***************************sleep**********************/
/******************************************************/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
/******************************************************/
/********generate unique id for each user**************/
/******************************************************/
const genereId=()=>{
  return `mqtt_${Math.random().toString(16).slice(3)}`
}

let  performanceTest= async (repeatNumber,timebetweenEachTry,stringLnength,clientNumber,numberOfPublishForTopic,topics,subscribeName,host,port,quality,username,password)=>{


 connectUrl = `${host}:${port}`



  /**********************************/
  /*********global connexion*********/
  /**********************************/
  const client = mqtt.connect(connectUrl, {
    clientId:genereId(),
    clean: true,
    connectTimeout: 4000,
    username: username,
    password: password,
    reconnectPeriod: 1000,
  })
  /*fi error return error messages to front end */
  client.on("error",(error)=>{
    res.status(res.statusCode).json({
      message: error.message,
      error:true
    });
    client.end()
  });
  if(subscribeName!=undefined){
    
    client.subscribe([...subscribeName],{rh :true}, () => { 
     console.log(`Subscribe to topic '${subscribeName}'`)
    })
  }

  let  totalNumberOfPublishes= numberOfPublishForTopic * clientNumber * topics.length;//how many message we will send
  let dataToSendEachTwentyPublish=[]//if  publishes are more then 50 i will send them packs by 50  this array wil contain them
  let LeastAndMostTime=[];//countain all packets time to recive data

   /************************************/
  /*********reciving messages*********/
  /***********************************/
  client.on('message', (topic, payload,packet) => {
    if(packet.retain!=true){
      let RecivedTime=Date.now()
      var stringBuf = payload.toString('utf-8');//convert payload to string
      LeastAndMostTime.push(RecivedTime - parseInt(stringBuf.substr(-13)))//push delay time to array
      //if there is more then 50 publish i send them by pack of 50 else i send them one by one
      if(totalNumberOfPublishes<50){
        io.to(req.body.socketId).emit("packetRecived",{clinetid:stringBuf.slice(0,27),topicName:topic,timetorecive:(RecivedTime - parseInt(stringBuf.substr(-13)))})  
      }else{
        if(dataToSendEachTwentyPublish.length!=0&&dataToSendEachTwentyPublish.length%50==0){
          io.to(req.body.socketId).emit("packetRecived",[...dataToSendEachTwentyPublish,{clinetid:stringBuf.slice(0,27),topicName:topic,timetorecive:(RecivedTime - parseInt(stringBuf.substr(-13)))}])  
          dataToSendEachTwentyPublish=[]
        }else{
          dataToSendEachTwentyPublish.push({clinetid:stringBuf.slice(0,27),topicName:topic,timetorecive:(RecivedTime - parseInt(stringBuf.substr(-13)))})
        }
      }
    }
    })
    //how many time i will repeat this action
    for(let r=0; r< repeatNumber;r++){
      const stringLength ="a".repeat(stringLnength)
        //how many client will make this actions
      for(let i = 0 ; i < clientNumber;i++){
        oneClient(numberOfPublishForTopic,stringLength,topics,connectUrl,quality,username,password)
      }
      //wait time between every action
      await sleep(timebetweenEachTry);
    }
    if(dataToSendEachTwentyPublish.length!=0){
      io.to(req.body.socketId).emit("packetRecived",dataToSendEachTwentyPublish)  
      dataToSendEachTwentyPublish=[]
    }
    console.log("finish")
   // console.log(LeastAndMostTime)
    var min = Math.min(...LeastAndMostTime);
    var max = Math.max(...LeastAndMostTime);
    const sum = LeastAndMostTime.reduce((a, b) => a + b, 0);
    const avg = (sum / LeastAndMostTime.length) || 0;

    console.log("min Time: " + min ,"s", "max Time:" + max,"s")
    CountMessageRecived=0
    CountMessageSent=0
    res.status(res.statusCode).json({
      CountRecivedMessages: `${timebetweenEachTry*repeatNumber+timebetweenEachTry} Ms is ${CountMessageSent}`,
      CountMsgNotDelivredinTime: ` ${timebetweenEachTry*repeatNumber+timebetweenEachTry} Ms is ${CountMessageSent-CountMessageRecived}`,
      moyene:Math.round(avg * 100) / 100 + "Ms",
      

      error:false
    });

    client.end()

 



}





//limit packet size 1mo i cant send more then 1023999char
// can send 1023999
//mqtt://broker.emqx.io:1883
//"mqtts://j4f805b0.eu-central-1.emqx.cloud","15296"

const {hosturl,port,repeatNumber,timebetweenEachTry,stringSize,clientNumber,numberOfPublishForTopic,topicsNumber,ofs,username,password}=req.body
var topics = [];
for (var i = 1; i <= topicsNumber; i++) {
topics.push("topic"+i);
}
performanceTest(repeatNumber,timebetweenEachTry,stringSize,clientNumber,numberOfPublishForTopic,topics,topics,hosturl,port,ofs-0,username,password)
}catch(error){
  res.status(res.statusCode).json({
    message: error.message,
    error:true
  });
}
})

module.exports = app
