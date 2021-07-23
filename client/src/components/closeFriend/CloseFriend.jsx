import { Link } from 'react-router-dom'
import "./closeFriend.css";

export default function CloseFriend({user}) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  return (
    <Link
      to={"/profile/" + user.username}
      style={{ textDecoration: "none" }}
      key={user._id}
    >
      <div className="sidebarFriend">
        <img 
          className="sidebarFriendImg" 
          src={
            user.profilePicture
              ? PF + user.profilePicture
              : PF + "person/noAvatar.png"
          }
          alt={user.username} 
        />
        <span className="sidebarFriendName">{user.username}</span>
      </div>
    </Link>
  );
}
