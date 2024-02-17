import axios from "axios";
import { SEARCH_API } from "../../Constants";

class PaymentService {
  apiPath = SEARCH_API;
  async orderPayment(amount) {
    try {
      const response = await axios.post(`${this.apiPath}/order`, { amount });
      return response.data;
    } catch (error) {
      console.log(error || "Something went wrong");
    }
  }
  async verifyPayment(data) {
    try {
      const response = await axios.post(`${this.apiPath}/verify`, {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,    
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error || "Something went wrong");
    }
  }
}

export default PaymentService;
