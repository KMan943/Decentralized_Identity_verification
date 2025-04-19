// ignition/modules/IdentityModule.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("IdentityModule", (m) => {
  const verifier = m.getAccount(0); // deployer as verifier

  const identityContract = m.contract("IdentityVerification", [verifier]);

  return { identityContract };
});
