import React, { useState } from "react";
import "./ChatBubble.style.scss";
import { booking } from "../../atoms/booking.atom";
import { useRecoilValue } from "recoil";
import { SEARCH_API, PRICE_DETAILS } from "../../Constants";
import { useNavigate } from "react-router-dom";
import { addDays, format, parse } from "date-fns";
import axios from "axios";
import bookingService from "../../API/booking";
import Swal from "sweetalert2";
import MapComponent from "../../pages/Map";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import paymentService from "../../API/payment";
import { v4 as uuidv4 } from "uuid";

export default function BotBubble({
  time,
  chatData,
  rooms,
  hotels,
  bookedDetails,
  getResponseFromChatAPI,
  getChats,
}) {
  const [text, setText] = useState(chatData.message);
  const bookingDetails = useRecoilValue(booking);
  const userID = localStorage.getItem("userId");
  const [flag, setFlag] = useState(false);
  const location = chatData?.location || "";
  const formattedTime = format(new Date(time), "h:mm a");

  const cancelBooking = async (bookingId) => {
    try {
      const res = await bookingService.deleteBookingDetails(bookingId);
      console.log(res);
      if (res.status === 200) {
        handleCancel();
      } else {
        handleError();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleError = () => {
    Swal.fire({
      title: "Error",
      text: "Something went wrong",
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const initPayment = async (data) => {
    const options = {
      key: "rzp_test_lxRT5NF1Dopxfd",
      amount: data.amount,
      currency: data.currency,
      order_id: data.id,
      name: "RoomieRover",
      description: "Radisson Hotel",
      handler: async (res) => {
        console.log(res);
        try {
          const chatId = uuidv4();
          const data = await paymentService.verifyPayment(res);
          getChats(chatId);
        } catch (error) {
          console.log(error);
        }
      },
      theme: {
        color: "green",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handlePayment = async (price) => {
    const apiPath = SEARCH_API;
    try {
      const response = await paymentService.orderPayment(price);
      initPayment(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Cancelled Successfully",
      text: "Your booking has been successfully canceled. The refund process will begin shortly!",
      icon: "success",
      confirmButtonText: "Return Home",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/";
      }
    });
  };

  const getPaymentLink = async (items) => {
    const apiPath = SEARCH_API;

    const checkOutDate = addDays(
      parse(bookingDetails.date, "dd-MM-yyyy", new Date()),
      bookingDetails.duration
    );
    const data2 = await axios.post(`${apiPath}/book`, {
      hotelId: hotels[0]?.hotelId,
      roomId: items.roomId,
      userId: userID,
      adult: bookingDetails.adults,
      child: bookingDetails.children,
      checkIn: bookingDetails.date,
      checkOut: format(checkOutDate, "dd-MM-yyyy"),
    });

    setFlag(!flag);
  };

  const speakText = () => {
    if ("speechSynthesis" in window) {
      const synthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      synthesis.speak(utterance);
    } else {
      console.error("Speech synthesis not supported in your browser.");
    }
  };

  const count = bookingDetails.count === 0 ? 1 : bookingDetails.count;
  console.log(count, bookingDetails.duration, PRICE_DETAILS[bookingDetails.roomTypes], "jjj");
  return (
    <div style={{ display: "flex" }}>
      <div>
        <img
          src="https://image.ibb.co/eTiXWa/avatarrobot.png"
          style={{
            width: "30px",
            height: "30px",
            marginTop: "45px",
            minHeight: "15px",
            minWidth: "30px",
            marginLeft: "10px",
          }}
          alt="botimg"
        />
      </div>
      <div>
        {chatData.suggestion === "room" ? (
          <div className="chat-bubble">
            <div className="botBubbleHotel">
              {!flag ? (
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
                                  <span className="price">{items?.cost}</span> per room*
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
                <div>
                  <p>
                    You want to pay{" "}
                    {count * (bookingDetails.duration * PRICE_DETAILS[bookingDetails.roomTypes])}
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      handlePayment(
                        count * (bookingDetails.duration * PRICE_DETAILS[bookingDetails.roomTypes])
                      );
                    }}
                  >
                    Click here to pay
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : chatData.suggestion === "cancel" ? (
          <div className="chat-bubble">
            <div className="botBubbleHotel">
              {bookedDetails.length > 0 ? (
                <ul>
                  {bookedDetails.map((items) => (
                    <li key={items?.bookingId}>
                      <div className="wrapper">
                        <div className="booking-card-wrapper">
                          <div className="booking-card-content">
                            <div className="booking-card-description">
                              <h1>{items?.hotel?.branchName}</h1>
                              <p>
                                <span>Room Type:</span>
                                {items?.room?.type}
                              </p>
                            </div>
                            <div className="booking-card-details">
                              <div className="flex">
                                <div>
                                  <span className="price">{items?.room?.cost}</span> per room*
                                </div>
                                <div className="right-align">
                                  <button
                                    className="btn-primary"
                                    onClick={() => cancelBooking(items.bookingId)}
                                  >
                                    Cancel
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
                <p>No booked rooms</p>
              )}
            </div>
          </div>
        ) : chatData.suggestion === "map" ? (
          <div className="chat-bubble">
            <div className="botBubble">
              <MapComponent location={location} />
            </div>
          </div>
        ) : chatData.suggestion === "edit" ? (
          <div className="chat-bubble">
            <div className="botBubbleHotel">
              {bookedDetails.length > 0 ? (
                <ul>
                  {bookedDetails.map((items) => (
                    <li key={items?.bookingId}>
                      <div className="wrapper">
                        <div className="booking-card-wrapper">
                          <div className="booking-card-content">
                            <div className="booking-card-description">
                              <h1>{items?.hotel?.branchName}</h1>
                              <p>
                                <span>Room Type:</span>
                                {items?.room?.type}
                              </p>
                            </div>
                            <div className="booking-card-details">
                              <div className="flex">
                                <div>
                                  <span className="price">{items?.room?.cost}</span> per room*
                                </div>
                                <div className="right-align">
                                  <button
                                    className="btn-primary"
                                    onClick={() => {
                                      getResponseFromChatAPI("", items.bookingId);
                                    }}
                                  >
                                    Edit
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
                <p>No booked rooms</p>
              )}
            </div>
          </div>
        ) : (
          <div className="chat-bubble">
            <div className="botBubble">
              {chatData.message}
              <div className="time">{formattedTime}</div>
              <VolumeUpIcon
                onClick={speakText}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  left: "10px",
                  top: "7px",
                  marginRight: "30px",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
