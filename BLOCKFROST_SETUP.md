# 🔧 Blockfrost API Setup Guide

## Why You Need Blockfrost

Your vesting platform needs a Blockfrost API key to:
- ✅ Submit transactions to Cardano blockchain
- ✅ Query UTXOs for withdrawals  
- ✅ Fetch account balances and transaction history
- ✅ Enable full MeshSDK functionality

## 🚀 Quick Setup (5 minutes)

### 1. Get Free Blockfrost API Key
1. Go to **[blockfrost.io](https://blockfrost.io)**
2. **Sign up** for a free account
3. **Create a new project**:
   - **Mainnet** for production
   - **Preprod** for testing
4. **Copy your API key** (starts with `mainnet` or `preprod`)

### 2. Add API Key to Your Website

Open `index.html` and find this line (around line 804):
```javascript
const blockfrostApiKey = 'previewABCDEF1234567890'; // You need to set this
```

**Replace with your real API key:**
```javascript
// For mainnet (real money):
const blockfrostApiKey = 'mainnetYourRealApiKeyHere123456789';

// For testnet (testing):
const blockfrostApiKey = 'preprodYourTestApiKeyHere123456789';
```

### 3. Deploy and Test
1. **Save** the file
2. **Deploy** to Netlify/your hosting
3. **Test** wallet connection and transactions

## 🔒 Security Notes

- ✅ **Blockfrost API keys are safe** to use in frontend code
- ✅ They only provide **read access** and **transaction submission**
- ✅ They **cannot spend funds** or access private keys
- ⚠️ Use **testnet keys** for development
- ⚠️ Use **mainnet keys** for production

## 🐛 Troubleshooting

### "MeshSDK not fully loaded"
- ✅ Add your Blockfrost API key
- ✅ Check internet connection
- ✅ Refresh the page

### CORS Errors
- ✅ This is normal - the fallback system handles it
- ✅ Your contract will still work
- ✅ Adding Blockfrost key improves reliability

### Wallet Balance Shows Hex
- ✅ This is fixed in the latest version
- ✅ The fallback CBOR parser handles Eternl/other wallets

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Verify your API key format
3. Test on testnet first
4. Ensure wallet is connected

**Your vesting platform is working! Just add the API key for full functionality.** 🎯
