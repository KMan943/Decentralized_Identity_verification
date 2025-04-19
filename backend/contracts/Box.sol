// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IdentityVerification {
    address public verifier; // only this address can verify identities

    // identity hash => registration flag (1) or not (0)
    mapping(bytes32 => uint8) public registered;

    // identity hash => true if verified
    mapping(bytes32 => bool) public isVerified;

    event IdentityRegistered(bytes32 indexed identityHash);
    event IdentityVerified(bytes32 indexed identityHash);

    // Set the verifier (e.g., government, DAO)
    constructor(address _verifier) {
        verifier = _verifier;
    }

    /// @notice Registers an identity hash
    function registerIdentity(bytes32 identityHash) public {
        require(registered[identityHash] == 0, "Already registered");
        registered[identityHash] = 1;
        emit IdentityRegistered(identityHash);
    }

    /// @notice Verifies an identity (only by verifier)
    function verifyIdentity(bytes32 identityHash) public {
        require(msg.sender == verifier, "Not authorized");
        require(registered[identityHash] == 1, "Not registered");
        require(!isVerified[identityHash], "Already verified");

        isVerified[identityHash] = true;
        emit IdentityVerified(identityHash);
    }
}
