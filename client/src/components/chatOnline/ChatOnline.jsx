import { useState, useEffect} from 'react';
import Badge from '@material-ui/core/Badge';
import axios from 'axios'
import "./chatOnline.css";

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat }) {
	const [friends, setFriends] = useState([]);
	const [onlineFriends, setOnlineFriends] = useState([]);
	const PF = process.env.REACT_APP_PUBLIC_FOLDER;

	useEffect(() => {
		const getFriends = async()=> {
      try {
  			const res = await axios.get(`/users/friends/${currentId}`);
  			setFriends(res.data);
      } catch(err) {
        console.log(err);
      }
		};
		getFriends();
	}, [currentId]);

	useEffect(() => {
		setOnlineFriends(friends.filter((f) => onlineUsers.includes(f._id)));
	}, [friends, onlineUsers]);

	const handleClick = async(user) => {
		try {
			const res = await axios.get(
        `/conversations/find/${currentId}/${user._id}`
        );
      setCurrentChat(res.data);
    } catch(err) {
     console.log(err);
   }
 }

 return (
  <div className="chatOnline">
    {onlineFriends.length ? (
      <div className="chatOnlineWrapper">
      <span>Online users</span>
      {onlineFriends.map((o) => (
        <div key={o._id} className="chatOnlineFriend" onClick={()=>handleClick(o)}>
          <div className="chatImgContainer">
            <Badge 
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              color="primary"
              overlap="circle" 
              variant="dot"
              >
              <img 
              className="chatOnlineImg" 
              src={o? PF+o.profilePicture : PF+"person/noAvatar.png"} 
              alt="Profile"
              />
            </Badge>
          </div>
          <span className="chatOnlineName">{o?.username}</span>
        </div>
      ))}
      </div>
    ) : (
      <span>No online users</span>
    )}
  </div>
  )
}