import axios from "axios";
import { SEARCH_API } from "../../Constants";
import { useRecoilState } from "recoil";

class SearchService {
  apiPath = SEARCH_API;
  async getSearchResponse() {
    const [bookingDetails, setBookingDetails] = useRecoilState(booking);
    try {
      const response = await axios.post(`${this.apiPath}`, {
        roomTypes: bookingDetails.roomTypes,
        roomAmenities: bookingDetails.roomAmenities,
        hotelAmenities: bookingDetails.hotelAmenities,
        adults: bookingDetails.adults,
        children: bookingDetails.children,
        location: bookingDetails.location,
      });
      return response.data;
    } catch (e) {
      console.error(e.message || "Something went wrong");
    }
  }
}

export default SearchService;
