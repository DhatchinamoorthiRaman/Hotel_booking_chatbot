import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/navbar/Navbar";
import "./HomePage.scss";
import ChatBubble from "../../components/ChatBubble/ChatBubble";
import Footer from "../../components/footer/Footer";
import chatService from "../../API/chat";
import { useRecoilState } from "recoil";
import { booking } from "../../atoms/booking.atom";
import { chat } from "../../atoms/chatHistory.atom";
import { userDetails } from "../../atoms/booking.atom";
import { roomTypesAtom } from "../../atoms/booking.atom";
import BotBubble from "../../components/ChatBubble/BotBubble";
import { v4 as uuidv4 } from "uuid";
import { SEARCH_API, PRICE_DETAILS } from "../.././Constants";
import historyService from "../../API/history";
import axios from "axios";
import bookingService from "../../API/booking";

function HomePage() {
  const [chatHistory, setChatHistory] = useRecoilState(chat);
  const [bookingDetails, setBookingDetails] = useRecoilState(booking);
  const [user, setUserDetails] = useRecoilState(userDetails);
  const [bookedDetails, setBookedDetails] = useState([]);
  const [bookedId, setBookedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(localStorage.getItem("chatId"));
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState();
  const chatElementRef = useRef(null);
  const [roomLimit, _setRoomLimit] = useRecoilState(roomTypesAtom);
  const userID = localStorage.getItem("userId");
  const [roomType, setRoomTtpe] = useState("");
  console.log(bookingDetails);

  const getMaxAdults = (roomType) => {
    const selectedRoomType = roomLimit.find((type) => type.type === roomType);
    return selectedRoomType ? selectedRoomType.maxAdults : 0;
  };
  console.log(getMaxAdults("junior"));

  const getMaxChildren = (roomType) => {
    const selectedRoomType = roomLimit.find((type) => type.type === roomType);
    return selectedRoomType ? selectedRoomType.maxChildren : 0;
  };

  const getBookedDetails = async () => {
    try {
      const response = await bookingService.getBookedDetails(userID);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  console.log(bookingDetails.pets, "COUNT");
  const updateBooking = async (bookedId, date, duration) => {
    try {
      const response = await bookingService.editBookedDetails(bookedId, date, duration);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const getResponseFromChatAPI = async (userInput, bookingId) => {
    try {
      setLoading(true);
      const data = await chatService.getChatResponse(userInput);
      setLoading(false);
      console.log("chat_api", data);
      console.log(bookingDetails);
      // if (data.tag) setChatContext(data.tag);
      console.log(bookingId, "check");
      if (bookingId) {
        setBookedId(bookingId);
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message:
              "Please provide the date and duration for your booking. (EX: 10-01-2024 for 3 days)",
            tag: "userInput",
            time: new Date(),
          },
        ]);
      } else if (data.tag === "bookedDate") {
        const date = data.date;
        const duration = data.duration;
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: `Are you sure you want to change the booking details to ${data.statement}? Please confirm ?`,
            time: new Date(),
          },
          {
            id: 1,
            type: "user",
            input: "yn",
            message: "",
            tag: "validation",
            onYes: async () => {
              console.log(bookedId);
              console.log(date, duration);
              const res = await updateBooking(bookedId, date, duration);
              if (res.code === 200) {
                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Your booking details have been successfully updated!",
                    time: new Date(),
                  },
                ]);
              } else {
                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Something went wrong while updating!",
                    time: new Date(),
                  },
                ]);
              }
            },
            onNo: () => {
              setChatHistory((prev) => [
                ...prev,
                {
                  id: uuidv4(),
                  type: "bot",
                  message: "Okay, let me know if there's anything else I can help you with!",
                  time: new Date(),
                },
              ]);
              console.log("then what to do you want to do?");
            },
            time: new Date(),
          },
        ]);
      } else if (data.tag === "") {
        setChatHistory((prev) => {
          return [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: data.statement,
              tag: data.tag,
              time: new Date(),
            },
          ];
        });
      } else if (data.tag === "invalid_date") {
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: data.statement,
            tag: data.tag,
            time: new Date(),
          },
        ]);
      } else if (data.tag === "map") {
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: "Please choose which place you are looking for?",
            tag: data.tag,
            time: new Date(),
          },
          {
            id: 1,
            type: "user",
            input: "loc",
            message: "",
            tag: "validation",
            onCbe: async () => {
              setChatHistory((prev) => [
                ...prev,
                {
                  id: uuidv4(),
                  type: "bot",
                  suggestion: "map",
                  location: "coimbatore",
                  time: new Date(),
                },
              ]);
            },
            onChe: () => {
              setChatHistory((prev) => [
                ...prev,
                {
                  id: uuidv4(),
                  type: "bot",
                  suggestion: "map",
                  location: "chennai",
                  time: new Date(),
                },
              ]);
              console.log("then what to do you want to do?");
            },
            time: new Date(),
          },
        ]);
      } else if (data.tag === "cancel") {
        console.log(data.statement, "cancel");
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: data.statement,
            tag: data.tag,
            time: new Date(),
          },
          {
            id: 1,
            type: "user",
            input: "yn",
            message: "",
            tag: "validation",
            onYes: async () => {
              const data = await getBookedDetails();
              setBookedDetails(data);
              setBotResponse(bookingDetails, true);
            },
            onNo: () => {
              setChatHistory((prev) => [
                ...prev,
                {
                  id: uuidv4(),
                  type: "bot",
                  message: "Can you be more Specific ?",
                  tag: data.tag,
                  time: new Date(),
                },
              ]);
              console.log("then what to do you want to do?");
            },
            time: new Date(),
          },
        ]);
      } else if (data.tag === "greeting") {
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: data.statement + "\n (Available at Coimbatore, Chennai)",
            tag: data.tag,
            time: new Date(),
          },
        ]);
      } else if (data.tag === "booked") {
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: data.statement,
            tag: data.tag,
            time: new Date(),
          },
          {
            id: uuidv4(),
            type: "user",
            input: "yn",
            message: "",
            tag: "validation",
            onYes: async () => {
              const data = await getBookedDetails();
              setBookedDetails(data);
              setBotResponse(bookingDetails, false, true);
            },
            onNo: () => {
              setChatHistory((prev) => [
                ...prev,
                {
                  id: uuidv4(),
                  type: "bot",
                  message: data.statement + "\n (Available at Coimbatore, Chennai)",
                  tag: data.tag,
                  time: new Date(),
                },
              ]);
            },
            time: new Date(),
          },
        ]);
      } else if (data.tag === "people") {
        const { adult, child, pets } = data.statement;
        console.log(adult, child, pets, "CHECH");
        const adultLimit = getMaxAdults(bookingDetails.roomTypes[0]);
        const childLimit = getMaxAdults(bookingDetails.roomTypes[0]);
        const isRoomTypesDefined = bookingDetails.roomTypes.length > 0;
        if (adult == 0 && child == 0 && pets == 0) {
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message:
                "Can you specify the number of people more clearly ? (Ex: 1 adult 2 children)",
              tag: data.tag,
              time: new Date(),
            },
          ]);
        } else if (!isRoomTypesDefined) {
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message:
                "Please select the room types, We have rooms like business, junior, presidential, suite, superior with the facilities like ac, tv, beverages, wifi, breakfast, minibar, newspaper, jacuzzi, smart, pool, hill, beach, gym, bar, parking",
              tag: data.tag,
              time: new Date(),
            },
          ]);
        } else if (pets != 0 && bookingDetails.roomTypes != "superdeluxe" && child != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message:
                "We currently only accept pets and kids in only  Super Deluxe room type. Are you sure you shift to a Super Deluxe room type?",
              tag: data.tag,
              time: new Date(),
            },
            {
              id: uuidv4(),
              type: "user",
              input: "yn",
              message: "",
              tag: "validation",
              onYes: async () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  roomTypes: ["superdeluxe"],
                  adults: 0,
                };

                setBookingDetails(newBookingDetails);

                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    type: "bot",
                    message:
                      "Okay, please specify your room type , so that I can assist you better.",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (pets != 0 && bookingDetails.roomTypes != "deluxe") {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message:
                "We currently only accept pets in the Deluxe room type. Are you sure you want a Deluxe room type?",
              tag: data.tag,
              time: new Date(),
            },
            {
              id: uuidv4(),
              type: "user",
              input: "yn",
              message: "",
              tag: "validation",
              onYes: async () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  roomTypes: ["deluxe"],
                  adults: 0,
                };

                setBookingDetails(newBookingDetails);

                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    type: "bot",
                    message:
                      "Okay, please specify your room type , so that I can assist you better.",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (child != 0 && bookingDetails.roomTypes != "suite") {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message:
                "We currently only accept children in the Suite room type. Are you sure you want a Suite room type?",
              tag: data.tag,
              time: new Date(),
            },
            {
              id: uuidv4(),
              type: "user",
              input: "yn",
              message: "",
              tag: "validation",
              onYes: async () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  roomTypes: ["suite"],
                  adults: 0,
                };

                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    type: "bot",
                    message:
                      "Okay, please specify your room type , so that I can assist you better.",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (adult + child + pets > adultLimit) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `The maximum accommodation capacity is set at ${adultLimit} guests. Considering this, would you like to reserve an additional ${Math.ceil(
                adult / adultLimit
              )} rooms?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: uuidv4(),
              type: "user",
              input: "yn",
              message: "",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  count: bookingDetails.count + adult / adultLimit,
                  adults: adult,
                  children: child,
                  pets: pets,
                };

                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev,
                  {
                    id: uuidv4(),
                    type: "bot",
                    message:
                      "Okay, please specify your room type , so that I can assist you better.",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `Ok, you want a room for ${adult} ${adult > 1 ? "adults" : "adult"} ${
                child
                  ? `and ${child} ${child > 1 ? "children" : "child"} (of age less than 12 years)`
                  : ""
              }${pets ? ` with ${pets} pets` : ""}, is this accurate ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  adults: adult,
                  children: child,
                  pets: pets,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Can you be more Specific ? (like: 1 Adult 2 Children)",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
      } else if (data.tag === "price") {
        if (data.numbers > 5000) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for rooms on the price of  ${data?.numbers} do you want to confirm it?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  price: data?.number,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine provide the price correctly",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else {
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: data.statement,
              tag: data.tag,
              time: new Date(),
            },
          ]);
        }
      } else if (data.tag === "date") {
        const validationBubbleId = uuidv4();
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: `You are looking for room on ${data?.date} do you want to confirm it?`,
            tag: data.tag,
            time: new Date(),
          },
          {
            id: uuidv4(),
            type: "user",
            input: "yn",
            message: "ok",
            tag: "validation",
            onYes: () => {
              const newBookingDetails = {
                ...bookingDetails,
                date: data?.date,
              };
              setBookingDetails(newBookingDetails);
              setChatHistory((prev) => [
                ...prev.map((chatData) =>
                  chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                ),
              ]);
              setBotResponse(newBookingDetails);
            },
            onNo: () => {
              setChatHistory((prev) => [
                ...prev.map((chatData) =>
                  chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                ),
                {
                  id: uuidv4(),
                  type: "bot",
                  message: "Fine provide the date correctly",
                  tag: data.tag,
                  time: new Date(),
                },
              ]);
            },
            time: new Date(),
          },
        ]);
      } else if (data.tag === "roomsDetail") {
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: data.statement,
            tag: data.tag,
            time: new Date(),
          },
        ]);
      } else if (data.tag === "duration") {
        const validationBubbleId = uuidv4();
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: `You are looking for room on duration of ${data?.duration} do you want to confirm it?`,
            tag: data.tag,
            time: new Date(),
          },
          {
            id: validationBubbleId,
            type: "user",
            input: "yn",
            message: "ok",
            tag: "validation",
            onYes: () => {
              const newBookingDetails = {
                ...bookingDetails,
                duration: data?.duration,
              };
              setBookingDetails(newBookingDetails);
              setChatHistory((prev) => [
                ...prev.map((chatData) =>
                  chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                ),
              ]);
              setBotResponse(newBookingDetails);
            },
            onNo: () => {
              setChatHistory((prev) => [
                ...prev.map((chatData) =>
                  chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                ),
                {
                  id: uuidv4(),
                  type: "bot",
                  message: "Fine provide the date correctly",
                  tag: data.tag,
                  time: new Date(),
                },
              ]);
            },
            time: new Date(),
          },
        ]);
      } else if (data.tag === "roomsDetail") {
        setChatHistory((prev) => [
          ...prev,
          {
            id: uuidv4(),
            type: "bot",
            message: data.statement,
            tag: data.tag,
            time: new Date(),
          },
        ]);
      } else if (data.tag === "backend") {
        const validationBubbleId = uuidv4();
        const hotelAmenities = data.hotelAmenities;
        const roomAmenities = data.roomAmenities;
        const roomTypes = data.roomTypes;
        // const location = data.location;
        if (roomTypes.length != 0) {
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room type  ${roomTypes} do you want to confirm the room type as it costs the price of ${PRICE_DETAILS[roomTypes]}?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  price: PRICE_DETAILS[roomTypes],
                  roomTypes: roomTypes,
                };

                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine what type of room you are exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }

        if (hotelAmenities.length !== 0 && roomAmenities.length !== 0) {
          const validationBubbleId = uuidv4();
          let amenitiesMessage = "";

          if (hotelAmenities.length !== 0) {
            amenitiesMessage += `Hotel with ${hotelAmenities}`;
          }

          if (hotelAmenities.length !== 0 && roomAmenities.length !== 0) {
            amenitiesMessage += " and ";
          }

          if (roomAmenities.length !== 0) {
            amenitiesMessage += `room with ${roomAmenities}`;
          }

          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `Hope you are looking for ${amenitiesMessage}. Do you want to confirm the amenities ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  hotelAmenities:
                    hotelAmenities.length !== 0
                      ? [...bookingDetails.hotelAmenities, hotelAmenities]
                      : bookingDetails.hotelAmenities,
                  roomAmenities:
                    roomAmenities.length !== 0
                      ? [...bookingDetails.roomAmenities, roomAmenities]
                      : bookingDetails.roomAmenities,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine, what amenities are you exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (hotelAmenities.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `Hope You are looking for room with  ${hotelAmenities} do you want to confirm the room amenities ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const existinghotelAmenities = bookingDetails.hotelAmenities || [];
                const newUniqueRoomTypes = [
                  ...new Set([...existinghotelAmenities, ...hotelAmenities]),
                ];

                const newBookingDetails = {
                  ...bookingDetails,
                  hotelAmenities: newUniqueRoomTypes,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine what are the hotel amenities exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (roomAmenities.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room with  ${roomAmenities} do you want to confirm the room Amenities ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const existingroomAmenities = bookingDetails.roomAmenities || [];
                const newUniqueRoomTypes = [
                  ...new Set([...existingroomAmenities, ...roomAmenities]),
                ];

                const newBookingDetails = {
                  ...bookingDetails,
                  roomAmenities: newUniqueRoomTypes,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine what are the room amenities you are exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        if (data?.date.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room on ${data?.date} do you want to confirm it ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  date: data?.date,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine provide the date correctly",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        if (data?.location.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room at ${data?.location} do you want to confirm it ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  location: [data?.location],
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine provide the location correctly",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        getResponseFromSearch();
      } else if (data.tag === "change") {
        const validationBubbleId = uuidv4();
        const hotelAmenities = data.hotelAmenities;
        const roomAmenities = data.roomAmenities;
        const roomTypes = data.roomTypes;
        // const location = data.location;
        if (roomTypes.length != 0) {
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room type  ${roomTypes} do you want to confirm the room type as it costs the price of ${PRICE_DETAILS[roomTypes]}?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  roomTypes: roomTypes,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine what type of room you are exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        if (hotelAmenities.length !== 0 && roomAmenities.length !== 0) {
          const validationBubbleId = uuidv4();
          let amenitiesMessage = "";

          if (hotelAmenities.length !== 0) {
            amenitiesMessage += `Hotel with ${hotelAmenities}`;
          }

          if (hotelAmenities.length !== 0 && roomAmenities.length !== 0) {
            amenitiesMessage += " and ";
          }

          if (roomAmenities.length !== 0) {
            amenitiesMessage += `room with ${roomAmenities}`;
          }

          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `Hope you are looking for ${amenitiesMessage}. Do you want to confirm the amenities ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  hotelAmenities: hotelAmenities,
                  roomAmenities: roomAmenities,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine, what amenities are you exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (hotelAmenities.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `Are you interested in switching to a room with ${hotelAmenities}? Please confirm if you'd like to proceed with these upgraded amenities.`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  hotelAmenities: hotelAmenities,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine what are the hotel amenities exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        } else if (roomAmenities.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room with  ${roomAmenities} do you want to confirm the room Amenities ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  roomAmenities: roomAmenities,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine what are the room amenities you are exactly looking for...",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        if (data?.date.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room on ${data?.date} do you want to confirm it ? `,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  date: data?.date,
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine provide the date correctly",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        if (data?.location.length != 0) {
          const validationBubbleId = uuidv4();
          setChatHistory((prev) => [
            ...prev,
            {
              id: uuidv4(),
              type: "bot",
              message: `You are looking for room at ${data?.location} do you want to confirm it ?`,
              tag: data.tag,
              time: new Date(),
            },
            {
              id: validationBubbleId,
              type: "user",
              input: "yn",
              message: "ok",
              tag: "validation",
              onYes: () => {
                const newBookingDetails = {
                  ...bookingDetails,
                  location: [data?.location],
                };
                setBookingDetails(newBookingDetails);
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                ]);
                setBotResponse(newBookingDetails);
              },
              onNo: () => {
                setChatHistory((prev) => [
                  ...prev.map((chatData) =>
                    chatData.id === validationBubbleId ? { ...chatData, disable: true } : chatData
                  ),
                  {
                    id: uuidv4(),
                    type: "bot",
                    message: "Fine provide the location correctly",
                    tag: data.tag,
                    time: new Date(),
                  },
                ]);
              },
              time: new Date(),
            },
          ]);
        }
        getResponseFromSearch();
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const setBotResponse = (bookingDetails, cancel, edit) => {
    console.log(bookingDetails, "INSIDE");
    const { adults, children, location, date, roomAmenities, roomTypes, duration, price } =
      bookingDetails;
    let string = "";
    if (location.length === 0 && !cancel && !edit) {
      string =
        "Can you provide your prefered location ? (PS: We're available in Coimbatore and Chennai)";
    } else if (roomTypes.length == 0 && !cancel && !edit) {
      string =
        "Can you provide details about the room type you are looking for (Ex: Superior, Business, Junior, Suite, Presidential)";
    } else if (adults + children === 0 && !cancel && !edit) {
      string = "Can you specify the number of people ? (Ex: 1 adult 2 children)";
    } else if (date.length == 0 && !cancel && !edit) {
      string = "Can you provide the date you want rooms (Ex: 10-12-2024)";
    } else if (duration === 0 && !cancel && !edit) {
      string = "Can you specify the duration ? (Ex: 2 days)";
    } else if (roomAmenities.length == 0 && !cancel && !edit) {
      string =
        "Can you provide details about the amenities you are looking for (Ex:Ac,Newspaper...)";
    } else {
      // string = `Hi, you are going good, how about you provide some additional details ?
      // like:
      // -> Hotel Amenities - Swimming Pool, Hill, Beach, Gym, Bar, Parking
      // -> Room Amenities - AC, Beverages, Wifi, Breakfast, TV, Minibar, Newspaper, Jacuzzi, Smart Room
      // -> Room Types - Superior, Business, Junior, Suite, Presidential
      // -> Price - Rs.5000
      // -> No of People - Ex: 1 adult 2 children`;
    }
    if (string.length > 0) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "bot",
          message: string,
          tag: "loop",
          time: new Date(),
        },
      ]);
    } else if (cancel) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "bot",
          suggestion: "cancel",
          message: "",
          time: new Date(),
        },
      ]);
    } else if (edit) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "bot",
          suggestion: "edit",
          message: "",
          time: new Date(),
        },
      ]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: "bot",
          suggestion: "room",
          message: "",
          time: new Date(),
        },
      ]);
    }
  };

  const handleUserInput = (userId, message, time) => {
    if (message.length > 0) {
      setChatHistory((prev) => {
        return [
          ...prev,
          {
            id: uuidv4(),
            type: "user",
            message: message,
            time,
          },
        ];
      });
    }
  };

  const getResponseFromSearch = async () => {
    const apiPath = SEARCH_API;

    try {
      const data = await axios.post(`${apiPath}/search`, {
        roomTypes: [...bookingDetails.roomTypes],
        roomAmenities: [...bookingDetails.roomAmenities],
        hotelAmenities: [...bookingDetails.hotelAmenities],
        adults: bookingDetails.adults,
        children: bookingDetails.children,
        location: [...bookingDetails.location],
      });
      console.log(data, "count this");
      setRooms(data?.data?.data?.rooms);
      setHotels(data?.data?.data?.Hotel);
      console.log(hotels);
    } catch (e) {
      console.error(e.message || "Something went wrong");
    }
  };

  const getChats = async (temp) => {
    let chats = "";
    if (temp) {
      localStorage.setItem("chatId", temp);
      chats = await historyService.getChatHistory(temp);
    } else {
      const id = uuidv4();
      localStorage.setItem("chatId", id);
      chats = await historyService.getChatHistory(id);
    }
    setChatHistory(chats.map(({ chatId, ...rest }) => ({ ...rest })));
    if (chats.length === 0) {
      getResponseFromChatAPI("Hi");
    } else {
      setChatHistory(
        chats.map((item) => {
          const { chatId, ...rest } = item;
          return {
            ...rest,
          };
        })
      );
    }
    setTimeout(function () {
      getupdatedBookingDetails();
    }, 500);
  };

  useEffect(() => {
    getChats(id);
  }, []);

  const addPost = async () => {
    const existingChats = await historyService.getChatHistory(id);
    const existingChatIds = existingChats.map((chat) => chat.id);
    for (let chat of chatHistory) {
      if (!existingChatIds.includes(chat.id)) {
        await historyService.setChatHistory(chat);
      }
    }
  };

  useEffect(() => {
    if (
      chatHistory.length != 0 &&
      chatHistory[chatHistory.length - 1].type === "user" &&
      chatHistory[chatHistory.length - 1].tag !== "validation"
    ) {
      if (["no", "No", "Nope"].includes(chatHistory[chatHistory.length - 1].message)) {
        setBotResponse(bookingDetails);
      } else {
        getResponseFromChatAPI(chatHistory[chatHistory.length - 1].message);
      }
    }
    addPost();
  }, [chatHistory.length]);

  //   const updateBookDetails = async () => {
  //     const apiPath = SEARCH_API;
  // const temp=localStorage.getItem("chatId")
  //     try {
  //       const data = await axios.post(`${apiPath}/search`, {
  //         roomTypes: [...bookingDetails.roomTypes],
  //         roomAmenities: [...bookingDetails.roomAmenities],
  //         hotelAmenities: [...bookingDetails.hotelAmenities],
  //         adults: bookingDetails.adults,
  //         children: bookingDetails.children,
  //         pets:bookingDetails.pets,
  //         location: [...bookingDetails.location],
  //       });
  //       console.log(data);
  //       setRooms(data?.data?.data?.rooms);
  //       setHotels(data?.data?.data?.Hotel);
  //       console.log(hotels);
  //     } catch (e) {
  //       console.error(e.message || "Something went wrong");
  //     }
  //   };

  const updateBookDetails = async () => {
    const temp = localStorage.getItem("chatId");
    console.log(bookingDetails, "GOING");
    const chats = await historyService.updateBookingDetails(bookingDetails, temp);
    console.log(chats);
  };

  const getupdatedBookingDetails = async () => {
    const temp = localStorage.getItem("chatId");
    if (temp) {
      const chats = await historyService.getupdatedBookingDetails(temp);
      console.log(chats, "handle");
      console.log(chats?.location, "parsed");
      const newBookingDetails = {
        roomTypes: chats?.roomTypes ?? [],
        roomAmenities: chats?.roomAmenities ?? [],
        hotelAmenities: chats?.hotelAmenities ?? [],
        duration: chats?.duration ?? 0,
        adults: chats?.adults ?? 0,
        children: chats?.children ?? 0,
        pets: chats?.pets ?? 0,
        location: chats?.location ?? [],
        date: chats?.date ?? "",
        price: chats?.price ?? 0,
        count: chats?.count ?? 0,
      };
      console.log("YOGESH", newBookingDetails);

      setBookingDetails(newBookingDetails);
    }
  };

  useEffect(() => {
    setTimeout(function () {
      getupdatedBookingDetails();
    }, 500);
    if (chatElementRef) {
      chatElementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }

    getDetails();
  }, []);

  const getDetails = async () => {
    const chats = await historyService.getUserDetails();
    if (chats) {
      const newUserDetails = {
        userID: chats?.userId ?? "",
        name: chats?.name ?? "",
        email: chats?.email ?? "",
        profile: chats?.photo ?? "",
      };
      setUserDetails(newUserDetails);

      localStorage.setItem("userId", newUserDetails?.userID);
      localStorage.setItem("userName", newUserDetails?.name);
      localStorage.setItem("profile", newUserDetails?.profile);
    }
  };

  console.log(user, "UUSERID");
  useEffect(() => {
    if (
      (bookingDetails.roomTypes && bookingDetails.roomTypes.length > 0) ||
      (bookingDetails.roomAmenities && bookingDetails.roomAmenities.length > 0) ||
      (bookingDetails.hotelAmenities && bookingDetails.hotelAmenities.length > 0) ||
      (bookingDetails.duration && bookingDetails.duration !== 0) ||
      (bookingDetails.adults && bookingDetails.adults !== 0) ||
      (bookingDetails.children && bookingDetails.children !== 0) ||
      (bookingDetails.pets && bookingDetails.pets !== 0) ||
      (bookingDetails.location && bookingDetails.location.length > 0) ||
      (bookingDetails.date && bookingDetails.date !== "") ||
      (bookingDetails.price && bookingDetails.price !== 0) ||
      (bookingDetails.count && bookingDetails.count !== 0)
    ) {
      updateBookDetails();
    }
  }, [bookingDetails]);

  useEffect(() => {
    if (chatElementRef) {
      console.log("hi");
      chatElementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chatHistory.length]);

  // useEffect(() => {
  //   if (
  //     bookingDetails.date &&
  //     bookingDetails.adults !== 0 &&
  //     bookingDetails.location.length > 0 &&
  //     bookingDetails.roomTypes.length > 0
  //   ) {
  //     setChatHistory((prev) => [
  //       ...prev,
  //       {
  //         id: uuidv4(),d95a9344-abae-4745-a1e6-42312257670e
  //         type: "bot",
  //         suggestion: "room",
  //         message: "",
  //       },
  //     ]);
  //   }
  // }, [bookingDetails]);

  console.log(bookingDetails, "kadaisi");

  return (
    <div className="chat-box">
      <div className="homepage-container">
        <div className="home-wrapper">
          <div className="navbar-wrapper">
            <Navbar getChats={getChats} />
          </div>
          <div className="scroll-wrapper">
            <div className="chat-wrapper" ref={chatElementRef}>
              {chatHistory.map((chat) => (
                <>
                  {chat.type === "bot" ? (
                    <BotBubble
                      key={`${chat.id}`}
                      time={chat.time}
                      chatData={chat}
                      rooms={rooms}
                      hotels={hotels}
                      bookedDetails={bookedDetails}
                      getResponseFromChatAPI={getResponseFromChatAPI}
                      getChats={getChats}
                    />
                  ) : (
                    <ChatBubble key={`${chat.id}`} time={chat.time} chatData={chat} />
                  )}
                </>
              ))}
            </div>
            {/* {bookingDetails.adults != 0 &&
          bookingDetails.location.length != 0 &&
          bookingDetails.date != 0 &&
          (bookingDetails.hotelAmenities.length != 0 ||
            bookingDetails.roomAmenities.length != 0) ? (
            <div className="chat-bubble">
              <div className="botBubbleHotel">
                {!id ? (
                  <ul style={{ display: "flex", gap: "20px", bottom: "50px" }}>
                    {rooms.map((items) => (
                      <li key={items?.roomId}>
                        <div className="wrapper">
                          <div className="booking-card-wrapper">
                            <div className="booking-card-content">
                              <div className="booking-card-description">
                                <h1>{hotels[0]?.branchName}</h1>
                                <p>
                                  <span>Room Type:</span>
                                  {items.type}
                                </p>
                                <p>
                                  <span>Persons:</span>adults-
                                  {bookingDetails.adults} and child-
                                  {bookingDetails.children}{" "}
                                </p>
                                <p>
                                  <span>BedType:</span>
                                  {items.bedType}
                                </p>
                              </div>
                              <div className="booking-card-details">
                                <div className="flex">
                                  <div>
                                    <span className="price">{items?.cost}</span>{" "}
                                    per room*
                                  </div>
                                  <div className="right-align">
                                    <button
                                      className="btn-primary"
                                      onClick={() => getPaymentLink(items)}
                                    >
                                      Book
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={() => navigate("/success")}
                  >
                    Click here to pay
                  </button>
                )}
              </div>
            </div>
          ) : null} */}
          </div>
        </div>
        <Footer handleUserInput={handleUserInput} getChats={getChats} />
      </div>
    </div>
  );
}

export default HomePage;
