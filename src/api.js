const API_KEY = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY
const BASE_URL = 'https://solar.googleapis.com/v1'

/**
 * Fetch solar data for a given location (latitude and longitude).
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<object>} - A promise that resolves to the solar data.
 */
export async function getSolarData(latitude, longitude) {
  const url = `${BASE_URL}/buildingInsights:findClosest?location.latitude=${latitude}&location.longitude=${longitude}&requiredQuality=HIGH&key=${API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error fetching solar data: ${response.statusText}`)
    }

    const { solarPotential } = await response.json()

    return solarPotential
  } catch (error) {
    console.error('Error fetching solar data:', error)
    throw error
  }
}

export async function getDataLayers(latitude, longitude, radius = 100) {
  const url = `${BASE_URL}/dataLayers:get?location.latitude=${latitude}&location.longitude=${longitude}&radiusMeters=${radius}&key=${API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error fetching data layers: ${response.statusText}`)
    }

    const { dsmUrl, rgbUrl, annualFluxUrl, imageryQuality, maskUrl } = await response.json()

    return { dsmUrl, rgbUrl, annualFluxUrl, imageryQuality, maskUrl }
  } catch (error) {
    console.error('Error fetching data layers:', error)
    throw error
  }
}

export async function getDataLayer(dataLayerUrl) {
  try {
    const response = await fetch(`${dataLayerUrl}&key=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`Error fetching data layer: ${response.statusText}`)
    }

    return response.blob()
  } catch (error) {
    console.error('Error fetching data layer:', error)
    throw error
  }
}

export const HouseSize = {
  SMALL: 'SMALL', // up to 100sqm
  MEDIUM: 'MEDIUM', // 100-250sqm
  LARGE: 'LARGE' // 250sqm+
}

export function calculateTotalConsumption(items) {
  let totalConsumption = 0

  if (items.people > 0) {
    totalConsumption += items.people * 1000
  }

  if (items.ev > 0) {
    totalConsumption += items.ev * 905
  }

  if (items.sauna > 0) {
    totalConsumption += items.sauna * 2700
  }

  if (items.hotTub > 0) {
    totalConsumption += items.hotTub * 1500
  }

  switch (items.houseSize) {
    case HouseSize.SMALL:
      if (items.ac > 0) {
        totalConsumption += items.ac * 1250
      }
      if (items.pool > 0) {
        totalConsumption += items.pool * 1500
      }
      break
    case HouseSize.MEDIUM:
      if (items.ac > 0) {
        totalConsumption += items.ac * 2000
      }
      if (items.pool > 0) {
        totalConsumption += items.pool * 2000
      }
      break
    case HouseSize.LARGE:
      if (items.ac > 0) {
        totalConsumption += items.ac * 4000
      }
      if (items.pool > 0) {
        totalConsumption += items.pool * 3000
      }
      break
  }

  return totalConsumption
}

// energy prize should be default 5
export function getCurrentMonthlyPaymentAndTotalCostWithoutChange(energyPrize, totalConsumption) {
  const currentMonthlyPayment = 500 + energyPrize * (totalConsumption / 12)
  return { currentMonthlyPayment, totalCostWithoutChange: currentMonthlyPayment * 12 * 30 }
}

//Total consumption is coming from calculateTotalConsumption function
export function calculatePanelCount(battery, totalConsumption, panelsArray) {
  console.log({ panelsArray })
  const consumptionCoefficient = battery ? 0.8 : 0.5

  const targetProduction = consumptionCoefficient * totalConsumption

  for (let i = 0; i < panelsArray.length; i++) {
    if (panelsArray[i].yearlyEnergyDcKwh >= targetProduction) {
      return { panelCount: panelsArray[i].panelsCount, yearlyEnergyDcKwh: panelsArray[i].yearlyEnergyDcKwh }
    }
  }
  // this is just a fallback return
  return 5
}

export function getInstallation(panelCount, battery) {
  const kwpSolar = panelCount * 0.4
  const kwhBattery = kwpSolar * 1.8
  const installationCost = 25000 * kwpSolar + (battery ? 10000 : 0) * kwhBattery

  return { kwpSolar, kwhBattery, installationCost }
}

export function getTotalCostAfterSolar(yearlyEnergyDcKwh, currentEnergyPrize, totalConsumption) {
  const consumptionAfterSolar = totalConsumption - yearlyEnergyDcKwh
  const monthlyPaymentAfterSolar = 500 + currentEnergyPrize * (consumptionAfterSolar / 12)
  return monthlyPaymentAfterSolar * 12 * 30
}

export function getROI(installationCost, monthlyPaymentAfterSolar, currentMonthlyPayment) {
  const roi = installationCost / ((currentMonthlyPayment - monthlyPaymentAfterSolar) * 12)
  return roi
}
