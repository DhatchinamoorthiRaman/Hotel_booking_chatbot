import axios from "axios";
import { addDays, format, parse } from "date-fns";
import { SEARCH_API } from "../../Constants";

class BookingService {
  apiPath = SEARCH_API;
  async getBookedDetails(userId) {
    try {
      const response = await axios.get(`${this.apiPath}/displayBookings/${userId}`, {
        headers: {
          "ngrok-skip-browser-warning": true,
        },
      });
      return response.data;
    } catch (error) {
      console.log(error.message || "Something went wrong");
    }
  }
  async deleteBookingDetails(bookingId) {
    try {
      const response = await axios.delete(`${this.apiPath}/deleteBooking/${bookingId}`);
      return response;
    } catch (error) {
      console.log(error.message || "Something went wrong");
    }
  }
  async editBookedDetails(bookingId, date, duration) {
    try {
      const checkOutDate = addDays(parse(date, "dd-MM-yyyy", new Date()), duration);
      const response = await axios.patch(`${this.apiPath}/updateBookings/${bookingId}`, {
        checkIn: date,
        checkOut: format(checkOutDate, "dd-MM-yyyy"),
      });
      return response.data;
    } catch (error) {
      console.log(error || "Something went wrong");
    }
  }
}

export default BookingService;
