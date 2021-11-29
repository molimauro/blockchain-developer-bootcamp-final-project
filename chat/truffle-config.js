const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require("dotenv");
dotenv.config();
const mnemonic = process.env.ROPSTEN_MNEMONIC;

module.exports = {
	// See <http://truffleframework.com/docs/advanced/configuration>
	// to customize your Truffle configuration!
	networks: {
		develop: {
			host: "127.0.0.1",
			port: 8545,
			network_id: "1337",
		},
		ropsten: {
			provider: () =>
				new HDWalletProvider(
					mnemonic,
					`https://ropsten.infura.io/v3/${process.env.ROPSTEN_INFURA_PROJECT_ID}`
				),
			network_id: 3, // Ropsten's id
			gas: 5500000, // Ropsten has a lower block limit than mainnet
			confirmations: 0, // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
		},
	},
	compilers: {
		solc: {
			version: "pragma", // Fetch exact version from solc-bin (default: truffle's version)
			// docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
			// settings: {          // See the solidity docs for advice about optimization and evmVersion
			//  optimizer: {
			//    enabled: false,
			//    runs: 200
			//  },
			//  evmVersion: "byzantium"
			// }
		},
	},
};
