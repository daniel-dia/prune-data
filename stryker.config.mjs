export default {
  mutate: ['src/**/*.ts'],
  testRunner: 'command',
  commandRunner: {
    command: 'npm test',
  },
  reporters: ['clear-text', 'progress'],
};