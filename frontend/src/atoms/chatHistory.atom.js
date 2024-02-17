import { atom } from "recoil";

const chat = atom({
  key: "chatHistory",
  default: [],
});

const userHistory = atom({
  key: "userHistory",
  default: [],
});


export { chat, userHistory };
