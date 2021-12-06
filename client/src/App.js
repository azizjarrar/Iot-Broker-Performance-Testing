
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { makeStyles } from "@material-ui/core/styles";
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import io from 'socket.io-client';
import axios from 'axios'
import {ip} from './consts'
const useStyles = makeStyles(theme => ({
  centerelementHorizontal: {
    minWidth: 700,
    display: 'flex',
    left:"50%",
    position:"relative",
    transform:"translateX(-50%)"
  },
  form:{
    width:"100%",
    padding:"20px !important",
    display:"flex !important",
    flexDirection:"row !important",
    flexWrap: "wrap",
    gap:"30px",
    alignItems:"center !important",
    justifyContent:"center !impoortant"
  },
  input:{
    width:"30%"
  },
  btn:{
    width:"90%",
    left:"50%",
    transform:"translateX(-50%)",
    background: "var(--darkPrimary) !important"
  }
}))
function App() {
  const classes = useStyles()
  const [state,setState]=React.useState({username:"aziz",password:"aziz",repeatNumber:2,timebetweenEachTry:4000,clientNumber:5,numberOfPublishForTopic:1,topicsNumber:1,ofs:0,port:"15296",hosturl:"mqtts://j4f805b0.eu-central-1.emqx.cloud"})
  const socket=React.useRef(null)
  const [packets,setPakets]=React.useState([])//all packets
  const [result,setResult]=React.useState([])//result of api
  const AppRef=React.useRef(null)//we use this ref to point always to bottom of page when loading new packets
  const [btnState,setbtnState]=React.useState(false)
  const [count,setCounter]=React.useState(0)//count how many messages are recived
  /*********************************/
  /*this fb handle reciveng packets*/
  /*********************************/
  const recivePackets=(data)=>{
  /*************************************/
  /*test if reciveng data array if it is*/
  /*
   * i will added to the exsisting array
   * else
   * i will add packets one by one
   */
  /*************************************/
    if(Array.isArray(data)){
      setCounter(e=>e+data.length)
      setPakets(old=>{
        if(old.length>1000){
          return []
        }else{
          return [...old,...data]
        }
      })
      AppRef.current.scrollTop =AppRef.current.scrollHeight
    }else{
      setPakets(old=>{
        setCounter(e=>e+1)
        if(old.length>1000){
          return []
        }else{
          return [...old,data]
        }
      })
      AppRef.current.scrollTop =AppRef.current.scrollHeight
    }

  }
  React.useEffect(()=>{
    socket.current =io(ip);//connect to socket
    socket.current.on("packetRecived",recivePackets)
    setPakets([])
    return () => {
      socket.current.off('getMessageFromUserToUser', recivePackets);
    }
  },[])

/*
*form handler
*/
  const inputChangeHandler=(event)=>{
   const {name,value}=event.target
   setState(oldData=>{
     return {...oldData,[name]:value}
    })
  }
  //start testing
  const startTesting=()=>{
    setbtnState(true)
    setPakets([])
    setCounter(0)
    axios.post(ip+"/starttest",{...state,socketId:socket.current.id}).then(data=>{
      if(data.data.error){
        alert(data.data.message)
        setbtnState(false)
      }else{
        setResult(data.data)
        setbtnState(false)
      }
    })
  }
  return (
    <div ref={AppRef} className="App">
    <Box   sx={{ flexGrow: 1 }}>
      <AppBar style={{ background: '#191b34' }} position="static">
        <Toolbar  variant="dense">
          <Typography variant="h6" color="inherit" component="div">
          Test Performance Broker
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
      <Box  className={classes.centerelementHorizontal}  sx={{borderRadius:"10px",marginTop:"30px",background:"white" ,width:"60%",flexGrow: 1 }}>
      
      <FormControl  className={classes.form} >
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"hosturl"} defaultValue={"mqtts://j4f805b0.eu-central-1.emqx.cloud"} sx={{width:"70%"}} id="outlined-search" label="url" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"port"} defaultValue={"15296"} sx={{width:"25%"}} id="outlined-search" label="port" type="text" />
          <TextField   onChange={inputChangeHandler} sx={{width:"48%"}} className={classes.input} name={"username"} id="outlined-search" defaultValue={"aziz"} label="username" type="text" />
          <TextField   onChange={inputChangeHandler} sx={{width:"48%"}} className={classes.input} name={"password"} id="outlined-search" defaultValue={"aziz"} label="password" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"repeatNumber"} id="outlined-search" defaultValue={2} label="repeatNumber" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"timebetweenEachTry"} id="outlined-search" defaultValue={4000} label="timebetweenEachTry With Ms" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"clientNumber"} id="outlined-search" defaultValue={5} label="client Numbers" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"numberOfPublishForTopic"} id="outlined-search" defaultValue={1} label="Number Of Publish For Each Topic" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"topicsNumber"} id="outlined-search" defaultValue={1} label="Topics Number" type="search" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"ofs"} id="outlined-search" defaultValue={0} label="Quality of service" type="text" />
          <TextField   onChange={inputChangeHandler} className={classes.input} name={"stringSize"} id="outlined-search" defaultValue={0} label="string Size" type="text" />
          <Button disabled={btnState} onClick={startTesting} variant="contained" className={classes.btn}>start</Button>

      </FormControl>

      </Box>
      <Box  className={classes.centerelementHorizontal}  sx={{padding:"15px",borderRadius:"10px",marginTop:"30px",background:"white" ,width:"60%",gap:"20px",display:"flex",flexDirection:"column",flexGrow: 1 }}>
        <Typography variant="h3" sx={{fontSize:"20px",width:"90% !important" }}>average {result.moyene}</Typography>
        </Box>
      <Box   sx={{ flexGrow: 1 }}>

    </Box>
      <Box  className={classes.centerelementHorizontal}  sx={{borderRadius:"10px",marginTop:"30px",background:"white" ,width:"60%",flexGrow: 1 }}>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Client Id</TableCell>
            <TableCell align="right">test Number</TableCell>
            <TableCell align="right">timetorecive</TableCell>
            <TableCell align="right">topicName</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {packets.map((row,index) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell align="right">{row.clinetid}</TableCell>
              <TableCell align="right">{index}</TableCell>
              <TableCell align="right">{row.timetorecive} {"Ms"}</TableCell>
              <TableCell align="right">{row.topicName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
      </Box>
      <Box  className={classes.centerelementHorizontal}  sx={{padding:"15px",borderRadius:"10px",marginTop:"30px",background:"white" ,width:"60%",gap:"20px",display:"flex",flexDirection:"column",flexGrow: 1 }}>
        <Typography variant="h3" sx={{fontSize:"20px",width:"90% !important" }}>messages Recived Count : {count}</Typography>
      </Box>
    </div>
  );
}

export default App;
