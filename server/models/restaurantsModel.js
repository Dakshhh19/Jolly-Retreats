import createBaseServiceModel from './serviceModelFactory.js'

export const restaurantsModel = createBaseServiceModel({
  tableName: 'restaurants',
  serviceType: 'restaurant',
  selectColumns: [
    'id',
    'name',
    'cuisine_type',
    'location',
    'price_range',
    'rating',
    'description',
    'image_url'
  ],
  insertColumns: [
    { key: 'name', value: 'name' },
    { key: 'cuisine_type', value: 'cuisineType' },
    { key: 'location', value: 'location' },
    { key: 'price_range', value: 'priceRange' },
    { key: 'rating', value: 'rating' },
    { key: 'description', value: 'description' },
    { key: 'image_url', value: 'imageUrl' }
  ],
  updateColumns: [
    { key: 'name', value: 'name' },
    { key: 'cuisine_type', value: 'cuisineType' },
    { key: 'location', value: 'location' },
    { key: 'price_range', value: 'priceRange' },
    { key: 'rating', value: 'rating' },
    { key: 'description', value: 'description' },
    { key: 'image_url', value: 'imageUrl' }
  ]
})
