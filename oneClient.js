
const { Worker, isMainThread } = require('worker_threads');
const mqtt = require('mqtt')

const genereId=()=>{
    return `mqtt_${Math.random().toString(16).slice(3)}`
  }
  /**********************************/
  /*********publish data*********/
  /**********************************/
   const  PublishData=(string,clientId,client,topic,quality)=>{
    let currentTime=Date.now()
    client.publish(topic, `client_id ${clientId} String = ${string} currentTimeOfSendingData=${currentTime}`   , { qos: quality,retain: true }, (error) => {
      if (error) {
          console.error(error)
        }
      })
    }
  /**********************************/
  /*********client Connexion*********/
  /**********************************/
  const clientConnexion=(clientId,pushblishCount,string,topics,connectUrl,quality,username,password)=>{
    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        username: username,
        password: password,
        reconnectPeriod: 1000,
      })
      for(let i = 0 ; i< pushblishCount ;i++){
        for(let t = 0; t < topics.length;t++){
          PublishData(string,clientId,client,topics[t],quality)
        }
      }
  }


function thread(numberOfPublishForTopic,stringLength,topics,connectUrl,quality,username,password){
        if (isMainThread) {
            console.log('Inside Main Thread!');
           var worker =  new Worker(__filename,{fn:clientConnexion(genereId(),numberOfPublishForTopic,stringLength,topics,connectUrl,quality,username,password)});
           worker.on('message',(res=>{
               console.log(res)
           }))
        } else {
            console.log('Inside Worker Thread!');
            console.log(fn);  // Prints 'false'.
        }
}


module.exports = thread