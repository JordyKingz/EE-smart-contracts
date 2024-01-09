const EternalEntities = artifacts.require("EternalEntities");
//ipfs://QmeWTSjVCuFaYXXXwoLhvUBPyGaQYN7anoAadXDpYK6ix2/
module.exports = async(deployer, network, accounts) => {
  let deployOne = await deployer.deploy(EternalEntities, "ipfs://QmeWTSjVCuFaYXXXwoLhvUBPyGaQYN7anoAadXDpYK6ix2/");
  eeInstance  = await EternalEntities.deployed(); 
};
