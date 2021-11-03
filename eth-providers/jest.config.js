module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.(test|spec).(ts|js)'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  testPathIgnorePatterns: [
    '/dist',
    '/lib',
    'evm-rpc-provider.test.ts',
    'rpc.test.ts' // TODO: remove these two after we have available WS endpoint
  ],
  transformIgnorePatterns: ['@polkadot+util-crypto.*/node_modules/@polkadot/util-crypto']
};
