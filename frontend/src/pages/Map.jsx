import React, { useEffect, useState } from "react";

const CoimbatoreMap = () => {
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDsklSLoF3zhP6Dif-NGQEQwiBkvwEwD74&libraries=places`;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    const mapElement = document.getElementById("coimbatore-map");
    if (mapElement) {
      const coimbatoreLocation = { lat: 11.021618918711923, lng: 76.99194366137145 };

      const mapInstance = new window.google.maps.Map(mapElement, {
        center: coimbatoreLocation,
        zoom: 15,
      });

      const marker = new window.google.maps.Marker({
        position: coimbatoreLocation,
        map: mapInstance,
        title: "Your Location",
      });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: coimbatoreLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          console.error("Geocoding failed:", status);
        }
      });

      setMap(mapInstance);
    } else {
      console.error("Map container element not found");
    }
  };

  return (
    <div>
      <div id="coimbatore-map" style={{ height: "380px" }}></div>
      <div style={{ marginTop: "20px" }}>
        <strong>Address:</strong> {address}
      </div>
    </div>
  );
};

const ChennaiMap = () => {
  const [map, setMap] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDsklSLoF3zhP6Dif-NGQEQwiBkvwEwD74&libraries=places`;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = () => {
    const mapElement = document.getElementById("chennai-map");
    if (mapElement) {
      const chennaiLocation = { lat: 13.067159444410409, lng: 80.25570133714898 };

      const mapInstance = new window.google.maps.Map(mapElement, {
        center: chennaiLocation,
        zoom: 15,
      });

      const marker = new window.google.maps.Marker({
        position: chennaiLocation,
        map: mapInstance,
        title: "Your Location",
      });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: chennaiLocation }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        } else {
          console.error("Geocoding failed:", status);
        }
      });

      setMap(mapInstance);
    } else {
      console.error("Map container element not found");
    }
  };

  return (
    <div>
      <div id="chennai-map" style={{ height: "380px", width: "620px" }}></div>
      <div style={{ marginTop: "20px" }}>
        <strong>Address:</strong> {address}
      </div>
    </div>
  );
};

const MapComponent = ({ location }) => {
  return location === "coimbatore" ? <CoimbatoreMap /> : <ChennaiMap />;
};

export default MapComponent;
