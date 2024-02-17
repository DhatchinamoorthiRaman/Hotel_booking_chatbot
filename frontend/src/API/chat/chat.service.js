import axios from "axios";
import { CHAT_API } from "../../Constants";

class ChatService {
  apiPath = CHAT_API;
  async getChatResponse(question) {
    try {
      const response = await axios.post(`${this.apiPath}/chat`, {
        question: question,
      });
      return response.data;
    } catch (e) {
      console.error(e.message || "Something went wrong");
    }
  }
}

export default ChatService;
