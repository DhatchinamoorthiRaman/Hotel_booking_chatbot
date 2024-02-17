import { atom } from "recoil";

const chatId = atom({
  key: "chatHistory",
  default: [],
});



export {chatId};
