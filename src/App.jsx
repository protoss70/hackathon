import PropTypes from 'prop-types'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api'
import './styles/app.css'

const MapComponent = ({ apiKey, center }) => {
  return (
    <div className='MapComponentContainer'>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={19}
        onClick={(e) => {
          console.log(e)
        }}
      >
        {/* Add any markers or overlays here */}
      </GoogleMap>
    </div>
  )
}

MapComponent.propTypes = {
  apiKey: PropTypes.string.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }).isRequired
}

const Sidebar = ({ onAddressChange }) => {
  const [address, setAddress] = useState('Nám. J. Palacha 1, 110 00 Staré Město')
  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect)
    }
  }, [])

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace()
    if (place && place.geometry) {
      const location = place.geometry.location
      const latLng = {
        lat: location.lat(),
        lng: location.lng()
      }
      setAddress(place.formatted_address)
      onAddressChange(latLng)
    }
  }

  return (
    <div className='SidebarContainer'>
      <div className='SidebarItem'>
        <h2>Address</h2>
        <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={handlePlaceSelect}>
          <input
            type='text'
            className='sidebar-input'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder='Enter your address'
          />
        </Autocomplete>
      </div>
      <div className='SidebarItem secondary'>
        <h2>Expected Produces</h2>
      </div>
      <div className='SidebarItem secondary'>
        <h2>Expected Consumed</h2>
      </div>
      <div className='SidebarItem secondary'>
        <h2>Expected Cost</h2>
      </div>
      <div className='SidebarItem secondary'>
        <h2>Savings</h2>
      </div>
      <div className='SidebarItem secondary'>
        <h2>Return On Investment</h2>
      </div>
    </div>
  )
}

Sidebar.propTypes = {
  onAddressChange: PropTypes.func.isRequired
}

const App = () => {
  const apiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY
  const [center, setCenter] = useState({ lat: 50.08900098216196, lng: 14.415900083914272 })

  const handleAddressChange = (location) => {
    setCenter(location)
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
      <div className='container'>
        <MapComponent apiKey={apiKey} center={center} />
        <Sidebar onAddressChange={handleAddressChange} />
      </div>
    </LoadScript>
  )
}

export default App
