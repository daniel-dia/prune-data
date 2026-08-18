export default {
  inPlace: true,
  mutate: ['src/**/*.ts'],
  testRunner: 'command',
  commandRunner: {
    command: 'npm test',
  },
  reporters: ['clear-text', 'progress'],
};