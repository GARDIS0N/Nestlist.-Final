# Firebase Security Specification (TDD)

## 1. Data Invariants
- **Users**: A user profile can only be created by the user themselves, using their exact authenticated `request.auth.uid`. No user can alter another user's profile, roles, or claims.
- **Listings**: A listing must have a valid `author.id` matching the creator's `uid`. Only authorized roles (Landlord, Agent) can create listings. Only the listing author can edit or delete a listing.
- **Payments**: Payment logs must be immutable upon successful transaction completion and only readable by the designated author or Admin.
- **Inquiries**: Inquiries can only be submitted by signed-in users. An inquiry must match its sender's credentials, and only the listing's author can view their inquiries.
- **Notifications**: Notifications are private alerts. A user can only view their own notifications.

---

## 2. The "Dirty Dozen" (Malicious payloads designed to break safety)

1. **Identity Spoofing - Creating User ID Mismatch:** Create `/users/victim_123` with payload under UID `malicious_999`.
2. **Elevated Privilege Escalation:** Attempting to update user record `/users/malicious_999` with `role: "Admin"` or `isVerified: true` from the client without verification.
3. **Ghost Fields Injection:** Adding custom ghost property `isSystemAdmin: true` to `/users/any_uid`.
4. **Altering Immortal Creation Dates:** Modifying `createdAt` field on an existing `/listings/list_abc` to circumvent expiration.
5. **Unauthorized Listing Edit:** Editing a premium listing `/listings/list_abc` owned by `landlord_user` as a tenant user or guest.
6. **Bypassing Payment Action Verification:** Transitioning a `/payments/p_123` record's billing status straight to `completed` from client-side without performing the Daraja API callback.
7. **Recursive ID Poisoning:** Injecting a 2MB long malicious string containing junk characters as document IDs for `/listings/maliciousRef`.
8. **Blind Listing Erasure:** Deleting a hot property `/listings/list_abc` belonging to another listing partner.
9. **Bulk Queries Scraping:** Conducting a general, blanket search retrieve of `/payments/` database without specific auth ownership filters.
10. **Spoofing Senders on Inquiries:** Submitting an inquiry with tenant name `"Victim Real Name"` under a fully different user session.
11. **Reading Alien Inbox:** Trying to query `/notifications/` belonging to other users.
12. **Status Shortcutting:** Tampering with billing references on listings to bypass payment state machines entirely.

---

## 3. Test Runner Plan
Using the security assertions above, we define secure `firestore.rules` containing highly hardened ABAC filters to prevent these exact pathways of vulnerability. We enforce:
- Strict schema validation on properties (key size limits, types).
- Ownership match validation `userId == request.auth.uid`.
- Strict action permissions limits using `affectedKeys()`.
