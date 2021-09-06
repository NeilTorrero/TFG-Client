import React, { useEffect, useRef, useState, useMemo } from 'react';
import './App.css';
import socketIOClient from "socket.io-client";
import MicRecorder from 'mic-recorder-to-mp3';

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
  const Mp3Recorder = useMemo(() => new MicRecorder({ bitRate: 128 }), []);
  const session_id = '623a79b5454f433da729d357381fa307';
  const [ messID, setMessID ] = useState(0);
  const messidRef = useRef(messID);
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
  const lastestMessages = useRef(messages);
  const [formValue, setFormValue] = useState('');


  useEffect(() => {
    socketRef.current = socketIOClient(/*"http://localhost:5005"*/ "https://2b10-81-60-169-254.ngrok.io", {query: {session_id},});
    
    /*{
      "attachment": {
        "type": "image",
        "payload": {
          "src": "https://i.imgur.com/nGF1K8f.jpg"
        }
      }
    }*/
    socketRef.current.on('bot_uttered', (message) => {
      let temp = lastestMessages.current;
      let ntemp = messidRef.current;
      setMessID(ntemp+1);
      temp.push({
        sender: "bot",
        text: message.text,
        type: message.attachment != undefined ? message.attachment.type : undefined,
        payload: message.attachment != undefined ? message.attachment.payload.src : undefined,
        id: ntemp
      });
      setMessages([...temp]);

      dummy.current.scrollIntoView({ behavior: 'smooth' });
      const speaker = new SpeechSynthesisUtterance();
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      if ((navigator.userAgent.indexOf("Safari") != -1) || (navigator.userAgent.indexOf("Chrome") != -1)) {
        console.log(voices);
        speaker.voice = voices[33];
      } else {
        speaker.lang = 'en-US';
      }
      speaker.text = message.text;
      speechSynthesis.speak(speaker);
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
    let temp = messages;
    temp.push({
      sender: "user",
      text: formValue,
      id: messID
    });
    setMessages([...temp]);
    let ntemp = messID+1;
    setMessID(ntemp);
    messidRef.current = ntemp;
    lastestMessages.current = messages;
    
    sendMessage(formValue);
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const [ recording, setRecordState ] = useState(false);
  const record = () => {
    if (!recording) {
      Mp3Recorder.start().then(() => {
        setRecordState(true);
      }).catch((e) => console.error(e));
    } else {
      Mp3Recorder.stop().getMp3().then(([buffer, blob]) => {
        const file = new File(buffer, 'recording.mp3', {type: blob.type, lastModified: Date.now()})
        // const player = new Audio(URL.createObjectURL(file));
        // player.play();
        // alternative to huggingface https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
        fetch("https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
          {
            method: "POST",
            headers: { 'Authorization': `Bearer api_AZSUExoImMlclNUttjtTGKtuoGoqJIkEEm` },
            body: file
          }
        ).then(res => res.json()).then(response => {
          setFormValue(response['text'] != undefined ? response['text'].toLowerCase(): "")
          console.log(response)
        });
        setRecordState(false);
      }).catch((e) => console.log(e));
    }
    console.log("Record");
  }

  return (
    <>
    <main>
        <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
        </div>
    </main>
      <form onSubmit={handleMessage}>
        <input name="send" value={formValue} onChange={(e) => setFormValue(e.target.value)}></input>
        <button type="button" onClick={record}>{recording ? "Stop" : "Record"}</button>
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
      {text && <p>{text}</p> || type=='image' && <img className='msg_img' src={payload} />}
    </div>
  </>)
}

export default App;
