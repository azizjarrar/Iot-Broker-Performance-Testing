
const mqtt = require('mqtt')
let CountMessageSent=0//count messeges thats users has sent
let CountMessageRecived=0// count recived messages
let LeastAndMostTime=[];//countain all packets time to recive data
let LeastAndMostTimeString=[];// container all payloads
var sendDataEveryS // setInterval Function run every 1s
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

/******************************************************/
/********generate unique id for each user**************/
/******************************************************/
const genereId=()=>{
    return `mqtt_${Math.random().toString(16).slice(3)}`
}
/****************************************/
/********send data to topic**************/
/****************************************/
const  PublishData=(string,clientId,client,topic,quality)=>{
  CountMessageSent++ 
  let currentTime=Date.now()
  client.publish(topic, `client_id ${clientId} String = ${string} currentTimeOfSendingData=${currentTime}`   , { qos: quality,retain: true }, (error) => {
    if (error) {
        console.error(error)
      }
    })
}
/************************************************************/
/********each client connexion data with publish n times*****/
/************************************************************/
const clientConnexion=(clientId,pushblishCount,string,topics,connectUrl,quality)=>{

    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        username: 'aziz',
        password: 'aziz',
        reconnectPeriod: 1000,
      })

    client.on("error",(error)=>{ console.log(error)});
      for(let i = 0 ; i< pushblishCount ;i++){
        for(let t = 0; t < topics.length;t++){
          PublishData(string,clientId,client,topics[t],quality)
        }
      }
}
let performanceTest=(repteTime,finishTime,stringLnength,clientNumber,testTimeForEachClient,topics,subscribeName,host,port,quality)=>{
   connectUrl = `${host}:${port}`
    /**********************************/
    /*********global connexion*********/
    /**********************************/
    const client = mqtt.connect(connectUrl, {
      clientId:genereId(),
      clean: true,
      connectTimeout: 4000,
      username: 'aziz',
      password: 'aziz',
      reconnectPeriod: 1000,
    })
    if(subscribeName!=undefined){
      client.subscribe([...subscribeName],{rh :true}, () => { 
        console.log(`Subscribe to topic '${subscribeName}'`)
      })
    }

      sendDataEveryS =  setInterval(()=>{
        const stringLength ="a".repeat(stringLnength)
        for(let i = 0 ; i < clientNumber;i++){
          clientConnexion(genereId(),testTimeForEachClient,stringLength,topics,connectUrl,quality)
        }
      },repteTime)
     
   
   /************************************/
    /*********reciving messages*********/
    /***********************************/
    client.on('message', (topic, payload,packet) => {
      if(packet.retain!=true){
        let RecivedTime=Date.now()
        var stringBuf = payload.toString('utf-8');
        CountMessageRecived++  
        LeastAndMostTime.push(RecivedTime - parseInt(stringBuf.substr(-13)))
        LeastAndMostTimeString.push(stringBuf)
        //console.log('Received Message:',stringBuf,"topic Name :",topic , " RecivedTime : "  +RecivedTime  + " time to recive =" + (RecivedTime - parseInt(stringBuf.substr(-13)))+"ms")
        console.log(stringBuf.slice(0,27),"topic Name :",topic ,   " time to recive =" + (RecivedTime - parseInt(stringBuf.substr(-13)))+"ms")
        }
      })
    /**************************************************************/
    /*********stop sending and calculate response Time*************/
    /**************************************************************/
  setTimeout(() => {
    console.log("finish")
    console.log("succes ratio",((CountMessageRecived)/CountMessageSent)*100 + "%")
    console.log("CountMessageRecived :", CountMessageRecived)
    console.log("CountMessageSent :", CountMessageSent)
    console.log(LeastAndMostTime)
    var min = Math.min(...LeastAndMostTime);
    var max = Math.max(...LeastAndMostTime);
    console.log("min Time: " + min ,"s", "max Time:" + max,"s")
    console.log("recived messages in :"+finishTime/1000+"s")
    CountMessageRecived=0
    CountMessageSent=0
    clearInterval(sendDataEveryS)
    readline.close()

}, finishTime);
}



("repteTime","finishTime","stringSize","clientNumber","number of publish for topic","topics []","subscribeName []","host","port","quality")


//limit packet size 1mo i cant send more then 1023999char
// can send 1023999
//mqtt://broker.emqx.io:1883
//"mqtts://j4f805b0.eu-central-1.emqx.cloud","15296"

readline.question(`repteTime  each ms ? :`, repteTime => {
  readline.question(`finishTime  with ms ? :`, finishTime => {
    readline.question(`stringSize ? :`, stringSize => {
      readline.question(`clientNumber ? :`, clientNumber => {
        readline.question(`number of publish for  each topic ? :`, numberofpublishfortopic => {
          readline.question(`topics number ?`, topicsNumber => {
            var topics = [];
            for (var i = 1; i <= topicsNumber; i++) {
              topics.push("topic"+i);
            }
              readline.question(`qualityofservice : `, qualityofservice => {
                performanceTest(repteTime,finishTime,stringSize,clientNumber,numberofpublishfortopic,topics,topics,"mqtts://j4f805b0.eu-central-1.emqx.cloud","15296",qualityofservice-0)
              })
          })
        })
      })
    })
  })
})
/*
var topics = [];
var topicsNumber=10
for (var i = 1; i <= topicsNumber; i++) {
  topics.push("topic"+i);
}
performanceTest(1000,1900,10,2,1,topics,topics,"mqtts://j4f805b0.eu-central-1.emqx.cloud","15296",1)
*/