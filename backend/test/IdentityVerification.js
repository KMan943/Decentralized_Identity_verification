const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IdentityVerification", function () {
  let contract, verifier, user;
  const identity = ethers.keccak256(ethers.toUtf8Bytes("user@example.com"));

  beforeEach(async () => {
    [verifier, user] = await ethers.getSigners();
    const IdentityVerification = await ethers.getContractFactory("IdentityVerification");
    contract = await IdentityVerification.deploy(verifier.address);
  });

  it("should allow registration of a new identity", async () => {
    await contract.connect(user).registerIdentity(identity);
    expect(await contract.registered(identity)).to.equal(1n);
  });

  it("should not allow double registration", async () => {
    await contract.connect(user).registerIdentity(identity);
    await expect(contract.connect(user).registerIdentity(identity)).to.be.revertedWith("Already registered");
  });

  it("should allow verifier to verify identity", async () => {
    await contract.connect(user).registerIdentity(identity);
    await contract.connect(verifier).verifyIdentity(identity);
    expect(await contract.isVerified(identity)).to.equal(true);
  });

  it("should not allow non-verifier to verify identity", async () => {
    await contract.connect(user).registerIdentity(identity);
    await expect(contract.connect(user).verifyIdentity(identity)).to.be.revertedWith("Not authorized");
  });
});
