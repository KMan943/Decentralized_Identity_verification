// scripts/deploy.js
async function main () {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);

  // Replace 'Box' with your contract name
  const IdentityVerification = await ethers.getContractFactory('IdentityVerification');

  // Pass the constructor argument here (e.g., deployer as the verifier)
  const contract = await IdentityVerification.deploy(deployer.address);

  await contract.waitForDeployment();

  console.log('IdentityVerification deployed to:', await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
