import PropTypes from 'prop-types'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api'
import './styles/app.css'
import { getDataLayer, getDataLayers, getSolarData } from './api'
import sunImage from './assets/sun.svg';
import solarImage from "./assets/solar.svg"
import areaImage from "./assets/area.svg"
import costImage from "./assets/cost.svg"
import plusImage from "./assets/plus.svg"
import minusImage from "./assets/minus.svg"
import savingsImage from "./assets/saving.svg"
import roiImage from "./assets/ROI.svg"
import hotTubImage from './assets/hot-tub.svg';
import houseImage from './assets/house.svg';
import carImage from './assets/car.svg';
import airConditionerImage from './assets/air-conditioner.svg';
import peopleImage from './assets/people.svg';
import batteryImage from './assets/battery.svg';
import poolImage from './assets/pool.svg';

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

  const handlePlaceSelect = async () => {
    const place = autocompleteRef.current.getPlace()
    if (place && place.geometry) {
      const location = place.geometry.location
      const lat = location.lat()
      const lng = location.lng()
      const latLng = {
        lat,
        lng
      }
      setAddress(place.formatted_address)
      onAddressChange(latLng)
      const solarData = await getSolarData(lat, lng)
      setSunshineHours(solarData.maxSunshineHoursPerYear)
      setMaxArrayAreaMeters2(solarData.setMaxArrayAreaMeters2)

      // this is how you can get the data layers
      // const dataLayers = await getDataLayers(lat, lng)
      // const res = await getDataLayer(dataLayers.rgbUrl)

      // const panelCount = solarData.maxArrayPanelsCount
      // const panels = solarData.solarPanelConfigs
      // const panelCapacityWatts = solarData.panelCapacityWatts
    }
  }
  const [expectedProduced, setExpectedProduced] = useState("-")
  const [expectedConsumed, setExpectedConsumed] = useState("-")
  const [expectedCost, setExpectedCost] = useState("-")
  const [savings, setSavings] = useState("-")
  const [maxSolarPanels, setMaxSolarPanels] = useState("-")
  const [ROI, setROI] = useState("-")
  const [sunshineHours, setSunshineHours] = useState("-")
  const [maxArrayAreaMeters2, setMaxArrayAreaMeters2] = useState("-")

  const handleAddressChange = async (event) => {
    const newAddress = event.target.value
    setAddress(newAddress)

    if (newAddress.trim() === '') return

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: newAddress,
          key: import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY
        }
      })

      const results = response.data.results
      console.log(results)
      if (results.length > 0) {
        const location = results[0].geometry.location
        onAddressChange(location)
      }
    } catch (error) {
      console.error('Error fetching geocode data:', error)
    }
  }

  return (
    <>
      <div className='SidebarContainer'>
        <div className='SidebarItem' style={{paddingBottom: "25px"}}>
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
          <h2>General Information</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={sunImage}  style={{ marginLeft: '-2px' }}></img>
              <div className='sideBar-content-item'>Sunshine hours/year:</div>
            </div>
            <div>{sunshineHours}</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={areaImage}></img>
              <div className='meter-container sideBar-content-item'>Area meters<span className='meter-square'>2&nbsp;</span></div>
            </div>
            <div>{maxArrayAreaMeters2}</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={solarImage}></img>
              <div className='meter-container sideBar-content-item'>Max Panel Count</div>
            </div>
            <div>{maxSolarPanels}</div>
          </div>
        </div>
        <div className='SidebarItem secondary'>
          <h2>Expected</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={plusImage} style={{width: "20px"}}></img>
              <div className='meter-container sideBar-content-item'>Produced</div>
            </div>
            <div>{expectedProduced}</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={minusImage} style={{width: "20px"}}></img>
              <div className='meter-container sideBar-content-item'>Consumed</div>
            </div>
            <div>{expectedConsumed}</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={costImage} style={{ width: '23px', marginLeft: "-2px" }}></img>
              <div className='meter-container sideBar-content-item'>Cost</div>
            </div>
            <div>{expectedCost}</div>
          </div>
        </div>
        <div className='SidebarItem secondary'>
          <h2>Financial:</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={savingsImage}></img>
              <div className='meter-container sideBar-content-item'>Saving</div>
            </div>
            <div>{savings}</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={roiImage}></img>
              <div className='meter-container sideBar-content-item'>Return On Investment</div>
            </div>
            <div>{ROI}</div>
          </div>
        </div>
      </div>
    </>
  )
}

Sidebar.propTypes = {
  onAddressChange: PropTypes.func.isRequired
}

const Card = ({ title, description, inputType, src, setter }) => {
  return (
    <div className="card">
      <img src={src} className='' alt="Card image" />
      <h2 className="card-title">{title}</h2>
      <p className="card-description">{description}</p>
      <div className="card-footer">
        {inputType === "number" ? (<input type="number" id="numberInput" name="numberInput" />) : <></>}
        {inputType == "checkbox" ? <input type="checkbox" id="checkboxInput" name="checkboxInput" /> : <></>}
        {inputType == "radio" ? <input type="radio" id="radioInput" name="radioInput" /> : <></>}
      </div>
    </div>
  );
};

const ParamSection = () => {
  return (
  <section className='param-section'>
    <div className="warning-container">
      <p className="warning-text">
        Please provide the following information for a more accurate calculation
      </p>
    </div>
    <div className='card-container'>
      <Card 
          title="People"
          description="This is a very short description."
          inputType="number"
        />
      <Card 
          title="EV Car"
          description="yaaa"
          inputType = "number"  // Change to false for radio button
        />
    </div>
  </section>
  )
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
      <ParamSection />
    </LoadScript>
  )
}

export default App
