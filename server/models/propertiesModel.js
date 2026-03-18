import createBaseServiceModel from './serviceModelFactory.js'

export const propertiesModel = createBaseServiceModel({
  tableName: 'properties',
  serviceType: 'property',
  insertColumns: [
    { key: 'name', value: 'name' },
    { key: 'location', value: 'location' },
    { key: 'price_per_night', value: 'pricePerNight' },
    { key: 'capacity', value: 'capacity' },
    { key: 'bedrooms', value: 'bedrooms' },
    { key: 'bathrooms', value: 'bathrooms' },
    { key: 'image_url', value: 'imageUrl' },
    { key: 'description', value: 'description' }
  ],
  updateColumns: [
    { key: 'name', value: 'name' },
    { key: 'location', value: 'location' },
    { key: 'price_per_night', value: 'pricePerNight' },
    { key: 'capacity', value: 'capacity' },
    { key: 'bedrooms', value: 'bedrooms' },
    { key: 'bathrooms', value: 'bathrooms' },
    { key: 'image_url', value: 'imageUrl' },
    { key: 'description', value: 'description' }
  ],
  selectColumns: [
    'id',
    'name',
    'location',
    'price_per_night',
    'capacity',
    'bedrooms',
    'bathrooms',
    'image_url',
    'description'
  ]
})
