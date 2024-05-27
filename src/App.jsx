import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import { useState } from 'react';
import axios from 'axios';
import "./styles/app.css";

const MapComponent = ({ apiKey, center }) => {
  return (
    <div className="MapComponentContainer">
      <GoogleMapReact
        bootstrapURLKeys={{ key: apiKey }}
        center={center}
        defaultZoom={19}
        onClick={(e) => {console.log(e)}}
      >
        {/* Add any markers or overlays here */}
      </GoogleMapReact>
    </div>
  );
};

MapComponent.propTypes = {
  apiKey: PropTypes.string.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

const Sidebar = ({ onAddressChange }) => {
  const [address, setAddress] = useState('Nám. J. Palacha 1, 110 00 Staré Město');

  const handleAddressChange = async (event) => {
    const newAddress = event.target.value;
    setAddress(newAddress);
    
    if (newAddress.trim() === '') return;

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: newAddress,
          key: import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      });
      
      const results = response.data.results;
      console.log(results);
      if (results.length > 0) {
        const location = results[0].geometry.location;
        onAddressChange(location);
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error);
    }
  };

  return (
    <div className="SidebarContainer">
      <div className="SidebarItem">
        <h2>Address</h2>
        <textarea
          name="address"
          id="address"
          className="sidebar-input"
          value={address}
          onChange={handleAddressChange}
          placeholder="Enter your address"
        />
      </div>
      <div className="SidebarItem secondary">
        <h2>Expected Produces</h2>
      </div>
      <div className="SidebarItem secondary">
        <h2>Excpected Consumed</h2>
      </div>
      <div className="SidebarItem secondary">
        <h2>Excpected Cost</h2>
      </div>
      <div className="SidebarItem secondary">
        <h2>Savings</h2>
      </div>
      <div className="SidebarItem secondary">
        <h2>Return On Investment</h2>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  onAddressChange: PropTypes.func.isRequired,
};

const App = () => {
  const apiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState({ lat: 50.08900098216196, lng: 14.415900083914272 });

  const handleAddressChange = (location) => {
    setCenter(location);
  };

  return (
    <div className="container">
      <MapComponent apiKey={apiKey} center={center} />
      <Sidebar onAddressChange={handleAddressChange} />
    </div>
  );
};

export default App;
