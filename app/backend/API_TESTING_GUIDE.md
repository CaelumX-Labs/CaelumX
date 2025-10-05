# API Testing Guide for CaelumX

## Database is now seeded with test data! 🎉

### Test Wallet Addresses
- **User 1**: `Gjgvx2rJpkD4bwr6rRkMDXzVdwYBiPf1ayzhatceZ4di`
- **User 2**: `HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH`
- **User 3**: `DjVE6JNiYqPL2QXyCeHdH48eVwxoSK5RcGiGvBPh8X9Z`

## Available Test Data

### Projects
- **Amazon Rainforest Conservation** (APPROVED) - by User 1
- **Solar Farm Initiative** (PENDING) - by User 2
- **Ocean Plastic Cleanup** (REJECTED) - by User 3

### NFTs
- **NFT 1**: `NFTMint1ExampleAddressForTesting123456789` (owned by User 1, 5.5 tonnage)
- **NFT 2**: `NFTMint2ExampleAddressForTesting123456789` (owned by User 2, 10.0 tonnage)
- **NFT 3**: `NFTMint3ExampleAddressForTesting123456789` (owned by User 3, 2.5 tonnage, BURNED)

### Active Marketplace Listings
- **NFT 1** for 1 SOL (1,000,000,000 lamports)
- **NFT 2** for 2.5 SOL (2,500,000,000 lamports)

## API Endpoints to Test

### 1. Authentication (Required for most endpoints)

#### Get Challenge
```bash
curl -X POST http://localhost:3000/api/auth/get-challenge \
  -H "Content-Type: application/json" \
  -d '{"wallet": "Gjgvx2rJpkD4bwr6rRkMDXzVdwYBiPf1ayzhatceZ4di"}'
```

#### Verify Signature (Mock for testing)
```bash
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "Gjgvx2rJpkD4bwr6rRkMDXzVdwYBiPf1ayzhatceZ4di",
    "signature": "mock_signature_for_testing",
    "nonce": "mock_nonce_for_testing"
  }'
```

### 2. Registry Endpoints

#### Get All Projects
```bash
curl -X GET http://localhost:3000/api/registry/projects
```

#### Get Specific Project
```bash
curl -X GET http://localhost:3000/api/registry/projects/{project_id}
```

#### Vote on Project (requires auth)
```bash
curl -X POST http://localhost:3000/api/registry/projects/{project_id}/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -d '{"weight": 5}'
```

#### Submit New Project (requires auth + files)
```bash
curl -X POST http://localhost:3000/api/registry/projects \
  -H "Authorization: Bearer {your_jwt_token}" \
  -F "name=Test Project" \
  -F "description=Test project description" \
  -F "documents=@test-file.pdf"
```

### 3. Marketplace Endpoints

#### Get All Listings
```bash
curl -X GET http://localhost:3000/api/marketplace/listings
```

#### Create Listing (requires auth)
```bash
curl -X POST http://localhost:3000/api/marketplace/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -d '{
    "nftId": "{nft_id_from_database}",
    "price": 1500000000
  }'
```

### 4. Tokenization Endpoints

#### Mint NFT (requires auth)
```bash
curl -X POST http://localhost:3000/api/tokenization/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -d '{"projectId": "{approved_project_id}"}'
```

### 5. Retirement Endpoints

#### Retire NFT (requires auth)
```bash
curl -X POST http://localhost:3000/api/retirement/retire \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -d '{"nftId": "{nft_id_from_database}"}'
```

#### Get Retirement Certificate
```bash
curl -X GET http://localhost:3000/api/retirement/retirements/{retirement_id}/certificate
```

### 6. Analytics Endpoints

#### Get Dashboard Data (requires auth)
```bash
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer {your_jwt_token}"
```

## Notes for Testing

1. **Authentication**: Most endpoints require authentication. You'll need to:
   - Get a challenge nonce
   - Sign it with your wallet (or mock it for testing)
   - Use the returned JWT token in subsequent requests

2. **Database IDs**: Use the actual IDs from your database. You can check them by:
   ```bash
   # Connect to your database and run queries to get IDs
   # Or check the console output when seeding
   ```

3. **File Uploads**: For project submission, you'll need actual files to upload.

4. **Error Handling**: The API returns appropriate HTTP status codes and error messages.

## Quick Database Reset

To reset and reseed the database:
```bash
cd /Users/rhulam/Desktop/CaelumX-Labs/CaelumX/app/backend
npm run db:seed
```

## Start the Server

```bash
cd /Users/rhulam/Desktop/CaelumX-Labs/CaelumX/app/backend
npm run dev
```

The server will start on `http://localhost:3000`

## Health Check

```bash
curl -X GET http://localhost:3000/api/healthz
```

Should return: `OK`
