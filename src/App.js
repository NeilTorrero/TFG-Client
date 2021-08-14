import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import socketIOClient from "socket.io-client";

function App() {
  return (
    <div className="App">
      <header>
        <h1>N.A.T. ChatRoom</h1>
      </header>

      <section>
        {<ChatRoom />}
      </section>
    </div>
  );
}

function ChatRoom() {
  // const roomdID = 'test';

  //const { msgio, sendMsgIO} = useChat(roomdID);
  const DUMMY_DATA = [
    {
      sender: "user",
      text: "who'll win?",
      id: 0
    },
    {
      sender: "bot",
      text: "who'll win?",
      id: 1
    }
  ]
  const dummy = useRef();

  //var messages = DUMMY_DATA;

  var messID = 2;

  const [messages, setMessages] = useState([]);

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e)=> {
    var aux = messages
    e.preventDefault();
    aux = messages.concat({
      sender: "user",
      text: formValue,
      id: messID++
    })
    setMessages(messages.concat({
      sender: "user",
      text: formValue,
      id: messID++
    }));

    fetch('http://localhost:5005/webhooks/rest/webhook',
      {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: "user",
          message: formValue,
        })
      }
    ).then(res => res.json()).then(response => {
      console.log(response)
      for (let index = 0; index < response.length; index++) {
        aux = aux.concat({
          sender: "bot",
          text: response[index].text,
          image: response[index].image,

          id: messID++
        })
        
      }
      setMessages(aux);
    })
    //sendMsgIO(formValue);

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });

  }

  return (
    <>
    <main>
        <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
        </div>
    </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}></input>

        <button type="submit">Send</button>
      </form>
    </>
  )
}



function ChatMessage(props) {
  const {sender, text, image} = props.message;

  const messageClass = 'user' === sender ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img className='avatar' src={'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      {text && <p>{text}</p> || image && <img className='msg_img' src={image} />}
    </div>
  </>)
}

/*
const useChat = (roomID) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient("http://localhost:5005", {query: {roomID},});

    socketRef.current.on('bot_uttered', (message) => {
      const incomingMessage = {
        ...message,
      };
      setMessages((messages) => [...messages, incomingMessage]);
    })
    return () => {
      socketRef.current.disconnect();
    }
  }, [roomID]);

  const sendMsgIO = (messageBody) => {
    socketRef.current.emit('user_uttered', {
      text: messageBody,
    });

  };

  return {messages, sendMsgIO}
};
*/
export default App;
