# Security Specification: Voxelia Skyline Builder

## 1. Data Invariants
1. **Identity Ownership**: A `users/{userId}` document can only be read, created, or updated by the authenticated, email-verified user whose `request.auth.uid == userId`, and `uid` inside the payload must strictly match `request.auth.uid`.
2. **Leaderboard Integrity**: A `leaderboard/{userId}` document can only be created or updated by `request.auth.uid == userId` with `email_verified == true`. Scores, levels, and counts must be non-negative integers within realistic upper bounds, and `score` cannot be forged downward or arbitrarily inflated past sane per-run ceilings (`score <= 99999999`).
3. **Zero Shadow Fields**: Both `users` and `leaderboard` enforce strict `hasAll` + `hasOnly` on create and `affectedKeys().hasOnly(...)` on update.
4. **Immutable Temporal & Identity Fields**: `uid` and `createdAt` are immutable after creation; `createdAt` and `updatedAt` must equal `request.time`.
5. **No PII in Public Leaderboard**: `leaderboard` documents never store email, phone, or private metadata—only `uid`, `playerName`, `score`, `cityLevel`, `landmarksCount`, `maxCombo`, `districtTitle`, and `updatedAt`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. Unauthenticated create on `/users/attacker` -> `PERMISSION_DENIED`
2. Cross-user read on `/users/victim_uid` by `attacker_uid` -> `PERMISSION_DENIED`
3. Identity spoofing on `/users/attacker` with `uid: "victim_uid"` -> `PERMISSION_DENIED`
4. Shadow field injection on `/leaderboard/attacker` with `{ ..., isAdmin: true }` -> `PERMISSION_DENIED`
5. Client timestamp spoofing (`updatedAt: "2099-01-01T00:00:00Z"`) -> `PERMISSION_DENIED`
6. Unverified email write attempt (`email_verified: false`) -> `PERMISSION_DENIED`
7. Oversized `playerName` (500-char string Denial-of-Wallet attack) -> `PERMISSION_DENIED`
8. Invalid path ID poisoning (`/leaderboard/../../etc`) -> `PERMISSION_DENIED`
9. Negative or float score injection (`score: -500` or `score: 12.5`) -> `PERMISSION_DENIED`
10. Overwriting immutable `createdAt` or `uid` on `/users/{userId}` update -> `PERMISSION_DENIED`
11. Cross-user leaderboard overwrite (`/leaderboard/victim_uid` by `attacker_uid`) -> `PERMISSION_DENIED`
12. Delete attempt on `/leaderboard/{userId}` or `/users/{userId}` -> `PERMISSION_DENIED`
