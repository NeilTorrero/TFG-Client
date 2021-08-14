import React, { useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';

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

  const [messages, setMessages] = useState(DUMMY_DATA);

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

export default App;
