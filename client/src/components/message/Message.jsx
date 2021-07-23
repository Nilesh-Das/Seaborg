import { format } from "timeago.js";
import './message.css';

export default function Message({message, own}) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  return (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        <img 
          className="messageImg"
          src={
            message.senderProfile
              ? PF + message.senderProfile
              : PF + "person/noAvatar.png"
          } 
          alt="P"
        />
        <p className="messageText">{message.text}</p>
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  )
}