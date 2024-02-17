import { useState } from "react";
import "./ChatBubble.style.scss";
import { Button } from "@mui/material";
import { format } from "date-fns";
import { userDetails } from "../../atoms/booking.atom";
import { useRecoilState } from "recoil";
export default function ChatBubble({ time, chatData }) {
  const [disableInputs, setDisableInputs] = useState(chatData.disable || false);
  const [user, setUser] = useRecoilState(userDetails);
  const userProfile=localStorage.getItem("profile");  
  const formattedTime = format(new Date(time), "h:mm a");

  return (
    <div>
      <div style={{ display: "flex", float: "right" }}>
        <div>
          {chatData.input && chatData.input === "yn" ? (
            <div className="chat-bubble">
              <div className="yesno-container">
                <Button
                  size="small"
                  disabled={disableInputs}
                  variant="outlined"
                  onClick={() => {
                    setDisableInputs(true);
                    chatData.onYes();
                  }}
                >
                  Yes
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={disableInputs}
                  onClick={() => {
                    setDisableInputs(true);
                    chatData.onNo();
                  }}
                >
                  No
                </Button>
              </div>
            </div>
          ) : chatData.input && chatData.input === "loc" ? (
            <div className="chat-bubble">
              <div className="yesno-container">
                <Button
                  size="small"
                  disabled={disableInputs}
                  variant="outlined"
                  onClick={() => {
                    setDisableInputs(true);
                    chatData.onCbe();
                  }}
                >
                  Coimbatore
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={disableInputs}
                  onClick={() => {
                    setDisableInputs(true);
                    chatData.onChe();
                  }}
                >
                  Chennai
                </Button>
              </div>
            </div>
          ) : (
            <div className="chat-bubble">
              <div className="userBubble">
                {chatData.message}
                <div className="user-time">{formattedTime}</div>
              </div>
            </div>
          )}
        </div>

        <div>
          <img
            src={`${userProfile}? ${userProfile}: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsEC-AcpMSEBeqwQdUVhjb5fciR-GG2-cuwQ&usqp=CAU"`}
            style={{
              width: "30px",
              height: "30px",
              marginTop: "18px",
              minHeight: "15px",
              minWidth: "30px",
              marginRight: "10px",
              borderRadius: "50%",
            }}
            alt="botimg"
          />
        </div>
      </div>
    </div>
  );
}
