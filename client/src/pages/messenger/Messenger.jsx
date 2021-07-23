import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import Topbar from "../../components/topbar/Topbar";
import Conversation from "../../components/conversation/Conversation";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import Message from "../../components/message/Message";
import { AuthContext } from "../../context/AuthContext";
import io from 'socket.io-client';
import './messenger.css';


export default function Messenger() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversation] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    socket.current = io("ws://seaborg-api.herokuapp.com");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        senderProfile: data.senderProfile,//
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.followings.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user]);

  useEffect(() => {
    const getConversations = async()=> {
      try {
        const res = await axios.get(`/conversations/${user._id}`);
        setConversation(res.data);
      } catch(err) {
        console.log(err);
      }
    }
    getConversations();
  }, [user._id])

  useEffect(() => {
    const getMessages = async()=> {
      try {
        const res = await axios.get(`/messages/${currentChat?._id}`);
        setMessages(res.data);
      } catch(err) {
        console.log(err);
      }
    }
    getMessages();
  }, [currentChat])

  const handleSubmit = async(e)=> {
    e.preventDefault();

    const message = {
      senderProfile: user.profilePicture,//
      conversationId: currentChat._id,
      senderId: user._id,
      text: newMessage,
    }

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderProfile: user.profilePicture,//
      senderId: user._id,
      receiverId,
      text: newMessage,
    });
    
    try {
      const res = await axios.post("/messages/", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
    <Topbar />
    <div className="messenger">
      <div className="chatMenu">
        <div className="chatMenuWrapper">
          <input placeholder="Search for friends" className="chatMenuInput" />
          {conversations.map((c) => (
            <div key={c._id} onClick={() => setCurrentChat(c)}>
              <Conversation conversation={c} currentUser={user} />
            </div>
          ))}
        </div>
      </div>
      <div className="chatBox">
        <div className="chatBoxWrapper">
          {messages.length ? (
              <div className="chatBoxTop">
                {messages.map((m, index) => (
                  <div key={index} ref={scrollRef}>
                    <Message message={m} own={m.senderId === user._id} />
                  </div>
                ))}
              </div>
            ) : (
              <span className="noConversationText">Open conversation to start chat.</span>
            )
          }
          <div className="chatBoxBottom">
            <textarea 
              className="chatMessageInput" 
              placeholder="Write your message.."
              onChange={e=> setNewMessage(e.target.value)}
              value={newMessage}
            ></textarea>
            <button 
              className="chatSendButton"
              onClick={handleSubmit}
            >Send</button>
          </div>
        </div>
      </div>
      <div className="chatOnline">
        <div className="chatOnlineWrapper">
          <ChatOnline
            onlineUsers={onlineUsers}
            currentId={user._id}
            setCurrentChat={setCurrentChat}
          />
        </div>
      </div>
    </div>
    </>
  )
}