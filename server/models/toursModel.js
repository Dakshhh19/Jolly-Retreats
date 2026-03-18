import createBaseServiceModel from './serviceModelFactory.js'

export const toursModel = createBaseServiceModel({
  tableName: 'tours',
  serviceType: 'tour',
  selectColumns: [
    'id',
    'title',
    'description',
    'location',
    'price',
    'duration',
    'image_url',
    'created_at'
  ],
  insertColumns: [
    { key: 'title', value: 'title' },
    { key: 'description', value: 'description' },
    { key: 'location', value: 'location' },
    { key: 'price', value: 'price' },
    { key: 'duration', value: 'duration' },
    { key: 'image_url', value: 'imageUrl' }
  ],
  updateColumns: [
    { key: 'title', value: 'title' },
    { key: 'description', value: 'description' },
    { key: 'location', value: 'location' },
    { key: 'price', value: 'price' },
    { key: 'duration', value: 'duration' },
    { key: 'image_url', value: 'imageUrl' }
  ]
})
