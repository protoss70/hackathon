import "./styles/app.css";
import PropTypes from 'prop-types';
import GoogleMapReact from 'google-map-react';
import { Autocomplete } from 'google-map-react';
import { useState } from "react";


const MapComponent = ({ apiKey }) => {
  return (
    <div className="MapComponentContainer">
      <GoogleMapReact
        bootstrapURLKeys={{ key: apiKey }}
        defaultCenter={{ lat: 59.95, lng: 30.33 }}
        defaultZoom={11}
        onClick={(e) => {console.log(e)}}
      >
        {/* Add any markers or overlays here */}
      </GoogleMapReact>
    </div>
  );
};

MapComponent.propTypes = {
  apiKey: PropTypes.string.isRequired,
};

const Sidebar = () => {
  const [address, setAddress] = useState('');

  const onPlaceChanged = (place) => {
    setAddress(place.formatted_address);
  };

  return (
    <div className="SidebarContainer">
      <div className="SidebarItem">
        <h2>Address</h2>
        <Autocomplete
          style={{ width: '100%' }}
          onPlaceChanged={onPlaceChanged}
          types={['geocode']}
          placeholder="Enter your address"
        />
        <textarea
          name="address"
          id="address"
          className="sidebar-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
        />
      </div>
      <div className="SidebarItem">
        <h2>Expected Produces</h2>
        {/* Add expected produced energy details here */}
      </div>
      {/* Add other sidebar items with appropriate classNames */}
    </div>
  );
};

const App = () => {
  const apiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY;

  return (
    <div className="container">
      <MapComponent apiKey={apiKey} />
      <Sidebar />
    </div>
  );
};

export default App;