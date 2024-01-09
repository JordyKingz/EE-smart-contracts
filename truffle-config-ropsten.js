const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
            `${process.env.MNEMONIC}`, 
            `wss://ropsten.infura.io/ws/v3/${process.env.INFURA_ID}`
        )
      },
      network_id: 3,
	  // gas: 4721975,
	  // gasPrice: 350000000000,
	  //skipDryRun: true,
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