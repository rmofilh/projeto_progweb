# Baú Pessoal (Low-Friction Auth)

## ADDED Requirements

### Requirement: Low-Friction Authentication and Storage

- The system MUST authenticate users via Google SSO or Magic Links sent by email.
- The system MUST NOT require the user to manage a password.
- The system MUST allow up to 100 favorited patterns per user.
- The system MUST sync favorites to the local device storage (IndexedDB) for offline access.
- The system SHOULD download high-definition assets for favorited patterns to local storage.

#### Scenario: User authenticates via Magic Link
Given the user wants to access their personal vault
When the user requests a Magic Link to their email
And clicks the link
Then the system MUST authenticate the user without a password

#### Scenario: Syncing favorites for offline use
Given the user is authenticated
When the user favorites a pattern
Then the system MUST save the pattern to their personal vault
And the system MUST sync the metadata to IndexedDB
And the system MUST cache the high-resolution asset via Cache Storage API

#### Scenario: Maximum capacity reached
Given the user has 100 favorited patterns
When the user attempts to favorite a 101st pattern
Then the system MUST return an HTTP 400 Bad Request error stating the limit has been reached

#### Scenario: Favoriting offline (Intermittent Network)
Given the user is authenticated but the device has no network connection
When the user favorites a pattern
Then the Next.js application MUST queue the request locally via Background Sync
And the UI MUST immediately reflect the success visually to the user
