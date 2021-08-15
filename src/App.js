import React, { useEffect, useRef, useState } from 'react';
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
  const session_id = '623a79b5454f433da729d357381fa307';
  var [ messID, setMessID ] = useState(0);
  const socketRef = useRef();
  
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
  ];
  const dummy = useRef();
  const [ messages, setMessages ] = useState([]);
  const [formValue, setFormValue] = useState('');


  useEffect(() => {
    socketRef.current = socketIOClient("http://localhost:5005", {query: {session_id},});
    
    /*{
      "attachment": {
        "type": "image",
        "payload": {
          "src": "https://i.imgur.com/nGF1K8f.jpg"
        }
      }
    }*/
    socketRef.current.on('bot_uttered', (message) => {
      console.log('before bot: ');
      console.log(messages);
      let temp = messages;
      temp.push({
        sender: "bot",
        text: message.text,
        type: message.type,
        payload: message.payload,
        id: messID
      });
      setMessages([...temp]);
      /*setMessages(messages.concat({
        sender: "bot",
        text: message.text,
        type: message.type,
        payload: message.payload,
        id: messID
      }));*/
      setMessID(messID++);
      console.log('after bot: ');
      console.log(messages);
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [session_id]);

  const sendMessage = (messageBody) => {   
    socketRef.current.emit(
      'user_uttered', {
        message: messageBody,
        session_id: session_id
      }
    );
  };

  const handleMessage = async(e)=> {
    e.preventDefault();

    /*setMessages(messages.concat({
      sender: "user",
      text: formValue,
      id: messID
    }));*/
    let temp = messages;
    temp.push({
      sender: "user",
      text: formValue,
      id: messID
    });
    setMessages([...temp]);

    /*fetch('http://localhost:5005/webhooks/rest/webhook',
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
    })*/
    console.log('user sends');
    console.log(messages);
    sendMessage(formValue);
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
    <main>
        <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
        </div>
    </main>
      <form onSubmit={handleMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}></input>

        <button type="submit">Send</button>
      </form>
    </>
  )
}



function ChatMessage(props) {
  const {sender, text, type, payload} = props.message;

  const messageClass = 'user' === sender ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img className='avatar' src={'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      {text && <p>{text}</p> || type=='image' && <img className='msg_img' src={payload.src} />}
    </div>
  </>)
}

export default App;