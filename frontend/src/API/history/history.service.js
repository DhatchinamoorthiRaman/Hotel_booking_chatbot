import axios from "axios";
// import { BACKEND_API } from "../../Constants";
import { SEARCH_API } from "../../Constants";

class UserService {
  async getUserHistory() {
    try {
      const response = await axios.get(`${SEARCH_API}/get/chatCollection`, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      //   console.log(response);
      return response.data;
    } catch (err) {
      console.error(err);
    }
  }
  async setChatHistory(data) {
    try {
      const chatId = localStorage.getItem("chatId");
      const { id, tag, input, suggestion, type, time, message, ...restObj } =
        data;
      console.log(id, data.message, "CHAT");
      if (input)
        data = {
          id,
          chatId,
          type,
          message: "yes/no",
          time,
        };
      else
        data = {
          id,
          chatId,
          type,
          message,
          time,
        };
      console.log(data);
      const response = await axios.post(`${SEARCH_API}/add/chat`, {
        chats: [data],
      });
      return;
    } catch (err) {
      console.error(err);
    }
  }
  async getChatHistory(id) {
    try {
      const res = await axios.get(`${SEARCH_API}/get/chat/${id}`, {
        withCredentials: true,
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      const result = res.data.data.map((item) => {
        return {
          ...item,
          time: new Date(item.time),
          tag: "",
        };
      });
      // console.log(res.data)
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async sendId(id) {
    try {
      const res = await axios.post(`${SEARCH_API}/add/chatId`, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      const result = res.data.data.map((item) => {
        return {
          ...item,
          time: new Date(item.time),
          tag: "",
        };
      });
      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async createChatId() {
    try {
      const res = await axios.get(`${SEARCH_API}/create/chatId`, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  async deleteChatId(id) {
    try {
      const res = await axios.delete(`${SEARCH_API}/delete/chat/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  async updateBookingDetails(details, id) {
    try {
      const res = await axios.post(
        `${SEARCH_API}/updatePendingBooking/${id}`,
        details,
        {
          headers: {
            "ngrok-skip-browser-warning": true,
          },
        }
      );
      console.log(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  async getupdatedBookingDetails(id) {
    try {
      const res = await axios.get(`${SEARCH_API}/getPendingBooking/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
    //   console.log(res,"handle")
      console.log("UPDATED", res.data);
      return res.data.data[0];
    } catch (err) {
      console.error(err);
    }
  }

  async getUserDetails() {
    try {
      const res = await axios.get(`${SEARCH_API}/dummy`, {
        withCredentials:true,
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      console.log(res,"user1")
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }
}

export default UserService;
