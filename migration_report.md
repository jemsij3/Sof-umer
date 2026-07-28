# Production Database and Migration Report

## 1. Current Production Database
The application is currently using a **local JSON file (`sof_umer_db.json`)** as its primary production database.
The entire state of the application (users, properties, transactions, etc.) is held in memory in a variable called `localDb`.

There is an implementation of MongoDB using Mongoose, but it acts merely as an exact mirror backup of the JSON file:
- On every save operation (`saveDb()`), the entire `localDb` JSON object is serialized to the JSON file.
- Afterwards, the entire object is saved into a single MongoDB document via `DbStateModel.findOneAndUpdate`.
- On startup (`loadDb()`), the server attempts to retrieve this single document from MongoDB. If that fails or isn't configured (`MONGODB_URI` not set), it reads the local JSON file.

There are technically two possible sources of truth on startup (MongoDB `DbStateModel` and the local JSON file), but they are used interchangeably to load the same monolithic JSON structure into memory.

## 2. Deployment Data Survival Audit
I conducted an automated deployment survival test, performing the following actions:
- Start server
- Register a new user and verify the account
- Login with the new user
- Create a new property listing
- **Restart the server**
- Re-authenticate as the new user and admin, then fetch users and listings

**Does data survive deployment?**
- **Yes, if `MONGODB_URI` is set:** The `loadDb()` function successfully pulls the single document containing all data.
- **Yes, if Render Persistent Disk is attached:** The server logic searches for `/data` or `/var/data` and uses it to store the JSON file persistently.
- **Yes, locally (simulated):** Because it falls back to `/tmp/sof_umer_data/sof_umer_db.json` which persists across normal node restarts.
- **NO, if deployed on Render Free Tier WITHOUT MongoDB:** Render Free instances do not have persistent disks. They spin up fresh containers on every deployment. Without `MONGODB_URI` set, the server will try to read from the ephemeral filesystem, fail to find the database, copy the empty `sof_umer_db.json` seed file, and **all production data will be wiped.**

### User Seed & Startup Reset Audit
- **Startup Code Resets Passwords:** Safe. The `loadDb()` function explicitly checks `if (!jemalUser.passwordHash)` before setting the default password. It does not blindly overwrite existing passwords.
- **Seed Data Overwrite:** If the database file is missing, the code copies `sof_umer_db.json` from the repository to the persistent location. Since this repository seed only contains the admin user and basic static configurations, it effectively wipes all other users if the persistent storage is lost.
- **Admin User Management:** Reads directly from `localDb.users` which reflects the JSON/MongoDB backup state. It relies on the same production data source.

## 3. Is Migration to PostgreSQL/MongoDB Required?
**YES. A full migration to a relational database (PostgreSQL) or a proper document database (MongoDB collections) is absolutely critical.**

Storing the entire database state as a single JSON object in memory and mirroring it to a single MongoDB document is unviable for production:
1. **Out of Memory (OOM) Crashes:** As users, listings, and messages grow, the Node.js process will exhaust its RAM holding `localDb`, causing frequent crashes.
2. **MongoDB 16MB Limit:** MongoDB strictly limits a single document to 16MB. Once the application's data (including Base64 images if any are stored) hits 16MB, `saveDb` will permanently fail, and data will be lost.
3. **Data Corruption:** Writing the entire database state to disk on every single API request (e.g., updating a read notification) is extremely inefficient and prone to race conditions, despite the `savePromise` queue. If the process crashes during a file write, the entire database becomes corrupted.

## 4. Exact Remaining Risks
- **Catastrophic Data Loss (16MB Limit):** The MongoDB backup will silently fail once the total JSON size reaches 16MB.
- **Ephemeral Storage Wipe:** If Render restarts the instance (which happens randomly on free tiers or during deploys) and MongoDB is down or unconfigured, the app will revert to an empty seed state.
- **Performance Degradation:** Every API route that modifies data rewrites the *entire* database to disk.
- **Search and Query Limitations:** Searching for listings, filtering, and pagination are all done via slow, in-memory array filtering (`localDb.properties.filter(...)`) rather than optimized SQL queries or database indexes.

## Next Steps for Migration
1. Define Prisma (PostgreSQL) or Mongoose models for each entity (`User`, `Property`, `Message`, `Transaction`).
2. Write a one-time script to read the existing `sof_umer_db.json` and insert all records into the new database tables/collections.
3. Refactor all Express routes (`app.get`, `app.post`, etc.) in `server.ts` to perform direct database queries instead of mutating the in-memory `localDb` array.
