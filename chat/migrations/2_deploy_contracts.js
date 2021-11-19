var FriendsContract = artifacts.require("./Friends.sol");

module.exports = function (deployer) {
  deployer.deploy(FriendsContract);
};
