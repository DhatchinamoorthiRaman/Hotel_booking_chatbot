import MenuIcon from "../../assets/Icons/MenuIcon";
import "./Navbar.scss";
import { useState, useEffect } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import Person from "../../assets/Icons/Person";
import { userHistory } from "../../atoms/chatHistory.atom.js";
import { Divider, Drawer } from "@mui/material";
import historyService from "../../API/history/index.js";
import { useRecoilState } from "recoil";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { userDetails } from "../../atoms/booking.atom.js";
import { useNavigate } from "react-router-dom";

function Navbar({ getChats }) {
  const nav = useNavigate();
  const [history, setHistory] = useRecoilState(userHistory);
  const [open, setOpen] = useState(false);
  const userID = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userProfile = localStorage.getItem("profile");
  // console.log(user,"USER")
  async function getHistory() {
    const res = await historyService.getUserHistory();
    console.log(res, "historyService");
    setHistory(res.data);
  }

  useEffect(() => {
    getHistory();
    const handleStorageChange = () => {
      console.log("Local storage changed");
      getHistory();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [localStorage.getItem("chatId")]);

  let historyCopy = [...history];
  historyCopy.sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDeleteId = async (id) => {
    const res = await historyService.deleteChatId(id);
    if (res) getHistory();
  };

  const userHistories = historyCopy.map((item) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });

    return (
      <>
        <Divider />
        <div
          className="chats"
          onClick={() => {
            getChats(item.chatId);
            setOpen(false);
          }}
        >
          <div>
            <a key={item.chatId}>{formattedDate}</a>
          </div>
          <div>
            <DeleteForeverIcon
              onClick={() => handleDeleteId(item.chatId)}
              style={{ zIndex: 2, cursor: "pointer" }}
            />
          </div>
        </div>
        <Divider />
      </>
    );
  });
  const handleLogout = () => {
    nav("/login");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("profile");
    localStorage.removeItem("chatId");
  };
  return (
    <>
      <div className="navbar-container">
        <div className="navbar-wrapper">
          <div className="menu-wrapper">
            <div className="dropdown">
              <MenuIcon
                height="25"
                width="25"
                color="white"
                onClick={() => {
                  console.log("first");
                  setOpen(true);
                }}
              />
              <Drawer
                anchor="left"
                open={open}
                onClose={() => {
                  setOpen(false);
                }}
              >
                <div className="history">History</div>
                {userHistories}
              </Drawer>
            </div>
          </div>
          <div className="header-1">Hotel Booking Chatbot</div>
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <div className="header1">
              <img
                src={`${userProfile}`}
                style={{
                  width: "30px",
                  height: "30px",
                  marginTop: "10px",
                  minHeight: "15px",
                  minWidth: "30px",
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
                alt="botimg"
              />
            </div>
            <div className="header-2">{userName}</div>
            <div className="header-3" onClick={() => handleLogout()}>
              <LogoutIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="bottom"></div>
    </>
  );
}

export default Navbar;
