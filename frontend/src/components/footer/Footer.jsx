import { useState, useEffect } from "react";
import "./Footer.scss";
import { parse, format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { useRecoilState } from "recoil";
import { chat } from "../../atoms/chatHistory.atom";
import { booking } from "../../atoms/booking.atom";
function Footer({ handleUserInput, getChats }) {
  const [userMessage, setUserMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [messageType, SetMessageType] = useState(false);
  const [recording, setRecording] = useState(false);
  const [chatHistory, setChatHistory] = useRecoilState(chat);
  const [currentIndex, setCurrentIndex] = useState(chatHistory.length - 1);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.onstart = () => {
    setListening(true);
  };

  recognition.onend = () => {
    setListening(false);
    setRecording(false);
  };

  recognition.onresult = (event) => {
    const userSpeech = event.results[0][0].transcript;
    if (
      /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b|\d{1,2})[\s,-]*(\d{1,2})[\s,-]*(\d{4})/.test(
        userSpeech
      )
    ) {
      const parsedDate = parse(userSpeech, "MMMM dd yyyy", new Date());
      const formattedDate = format(parsedDate, "dd-MM-yyyy");
      setUserMessage(formattedDate);
      SetMessageType(true);
    } else {
      setUserMessage(userSpeech);
      SetMessageType(true);
    }
  };

  const startListening = () => {
    recognition.start();
    setRecording(true);
  };

  const stopListening = () => {
    recognition.stop();
  };

  const sendMessage = () => {
    handleUserInput("userchat", userMessage, new Date());
    setUserMessage("");
    SetMessageType(false);
    setCurrentIndex(chatHistory.length);
  };

  const handleChangeId = () => {
    const id = uuidv4();
    getChats(id);

  };

  const handleKeyUp = (event) => {
    if (event.key === "ArrowUp" && currentIndex > 1) {
      setCurrentIndex((prevIndex) => prevIndex - 2);

      const previousMessage = chatHistory[currentIndex - 2];
      setUserMessage(
        previousMessage?.type === "bot"
          ? ""
          : previousMessage?.message || userMessage
      );
      SetMessageType(previousMessage?.type === "bot" ? false : true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      if (currentIndex < chatHistory.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 2);

        const nextMessage = chatHistory[currentIndex + 2];
        setUserMessage(
          nextMessage.type === "bot" ? "" : nextMessage.message || ""
        );
        SetMessageType(nextMessage.type === "bot" ? false : true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, chatHistory]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, chatHistory]);
  return (
    <div className={`footer-container${recording ? " recording" : ""}`}>
      <div className="footer-wrapper">
        <button className="button" onClick={handleChangeId}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
           fill="white"
          >
            <path d="M12 2C17.5228 2 22 6.47715 22 12C22 12.2628 21.9899 12.5232 21.97 12.7809C21.5319 12.3658 21.0361 12.0111 20.4958 11.73C20.3532 7.16054 16.6041 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 13.4696 3.87277 14.8834 4.57303 16.1375L4.72368 16.4072L3.61096 20.3914L7.59755 19.2792L7.86709 19.4295C9.04305 20.0852 10.3592 20.4531 11.73 20.4958C12.0111 21.0361 12.3658 21.5319 12.7809 21.97C12.5232 21.9899 12.2628 22 12 22C10.3817 22 8.81782 21.6146 7.41286 20.888L3.58704 21.9553C2.92212 22.141 2.23258 21.7525 2.04691 21.0876C1.98546 20.8676 1.98549 20.6349 2.04695 20.4151L3.11461 16.5922C2.38637 15.186 2 13.6203 2 12C2 6.47715 6.47715 2 12 2ZM23 17.5C23 14.4624 20.5376 12 17.5 12C14.4624 12 12 14.4624 12 17.5C12 20.5376 14.4624 23 17.5 23C20.5376 23 23 20.5376 23 17.5ZM18.0006 18L18.0011 20.5035C18.0011 20.7797 17.7773 21.0035 17.5011 21.0035C17.225 21.0035 17.0011 20.7797 17.0011 20.5035L17.0006 18H14.4956C14.2197 18 13.9961 17.7762 13.9961 17.5C13.9961 17.2239 14.2197 17 14.4956 17H17.0005L17 14.4993C17 14.2231 17.2239 13.9993 17.5 13.9993C17.7761 13.9993 18 14.2231 18 14.4993L18.0005 17H20.4966C20.7725 17 20.9961 17.2239 20.9961 17.5C20.9961 17.7762 20.7725 18 20.4966 18H18.0006Z"></path>
          </svg>
        </button>
        <input
          type="email"
          placeholder={recording ? "Listening..." : "Enter the message here"}
          value={userMessage}
          onChange={(e) => {
            setUserMessage(e.target.value);
            if (e.target.value.length > 0) {
              SetMessageType(true);
            } else SetMessageType(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        {messageType ? (
          <button className="button" onClick={sendMessage}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-send"
              viewBox="0 0 16 16"
            >
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
            </svg>
          </button>
        ) : (
          <button className="button" onClick={startListening}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-send"
              viewBox="0 0 24 24"
            >
              <path d="M11.999,14.942c2.001,0,3.531-1.53,3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469,2.35,8.469,4.35v7.061 C8.469,13.412,9.999,14.942,11.999,14.942z M18.237,11.412c0,3.531-2.942,6.002-6.237,6.002s-6.237-2.471-6.237-6.002H3.761 c0,4.001,3.178,7.297,7.061,7.885v3.884h2.354v-3.884c3.884-0.588,7.061-3.884,7.061-7.885L18.237,11.412z"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default Footer;
