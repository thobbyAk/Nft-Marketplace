require("@nomiclabs/hardhat-waffle");

const fs =require("fs")
const privateKey = fs.readFileSync(".secret").toString();
const projectId = "9a90b1de94af4668ab0a611d914dcd32"


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks:{
    hardhat:{ 
      chainId:1337,
       
    },
    mumbai:{
      url:`https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts:[privateKey]
    },
    mainet:{ 
      url:`https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts:[privateKey]

    }

  },
  solidity: "0.8.4",
};
