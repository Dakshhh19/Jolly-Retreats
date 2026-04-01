import createBaseServiceModel from './serviceModelFactory.js'

export const treksModel = createBaseServiceModel({
  tableName: 'treks',
  serviceType: 'trek',
  selectColumns: [
    'id',
    'title',
    'difficulty_level',
    'location',
    'duration',
    'price',
    'description',
    'image_url'
  ],
  insertColumns: [
    { key: 'title', value: 'title' },
    { key: 'difficulty_level', value: 'difficultyLevel' },
    { key: 'location', value: 'location' },
    { key: 'duration', value: 'duration' },
    { key: 'price', value: 'price' },
    { key: 'description', value: 'description' },
    { key: 'image_url', value: 'imageUrl' }
  ],
  updateColumns: [
    { key: 'title', value: 'title' },
    { key: 'difficulty_level', value: 'difficultyLevel' },
    { key: 'location', value: 'location' },
    { key: 'duration', value: 'duration' },
    { key: 'price', value: 'price' },
    { key: 'description', value: 'description' },
    { key: 'image_url', value: 'imageUrl' }
  ]
})
