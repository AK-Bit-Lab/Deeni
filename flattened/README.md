# Flattened Contracts for Verification

These files are ready to paste into a block explorer's **"Solidity (Single file)"**
contract verifier.

## Files

| File | Contract | Address (Celo mainnet) |
|------|----------|------------------------|
| `DeeniSubscription.sol` | `DeeniSubscription` | `0x0a254916F73A7b426abEEf24CEbC4bCAfD3a3aDD` |
| `DeeniDeeds.sol` | `DeeniDeeds` | `0xC8E75f3a0F1795FE4B60Fd18634657B6B98254A5` |
| `DeeniQuiz.sol` | `DeeniQuiz` | `0x12d3c130f4BdcEa1759A64399c3223Bbad1957c0` |
| `DeeniCombined.sol` | Subscription + Deeds in one file | _(use only if you deployed both from one file)_ |

All contracts are **already self-contained** — they have no `import` statements and no
OpenZeppelin dependencies, so the source in `contracts/` is identical to the flattened
source here. These copies exist purely so you have a clean file to upload.

## How to verify on Etherscan V2 (recommended)

Etherscan V2 supports Celo mainnet (chainid 42220) and its API is currently up while
CeloScan's is down.

1. Get a free Etherscan API key at https://etherscan.io/myapikey (one key works for V2
   across all chains).
2. Go to https://etherscan.io/verifyContract and switch the network to **Celo**,
   **or** go directly to:
   `https://api.etherscan.io/v2/api?chainid=42220&module=contract&action=verify`
3. Choose:
   - **Compiler type:** `Solidity (Single file)`
   - **Compiler version:** `v0.8.20` (match what Remix used — check the build tab)
   - **License:** `MIT`
   - **Optimization:** Enabled, 200 runs (match Remix settings)
4. Paste the contents of the matching `.sol` file from this folder.
5. Click **"Verify"**.

### Verify via API (curl)

```bash
# Replace YOUR_API_KEY and use the matching .sol file
curl -X POST "https://api.etherscan.io/v2/api?chainid=42220" \
  -d "module=contract" \
  -d "action=verifysourcecode" \
  -d "apikey=YOUR_API_KEY" \
  -d "address=0x12d3c130f4BdcEa1759A64399c3223Bbad1957c0" \
  -d "sourceCode=$(cat DeeniQuiz.sol)" \
  -d "contractname=DeeniQuiz" \
  -d "compilerversion=v0.8.20+commit.a1b79de6" \
  -d "optimizationUsed=1" \
  -d "runs=200" \
  -d "licenseType=3"
```

## How to verify on Blockscout (alternative)

Blockscout's Celo instance is also working:

1. Go to https://celoscan.com/address/YOUR_CONTRACT_ADDRESS?tab=contract_code
2. Click **"Verify & Publish"**.
3. Choose:
   - **Compiler type:** `Solidity (Single file)`
   - **Compiler version:** `v0.8.20`
   - **License:** `MIT`
4. Paste the contents of the matching `.sol` file.
5. Click **"Verify"**.

## How to verify on CeloScan (when API recovers)

1. Go to https://celoscan.io/address/YOUR_CONTRACT_ADDRESS#code
2. Click **"Verify & Publish"**.
3. Choose:
   - **Compiler type:** `Solidity (Single file)`
   - **Compiler version:** `v0.8.20` (match what Remix used — check the build tab)
   - **License:** `MIT`
4. Paste the contents of the matching `.sol` file from this folder.
5. Click **"Verify"**.

> ⚠️ If verification fails with a bytecode mismatch, double-check the exact compiler
> version Remix used (it may be `0.8.20+commit.a1b79de6` or similar) and toggle the
> **"Optimization"** setting to match how Remix compiled (usually **Enabled**, 200 runs).
