# Technical Investigation Report: Payment Authorization Data-Flow Bug

**Investigation Scope:** 
- Root cause tracing for **Bug 1 (399 ETB → 849 ETB)**
- Root cause tracing for **Bug 2 (Payment Method defaulting to CBE)**
- End-to-end data lifecycle from user submission to database persistence and Admin Authorization display
- **Status:** Investigation only; no code or database changes have been applied.

---

### 1. Executive Summary

Both issues originate entirely in the frontend client logic of the listing creation wizard (`CreateListingModal.tsx` and `WizardStep4Review.tsx`) before the transaction data is transmitted to the server:

1. **Bug 1 (399 ETB → 849 ETB):** When the user selects **VIP Elite Boost (399 ETB)**, a callback in `CreateListingModal.tsx` silently toggles two internal addon boolean flags: `isFeaturedAddon = true` (+300 ETB) and `isTopAdAddon = true` (+150 ETB). While the user-facing modal UI in `WizardStep4Review.tsx` explicitly shows **399 ETB** ("Total Payable"), the underlying submission handler calculates `totalCost = 399 + 300 + 150 = 849 ETB` and sends `849` in the payload to `POST /api/receipts`.
2. **Bug 2 (Payment Method defaulting to CBE):** In `WizardStep4Review.tsx`, a `useEffect` automatically forces the selected payment method state to `activeMethods[0].id` on mount. Because **CBE Bank** is configured as the first item in both the backend payment methods list and the fallback array, the system pre-selects and locks in CBE before the customer even interacts with the payment options.

---

### 2. End-to-End Transaction Data Flow

```
[User selects VIP Elite (399 ETB)]
              │
              ▼
[setSelectedPlan in CreateListingModal.tsx]
  • Sets selectedPlan = 'vip' (baseCost: 399 ETB)
  • Automatically sets isFeaturedAddon = true (featuredPrice: 300 ETB)
  • Automatically sets isTopAdAddon = true (topAdPrice: 150 ETB)
              │
              ├──► [WizardStep4Review.tsx UI renders to User]
              │     • Shows selectedPackage.price = 399 ETB
              │     • Displays "Total Payable: 399 ETB"
              │     • Displays "Transfer exact package amount (399 ETB)"
              │     • Button displays "SUBMIT PAYMENT RECEIPT & PUBLISH (399 ETB)"
              │     • useEffect automatically forces selectedDirectMethodId = 'pay-cbe'
              │
              ▼
[User Clicks "SUBMIT PAYMENT RECEIPT & PUBLISH"]
  • CreateListingModal.tsx executes handleFinalPublish()
  • Calculates: totalCost = baseCost(399) + addonTopCost(150) + addonFeaturedCost(300) = 849 ETB
  • Resolves directMethod = paymentMethods.find(m => m.id === 'pay-cbe') -> "CBE Bank (...)"
              │
              ▼
[HTTP Request: POST /api/receipts]
  • Body: {
      amount: 849,
      paymentMethodId: "pay-cbe",
      paymentMethodName: "CBE Bank (Commercial Bank of Ethiopia)",
      relatedPropertyId: "...",
      relatedPropertyTitle: "...",
      ...
    }
              │
              ▼
[Backend: server.ts:4701 app.post('/api/receipts')]
  • Stores payload verbatim into localDb.receipts and MongoDB ReceiptModel:
    PaymentReceipt {
      amount: 849,
      paymentMethodId: "pay-cbe",
      paymentMethodName: "CBE Bank (Commercial Bank of Ethiopia)",
      status: "Pending"
    }
              │
              ▼
[Admin Dashboard: AdminDashboard.tsx lines 4318 & 5747]
  • Queries GET /api/receipts
  • Renders rec.amount -> "849 ETB"
  • Renders rec.paymentMethodName -> "CBE Bank (Commercial Bank of Ethiopia)"
```

---

### 3. Detailed Root Cause Analysis: Bug 1 (Wrong Payment Amount)

#### A. Where the Arithmetic Occurs
In `/src/components/CreateListingModal.tsx`:
- **Line 805–806:**
  ```typescript
  const topAdPrice = systemSettings?.marketplaceSettings?.topAdPrice ?? 150;
  const featuredPrice = systemSettings?.marketplaceSettings?.featuredAdPrice ?? 300;
  ```
- **Line 868–871:**
  ```typescript
  const baseCost = selectedPlanObj ? selectedPlanObj.cost : 0; // 399 for VIP Elite
  const addonTopCost = isTopAdAddon ? topAdPrice : 0;          // 150
  const addonFeaturedCost = isFeaturedAddon ? featuredPrice : 0; // 300
  const totalCost = baseCost + addonTopCost + addonFeaturedCost; // 399 + 150 + 300 = 849
  ```

#### B. Why the Hidden Addon Flags Were Activated
In `/src/components/CreateListingModal.tsx` lines 1378–1388:
```typescript
selectedPlan={selectedPlan}
setSelectedPlan={(val: any) => {
  setSelectedPlan(val);
  if (val === 'free') {
    setIsFeaturedAddon(false);
    setIsTopAdAddon(false);
  } else {
    setIsFeaturedAddon(true);
    if (val === 'vip') setIsTopAdAddon(true);
  }
}}
```
When the user selected package `'vip'`, `setSelectedPlan` intentionally turned on `isFeaturedAddon` and `isTopAdAddon` under the assumption that the VIP tier provides both Top Ad and Featured placement. However, instead of treating them as feature descriptors included in the 399 ETB package, the code added their standalone individual prices (300 ETB + 150 ETB) to the base price.

#### C. The Discrepancy Between What the User Saw and What Was Sent
In `/src/components/wizard/WizardStep4Review.tsx`:
- Line 604: `{selectedPackage.price} ETB` → Renders **399 ETB**
- Line 611: `Transfer the exact package amount (399 ETB)...`
- Line 772: `SUBMIT PAYMENT RECEIPT & PUBLISH (${selectedPackage.price} ETB)` → Renders **399 ETB**

In `/src/components/CreateListingModal.tsx` line 1216:
```typescript
await fetch('/api/receipts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...
    amount: totalCost, // Passes 849 instead of selectedPackage.price (399)
    ...
  })
});
```

---

### 4. Detailed Root Cause Analysis: Bug 2 (Wrong Payment Method)

#### A. The Unconditional Auto-Select Hook
In `/src/components/wizard/WizardStep4Review.tsx` lines 212–217:
```typescript
// Auto-select first active payment method if none selected
useEffect(() => {
  if ((!selectedDirectMethodId || !activeMethods.some((m: any) => m.id === selectedDirectMethodId)) && activeMethods.length > 0) {
    setSelectedDirectMethodId(activeMethods[0].id);
  }
}, [activeMethods, selectedDirectMethodId, setSelectedDirectMethodId]);
```

#### B. Why It Resolves Specifically to "CBE"
1. In `server.ts` line 262–271, the database default payment methods list starts with:
   - Index 0: `id: 'pay-cbe'`, `name: 'CBE Bank (Commercial Bank of Ethiopia)'` (isActive: true)
   - Index 1: `id: 'pay-telebirr'`, `name: 'Telebirr Wallet'` (isActive: true)
   - Index 2: `id: 'pay-awash'`, `name: 'Awash Bank'` (isActive: false)
2. In `WizardStep4Review.tsx` line 183–191, the component's internal fallback list has the identical ordering: index 0 is `pay-cbe`.
3. Consequently, `activeMethods[0].id` is always `'pay-cbe'`.
4. As soon as the step renders, `selectedDirectMethodId` is set to `'pay-cbe'`, before the customer ever touches a payment method card.

#### C. Bypassed Validation
`WizardStep4Review.tsx` line 144 has a guard:
```typescript
if (!selectedDirectMethodId) {
  setPaymentError('Please select the payment method you used (CBE, Telebirr, or Awash Bank).');
  return;
}
```
Because of the auto-select `useEffect`, `selectedDirectMethodId` is never falsy. The customer is never required to make an active choice, so any payment made via Telebirr or an unselected channel is submitted with `paymentMethodId: 'pay-cbe'`.

#### D. Answers to Specific Behavioral Questions
- **If the customer has not selected a payment method, how does the system behave?**  
  It silently defaults to the first active method in the configured list (`pay-cbe`).
- **Does it fall back to CBE?**  
  Yes, both the API response and the component's fallback structure place CBE in the first active slot.
- **Does it read a stale value?**  
  No, it reads the freshly auto-selected state initialized by the `useEffect`.
- **Does the backend substitute CBE?**  
  No. The backend (`app.post('/api/receipts')`) accepts whatever `paymentMethodId` and `paymentMethodName` are passed in the request body.
- **Does the database store CBE?**  
  Yes. The database faithfully stores the `paymentMethodId` and `paymentMethodName` provided by the frontend POST call.

---

### 5. Database & Server Evidence

Inspection of `server.ts` confirms:
1. `app.post('/api/receipts')` (lines 4701–4734) performs no price re-calculation or payment method override:
   ```typescript
   const newReceipt: PaymentReceipt = {
     id: 'rcpt-' + Date.now(),
     status: 'Pending',
     submittedAt: new Date().toISOString(),
     ...receiptData, // Accepts raw client values
     receiptUrlOrFile: processedReceiptUrl
   };
   localDb.receipts.push(newReceipt);
   ```
2. The database receives and stores `amount: 849` and `paymentMethodName: "CBE Bank (Commercial Bank of Ethiopia)"`.
3. `AdminDashboard.tsx` (lines 4318 & 5747) displays the persisted record directly from the database without any transformation:
   ```tsx
   Amount: <span className="font-extrabold text-amber-400">{pendingRec.amount.toLocaleString()} ETB</span> via {pendingRec.paymentMethodName}
   ```

---

### 6. Smallest, Cleanest Safe Fix Strategy (For Subsequent Implementation)

When authorized to make code changes, the fix requires modifications in two files:

1. **For Bug 1 (Price Calculation):**
   - In `CreateListingModal.tsx`: When a promotion package is selected (e.g. `val !== 'free'`), do not silently add standalone addon fees (`topAdPrice` and `featuredPrice`) to the package cost. The package cost (e.g. 399 ETB for VIP Elite) already includes the promotion features.
   - Ensure the `totalCost` submitted to `/api/receipts` strictly equals the price displayed on the review screen (`selectedPackage.price` / `selectedPlanObj.cost`).

2. **For Bug 2 (Payment Method):**
   - In `WizardStep4Review.tsx`: Remove the auto-select `useEffect` that prematurely forces `selectedDirectMethodId` to `activeMethods[0].id`.
   - Require the customer to explicitly click their chosen payment method (or provide a clear selection state), allowing the validation guard (`if (!selectedDirectMethodId)`) to work as originally intended.
   - Ensure the Admin verification screen allows the admin to confirm or adjust the payment method against the uploaded bank receipt image.
