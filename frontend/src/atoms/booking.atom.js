import { atom } from "recoil";

// Define the roomTypes atom
export const roomTypesAtom = atom({
  key: "roomTypes",
  default: [
    {
      type: "suite",
      maxAdults: 3,
      maxChildren: 2,
    },
    {
      type: "business",
      maxAdults: 3,
      maxChildren: 0,
    },
    {
      type: "junior",
      maxAdults: 3,
      maxChildren: 0,
    },
    {
      type: "presidential",
      maxAdults: 4,
      maxChildren: 0,
    },
    {
      type: "superior",
      maxAdults: 3,
      maxChildren: 0,
    },
    {
      type: "deluxe",
      maxAdults: 3,
      maxChildren: 0,
      maxPets:3,
    },

    {
      type: "superdeluxe",
      maxAdults: 3,
      maxChildren: 3,
      maxPets:3,
    },
  ],
});

export const booking = atom({
  key: "bookingDetails",
  default: {
    roomTypes: [],
    roomAmenities: [],
    hotelAmenities: [],
    duration: 0,
    adults: 0,
    children: 0,
    pets:0, 
    location: [],
    date: "",
    price: 0,
    count:0,
  },
});

export const userDetails = atom({
  key: "userDetails",
  default: {
    userId: "",
    name:"",
    email:"",
    profile:""
  },
});

