const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    mainnet: {
      provider: function() {
        return new HDWalletProvider(
            `${process.env.MNEMONIC}`, 
            `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_ID}`
        )
      },
    network_id: 1,
	  gas: 4331445,
	  gasPrice: 60000000000,
	  networkCheckTimeout: 1000000,
    timeoutBlocks: 50000,
	  websockets: true,
	},
  },
compilers: {
    solc: {
      version: "^0.8.7",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
          }
        }
      }
    },
plugins: ['truffle-plugin-verify'], 
api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  } 
};