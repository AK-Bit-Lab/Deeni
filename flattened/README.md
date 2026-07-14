# Flattened Contracts for CeloScan Verification

These files are ready to paste into CeloScan's **"Solidity (Single file)"** contract verifier.

## Files

| File | Contract | Address |
|------|----------|---------|
| `DeeniSubscription.sol` | `DeeniSubscription` | `0x0a254916F73A7b426abEEf24CEbC4bCAfD3a3aDD` |
| `DeeniDeeds.sol` | `DeeniDeeds` | _(set after deploying)_ |
| `DeeniCombined.sol` | Both contracts in one file | _(use only if you deployed both from one file)_ |

Both contracts are **already self-contained** — they have no `import` statements and no
OpenZeppelin dependencies, so the source in `contracts/` is identical to the flattened
source here. These copies exist purely so you have a clean file to upload.

## How to verify on CeloScan

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
