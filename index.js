
const mqtt = require('mqtt')
const host = 'j4f805b0.eu-central-1.emqx.cloud'
const port = '15296'
const connectUrl = `mqtts://${host}:${port}`

let CountMessageSent=0//count messeges thats users has sent
let CountMessageRecived=0// count recived messages
let LeastAndMostTime=[];//countain all packets time to recive data
let LeastAndMostTimeString=[];// container all payloads
var sendDataEveryS // setInterval Function run every 1s
let topic="testtopic/testPer"
/******************************************************/
/********generate unique id for each user**************/
/******************************************************/
const genereId=()=>{
    return `mqtt_${Math.random().toString(16).slice(3)}`
}
/****************************************/
/********send data to topic**************/
/****************************************/
const  PublishData=(string,clientId,client,topic)=>{
  let currentTime=Date.now()
  client.publish(topic, `client_id ${clientId} String = ${string} currentTimeOfSendingData=${currentTime}`   , { qos: 0, retain: true }, (error) => {
    if (error) {
        console.error(error)
      }
    })
}
/************************************************************/
/********each client connexion data with publish n times*****/
/************************************************************/
const clientConnexion=(clientId,pushblishCount,string,topic)=>{
    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        username: 'aziz',
        password: 'aziz',
        reconnectPeriod: 1000,
      })
    client.on("error",(error)=>{ console.log("Can't connect"+error)});
      for(let i = 0 ; i< pushblishCount ;i++){
        CountMessageSent++ 
        PublishData(string,clientId,client,topic)
      }

}
const performanceTest=(repteTime,finishTime,stringLnength,clientNumber,testTimeForEachClient)=>{
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
    client.subscribe([topic], () => {
      console.log(`Subscribe to topic '${topic}'`)
      sendDataEveryS =  setInterval(()=>{
        const stringLength ="a".repeat(stringLnength)
        for(let i = 0 ; i < clientNumber;i++){
          clientConnexion(genereId(),testTimeForEachClient,stringLength,topic)
        }
      },repteTime)
    })
   /************************************/
    /*********reciving messages*********/
    /***********************************/
    client.on('message', (topic, payload) => {
        let RecivedTime=Date.now()
        var stringBuf = payload.toString('utf-8');
        CountMessageRecived++  
        LeastAndMostTime.push(RecivedTime - parseInt(stringBuf.substr(-13)))
        LeastAndMostTimeString.push(stringBuf)
        //console.log('Received Message:',stringBuf,"topic Name :",topic , " RecivedTime : "  +RecivedTime  + " time to recive =" + (RecivedTime - parseInt(stringBuf.substr(-13)))+"ms")
        console.log(stringBuf.slice(0,27),"topic Name :",topic , " RecivedTime : "  +RecivedTime  + " time to recive =" + (RecivedTime - parseInt(stringBuf.substr(-13)))+"ms")
      })
    /**************************************************************/
    /*********stop sending and calculate response Time*************/
    /**************************************************************/
  setTimeout(() => {
    console.log("finish")
    console.log("succes ratio",((CountMessageRecived-1)/CountMessageSent)*100 + "%")
    console.log("CountMessageRecived :", CountMessageRecived-1)
    console.log("CountMessageSent :", CountMessageSent)
    var min = Math.min(...LeastAndMostTime.slice(1,-1));
    var max = Math.max(...LeastAndMostTime.slice(1,-1));
    console.log("min Time: " + min ,"s", "max Time:" + max,"s")
    console.log("recived messages in :"+finishTime/1000+"s")
    CountMessageRecived=0
    CountMessageSent=0
    clearInterval(sendDataEveryS)
}, finishTime);
}



("repteTime","finishTime","stringLnength","clientNumber","testTimeForEachClient")
performanceTest(1000,5900,100,5,2)
