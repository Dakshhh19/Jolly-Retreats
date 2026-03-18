import createBaseServiceModel from './serviceModelFactory.js'

export const carRentalsModel = createBaseServiceModel({
  tableName: 'car_rentals',
  serviceType: 'car',
  selectColumns: [
    'id',
    'car_name',
    'company',
    'price_per_day',
    'location',
    'seats',
    'fuel_type',
    'image_url'
  ],
  insertColumns: [
    { key: 'car_name', value: 'carName' },
    { key: 'company', value: 'company' },
    { key: 'price_per_day', value: 'pricePerDay' },
    { key: 'location', value: 'location' },
    { key: 'seats', value: 'seats' },
    { key: 'fuel_type', value: 'fuelType' },
    { key: 'image_url', value: 'imageUrl' }
  ],
  updateColumns: [
    { key: 'car_name', value: 'carName' },
    { key: 'company', value: 'company' },
    { key: 'price_per_day', value: 'pricePerDay' },
    { key: 'location', value: 'location' },
    { key: 'seats', value: 'seats' },
    { key: 'fuel_type', value: 'fuelType' },
    { key: 'image_url', value: 'imageUrl' }
  ]
})
