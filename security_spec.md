# Firebase Security Specification & TDD

## Data Invariants
1. Workspaces belong to an `ownerId` (the user's UID).
2. Notebooks belong to a `workspaceId` and an `ownerId`.
3. Cards belong to a `notebookId` and an `ownerId`.
4. Tags belong to an `ownerId`.
5. Users can only read, create, update, or delete resources where `ownerId == request.auth.uid`.

## Dirty Dozen Security Payloads
1. Attempting to create a workspace with a spoofed `ownerId` ("other_user_123").
2. Attempting to update another user's card title without authorization.
3. Attempting to read another user's private notes collection.
4. Attempting to inject oversized string payload (> 500KB) into card body.
5. Attempting to write invalid types into boolean `isTrashed` field.
6. Attempting to delete another user's notebook.
7. Attempting unauthenticated access to cards collection.
8. Attempting to set `createdAt` timestamp to arbitrary future date on update.
9. Attempting to bypass strict key validation with unknown payload properties.
10. Attempting document ID poisoning with illegal characters in card ID.
11. Attempting to mutate `ownerId` field during a card update.
12. Attempting to list all cards across all users without `ownerId` query filter.
