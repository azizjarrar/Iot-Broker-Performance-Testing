
const mqtt = require('mqtt')
const host = 'j4f805b0.eu-central-1.emqx.cloud'
const port = '15296'
const connectUrl = `mqtts://${host}:${port}`
const topic = 'testtopic/testPer'
let CountMessageSent=0

let CountMessageRecived=0
//client * 10 * 20 * 5
//20 message fi thenya
let loop = setInterval(() => {
    for(var c = 0; c<10;c++){
        const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
        const client = mqtt.connect(connectUrl, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            username: 'aziz',
            password: 'aziz',
            reconnectPeriod: 1000,
          })
          for(let i = 0 ; i< 20 ;i++){
            CountMessageSent++ 
            PublishData(i,clientId,client,topic)
          }
    }
}, 2000);

setTimeout(() => {
    console.log("finish")
    console.log("succes ratio",(CountMessageRecived/CountMessageSent)*100 + "%")
    console.log("CountMessageRecived :", CountMessageRecived)
    console.log("CountMessageSent :", CountMessageSent)
    clearInterval(loop)
    CountMessageRecived=0
    CountMessageSent=0

}, 10000);

const  PublishData=(count,clientId,client,topic)=>{
    client.publish(topic, `client_id ${clientId} testNumber = ${count}`   , { qos: 0, retain: true }, (error) => {
        if (error) {
          console.error(error)
        }
      })
}
const client = mqtt.connect(connectUrl, {
    clientId:"azizclient",
    clean: true,
    connectTimeout: 4000,
    username: 'aziz',
    password: 'aziz',
    reconnectPeriod: 1000,
  })

client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
client.on('message', (topic, payload) => {
    CountMessageRecived++
    console.log('Received Message:', topic, payload.toString())
})
/*
client.on('connect', () => {
  console.log('Connected To Server')
  client.publish("testtopic/testPer", 'hello world', { qos: 0, retain: true }, (error) => {
    if (error) {
      console.error(error)
    }
  })
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})
client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
})*/