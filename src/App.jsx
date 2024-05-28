import PropTypes from 'prop-types'
import { useState, useRef, useEffect } from 'react'
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api'
import './styles/app.css'
import sunImage from './assets/sun.svg'
import solarImage from './assets/solar.svg'
import costImage from './assets/cost.svg'
import plusImage from './assets/plus.svg'
import minusImage from './assets/minus.svg'
import savingsImage from './assets/saving.svg'
import roiImage from './assets/ROI.svg'
import hotTubImage from './assets/hot-tub.svg'
import houseImage from './assets/house.svg'
import carImage from './assets/car.svg'
import airConditionerImage from './assets/air-conditioner.svg'
import peopleImage from './assets/people.svg'
import batteryImage from './assets/battery.svg'
import poolImage from './assets/pool.svg'
import solarArrayImage from './assets/solar_array.svg'
import {
  HouseSize,
  calculatePanelCount,
  calculateTotalConsumption,
  getCurrentMonthlyPaymentAndTotalCostWithoutChange,
  getTotalCostAfterSolar,
  getDataLayer,
  getDataLayers,
  getSolarData,
  getInstallation,
  getROI
} from './api'

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

const Sidebar = ({ onAddressChange, states }) => {
  const {
    expectedProduced,
    setExpectedProduced,
    expectedConsumed,
    setExpectedConsumed,
    expectedCost,
    setExpectedCost,
    savings,
    setSavings,
    address,
    setAddress,
    maxSolarPanels,
    setMaxSolarPanels,
    maxArrayAreaMeters2,
    setMaxArrayAreaMeters2,
    ROI,
    setROI,
    sunshineHours,
    setSunshineHours,
    battery,
    setBattery,
    house,
    setHouse,
    energyPrize,
    setEnergyPrize,
    sauna,
    setSauna,
    ev,
    setEV,
    ac,
    setAC,
    hotTub,
    setHotTub,
    pool,
    setPool,
    kwhBattery,
    setkwhBattery,
    heating,
    setHeating,
    people,
    setPeople,
    kwpSolar,
    setKwpSolar,
  } = states

  console.log('batarya', battery)

  const autocompleteRef = useRef(null)

  useEffect(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.addListener('place_changed', handlePlaceSelect)
    }
  }, [])

  const removeSecondary = () => {
    // Get all elements with the class 'secondary'
    const elements = document.getElementsByClassName('secondary')

    // Convert the HTMLCollection to an array to safely modify the class list
    const elementsArray = Array.from(elements)

    // Loop through each element and remove the 'secondary' class
    elementsArray.forEach((element) => {
      element.classList.remove('secondary')
    })
  }

  useEffect(() => {
    handlePlaceSelect()
  }, [house, energyPrize, people, ev, battery, ac, pool, hotTub])

  const handlePlaceSelect = async () => {
    const place = autocompleteRef.current.getPlace()
    removeSecondary()
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
      setMaxArrayAreaMeters2(solarData.maxArrayAreaMeters2.toFixed(2))

      // this is how you can get the data layers
      // const dataLayers = await getDataLayers(lat, lng)
      // const res = await getDataLayer(dataLayers.rgbUrl)

      // const panelCount = solarData.maxArrayPanelsCount
      const panels = solarData.solarPanelConfigs
      // const panelCapacityWatts = solarData.panelCapacityWatts

      // Example of usage:
      const _battery = battery === 1 ? true : false
      const energyPrize = 5
      const totalConsumption = calculateTotalConsumption({
        people: people,
        ev: ev,
        sauna: sauna,
        pool: pool,
        houseSize: house,
        hotTub: hotTub
      })
      const { currentMonthlyPayment, totalCostWithoutChange } = getCurrentMonthlyPaymentAndTotalCostWithoutChange(
        energyPrize,
        totalConsumption
      )
      const { panelCount, yearlyEnergyDcKwh } = calculatePanelCount(_battery, totalConsumption, panels)
      const { kwpSolar, kwhBattery, installationCost } = getInstallation(panelCount, _battery)
      const totalCostAfterSolar = getTotalCostAfterSolar(yearlyEnergyDcKwh, energyPrize, totalConsumption)
      const roi = getROI(installationCost, totalCostAfterSolar / 12 / 30, currentMonthlyPayment).toFixed(2)

      console.log({
        totalConsumption,
        currentMonthlyPayment,
        totalCostWithoutChange,
        panelCount,
        yearlyEnergyDcKwh,
        kwpSolar,
        kwhBattery,
        installationCost,
        totalCostAfterSolar,
        roi
      })

      setExpectedProduced(yearlyEnergyDcKwh.toFixed(2))
      setExpectedConsumed(totalConsumption)
      setROI(roi)
      setMaxSolarPanels(panelCount)
      setkwhBattery(kwhBattery.toFixed(2))
      setExpectedCost(installationCost.toFixed(2))
      setSavings(Math.abs(totalCostAfterSolar + installationCost - totalCostWithoutChange).toFixed(2))
      setKwpSolar(kwpSolar.toFixed(2))
    }
  }

  return (
    <>
      <div className='SidebarContainer'>
        <div className='SidebarItem' style={{ paddingBottom: '25px' }}>
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
        <div className='SidebarItem'>
          <h2>Household Information</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={houseImage} style={{ marginLeft: '-2px' }}></img>
              <div className='sideBar-content-item'>House Size</div>
            </div>
            <select
              defaultValue='medium'
              onChange={(e) => {
                setHouse(e.target.value.toUpperCase())
              }}
            >
              <option value='small'>Small (100 sqm)</option>
              <option value='medium'>Medium (150 sqm)</option>
              <option value='large'>Large (250 sqm)</option>
            </select>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={batteryImage}></img>
              <div className='meter-container sideBar-content-item'>Energy Price</div>
            </div>
            <input
              className='household-info'
              type='number'
              name='energyPrize'
              id='energyPrize'
              onChange={(e) => {
                setenergyPrize(e.target.value)
              }}
              defaultValue={energyPrize}
            />
          </div>
        </div>
        <div className='SidebarItem secondary'>
          <h2>General Information</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={sunImage} style={{ marginLeft: '-2px' }}></img>
              <div className='sideBar-content-item'>Sunshine hours/year:</div>
            </div>
            <div>{sunshineHours}</div>
          </div>
          {/* <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={areaImage}></img>
              <div className='meter-container sideBar-content-item'>
                Area meters<span className='meter-square'>2&nbsp;</span>
              </div>
            </div>
            <div>{maxArrayAreaMeters2}</div>
          </div> */}
          
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={batteryImage}></img>
              <div className='meter-container sideBar-content-item'>
                Optimal battery capacity
              </div>
            </div>
            <div>{kwhBattery} kWh</div>
          </div>

          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={solarArrayImage}></img>
              <div className='meter-container sideBar-content-item'>
                Optimal Solar Array
              </div>
            </div>
            <div>{kwpSolar} kWp</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={solarImage}></img>
              <div className='meter-container sideBar-content-item'>Optimal Panel Count</div>
            </div>
            <div>{maxSolarPanels}</div>
          </div>
        </div>
        <div className='SidebarItem secondary'>
          <h2>Expected</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={plusImage} style={{ width: '20px' }}></img>
              <div className='meter-container sideBar-content-item'>Produced</div>
            </div>
            <div>{expectedProduced} kWh</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={minusImage} style={{ width: '20px' }}></img>
              <div className='meter-container sideBar-content-item'>Consumed</div>
            </div>
            <div>{expectedConsumed} kWh</div>
          </div>
        </div>
        <div className='SidebarItem secondary'>
          <h2>Financial:</h2>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={savingsImage}></img>
              <div className='meter-container sideBar-content-item'>Saving</div>
            </div>
            <div>{savings} Kč</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={costImage}></img>
              <div className='meter-container sideBar-content-item'>Cost</div>
            </div>
            <div>{expectedCost} Kč</div>
          </div>
          <div className='item-container'>
            <div className='item-label-container'>
              <img className='item-svg' src={roiImage}></img>
              <div className='meter-container sideBar-content-item'>Return On Investment</div>
            </div>
            <div>{ROI} Years</div>
          </div>
        </div>
      </div>
    </>
  )
}

Sidebar.propTypes = {
  onAddressChange: PropTypes.func.isRequired
}

const Card = ({ title, description, inputType, val, src, setter }) => {
  return (
    <div className='card'>
      <div className='card-title-container'>
        <img src={src} className='card-image' alt='Card image' />
        <h2 className='card-title'>{title}</h2>
      </div>
      <p className='card-description'>{description}</p>
      <div className='card-footer'>
        {inputType === 'number' ? (
          <input
            onChange={(e) => {
              setter(e.target.value)
            }}
            value={val}
            type='number'
            id='numberInput'
            name='numberInput'
          />
        ) : (
          <></>
        )}
        {inputType == 'checkbox' ? (
          <input
            onChange={(e) => {
              setter(e.target.checked ? 1 : 0)
            }}
            checked={val === 1 ? true : false}
            type='checkbox'
            id='checkboxInput'
            name='checkboxInput'
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const ParamSection = (states) => {
  const { battery, setBattery, ev, setEV, ac, setAC, hotTub, setHotTub, pool, setPool, people, setPeople } = states.states

  return (
    <section className='param-section secondary'>
      <div className='card-container'>
        <Card
          title='People'
          description='How many people live in your household?'
          inputType='number'
          src={peopleImage}
          val={people}
          setter={setPeople}
        />
        <Card
          title='EV Car'
          description='How many electric vehicles do you have in your household?'
          inputType='number' // Change to false for radio button
          src={carImage}
          val={ev}
          setter={setEV}
        />
        <Card
          title='Battery Storage'
          description='Do you want battery storage installed at your house?'
          inputType='checkbox' // Change to false for radio button
          src={batteryImage}
          val={battery}
          setter={setBattery}
        />
        <Card
          title='Swimming Pool'
          description='Do you have a swimming pool at your house?'
          inputType='checkbox' // Change to false for radio button
          src={poolImage}
          val={pool}
          setter={setPool}
        />
        <Card
          title='Hot Tub'
          description='Do you have a hot tub at your house?'
          inputType='checkbox' // Change to false for radio button
          src={hotTubImage}
          val={hotTub}
          setter={setHotTub}
        />
        <Card
          title='AC'
          description='Do you have air conditioning at your house?'
          inputType='checkbox' // Change to false for radio button
          src={airConditionerImage}
          val={ac}
          setter={setAC}
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

  const [address, setAddress] = useState('')
  const [expectedProduced, setExpectedProduced] = useState('-')
  const [expectedConsumed, setExpectedConsumed] = useState('-')
  const [expectedCost, setExpectedCost] = useState('-')
  const [savings, setSavings] = useState('-')
  const [maxSolarPanels, setMaxSolarPanels] = useState('-')
  const [maxArrayAreaMeters2, setMaxArrayAreaMeters2] = useState('-')
  const [ROI, setROI] = useState('-')
  const [sunshineHours, setSunshineHours] = useState('-')
  const [battery, setBattery] = useState(0)
  const [house, setHouse] = useState(HouseSize.MEDIUM)
  const [energyPrize, setenergyPrize] = useState(5)
  const [sauna, setSauna] = useState(0)
  const [ev, setEV] = useState(0)
  const [ac, setAC] = useState(0)
  const [hotTub, setHotTub] = useState(0)
  const [pool, setPool] = useState(0)
  const [kwhBattery, setkwhBattery] = useState(0)
  const [heating, setHeating] = useState(0)
  const [people, setPeople] = useState(2)
  const [kwpSolar, setKwpSolar] = useState("-")

  const states = {
    kwpSolar,
    setKwpSolar,
    setenergyPrize,
    expectedProduced,
    setExpectedProduced,
    expectedConsumed,
    setExpectedConsumed,
    expectedCost,
    setExpectedCost,
    savings,
    setSavings,
    address,
    setAddress,
    maxSolarPanels,
    setkwhBattery,
    setMaxSolarPanels,
    maxArrayAreaMeters2,
    setMaxArrayAreaMeters2,
    ROI,
    setROI,
    sunshineHours,
    setSunshineHours,
    battery,
    setBattery,
    house,
    setHouse,
    energyPrize,
    sauna,
    setSauna,
    ev,
    setEV,
    ac,
    setAC,
    hotTub,
    setHotTub,
    pool,
    setPool,
    kwhBattery,
    heating,
    setHeating,
    people,
    setPeople
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={['places']}>
      <div className='container'>
        <MapComponent apiKey={apiKey} center={center} states={states} />
        <Sidebar onAddressChange={handleAddressChange} states={states} />
      </div>
      <ParamSection states={states} />
    </LoadScript>
  )
}

export default App
