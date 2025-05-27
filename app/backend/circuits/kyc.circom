pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

/*
 * KYC Zero-Knowledge Proof Circuit for CaelumX
 * 
 * This circuit allows users to prove they meet KYC requirements
 * without revealing their personal information.
 * 
 * It verifies:
 * 1. User is above minimum age (18)
 * 2. User is from an approved jurisdiction
 * 3. User's identity hash matches the one stored in the registry
 */
template KYCVerification() {
    // Private inputs (not revealed)
    signal input age;
    signal input jurisdictionCode; // Country/region code
    signal input fullName;
    signal input documentId;
    
    // Public inputs (revealed)
    signal input minRequiredAge;
    signal input registryIdentityHash;
    signal input allowedJurisdictions[10]; // Array of allowed jurisdiction codes
    
    // Output signals
    signal output isVerified;
    signal output identityCommitment;
    
    // Age verification
    component ageCheck = GreaterEqThan(8); // 8 bits for age (0-255)
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minRequiredAge;
    
    // Jurisdiction verification
    component jurisdictionChecks[10];
    signal jurisdictionAllowed[10];
    
    for (var i = 0; i < 10; i++) {
        jurisdictionChecks[i] = IsEqual();
        jurisdictionChecks[i].in[0] <== jurisdictionCode;
        jurisdictionChecks[i].in[1] <== allowedJurisdictions[i];
        jurisdictionAllowed[i] <== jurisdictionChecks[i].out;
    }
    
    // At least one jurisdiction must match
    signal jurisdictionValid;
    jurisdictionValid <== jurisdictionAllowed[0] + jurisdictionAllowed[1] + 
                         jurisdictionAllowed[2] + jurisdictionAllowed[3] + 
                         jurisdictionAllowed[4] + jurisdictionAllowed[5] + 
                         jurisdictionAllowed[6] + jurisdictionAllowed[7] + 
                         jurisdictionAllowed[8] + jurisdictionAllowed[9];
    
    // Identity hash verification
    component identityHasher = Poseidon(3);
    identityHasher.inputs[0] <== fullName;
    identityHasher.inputs[1] <== documentId;
    identityHasher.inputs[2] <== age;
    
    component hashCheck = IsEqual();
    hashCheck.in[0] <== identityHasher.out;
    hashCheck.in[1] <== registryIdentityHash;
    
    // Generate identity commitment for on-chain storage
    identityCommitment <== identityHasher.out;
    
    // Final verification (all conditions must be met)
    isVerified <== ageCheck.out * (jurisdictionValid > 0 ? 1 : 0) * hashCheck.out;
}

component main {public [minRequiredAge, registryIdentityHash, allowedJurisdictions]} = KYCVerification();
