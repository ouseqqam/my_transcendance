import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import io from "socket.io-client"
import { useState } from 'react'

const socket = io("http://localhost:3001", {
  query: {
    userId: 2,
  }
})

const Home: NextPage = () => {
  const [msg, setMsg] = useState("")


  const data = {
    roomId: "hcjzjkanzj",
    receiverId: 2,
    type: "chat",
  }

  const banData = {
    conversationId: 1,
    userId: 2,
    status: "blocked",
  }


  const handleClick = () => {
    socket.emit("enviteToRoom", data)
  }

  socket.on("sentInvToReceiver", (msg) => {
    setMsg(msg)
    console.log(msg)
  })

  const handleClick1 = () => {
    socket.emit("banUser", banData)
  }

  socket.on("baneStatus", (msg) => {
    console.log(msg)
  })



  return (
    <div className={styles.container}>
      <button onClick={ handleClick }>Send Message</button><br />
      <button onClick={ handleClick1 }>Ban User</button>
    </div>
  )
}

export default Home
