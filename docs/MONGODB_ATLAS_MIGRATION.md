# SkillBridge AI - MongoDB Atlas Migration Guide

This document provides step-by-step instructions for preparing, dumping, and restoring the local SkillBridge AI MongoDB database (`skillbridge_ai`) to a cloud-hosted **MongoDB Atlas** cluster.

---

## 1. Executive Summary & Audit Findings

- **Source Database Name**: `skillbridge_ai`
- **Source Database Host**: `mongodb://127.0.0.1:27017/skillbridge_ai`
- **Detected Collections**: 18 Collections
- **Total Document Count**: ~1,228 Documents
- **Database Tools Status**:
  - `mongodump`: ❌ Not installed in Windows PATH
  - `mongorestore`: ❌ Not installed in Windows PATH

### Detected Collections Breakdown:

| Collection Name | Document Count | Demo Records (`isDemo: true`) |
| :--- | :---: | :---: |
| `applications` | 195 | 142 |
| `auditlogs` | 341 | 0 |
| `candidates` | 248 | 142 |
| `codingassessments` | 17 | 0 |
| `companies` | 82 | 0 |
| `documents` | 0 | 0 |
| `employees` | 1 | 0 |
| `interviewrooms` | 31 | 0 |
| `interviews` | 53 | 32 |
| `interviewsessions` | 31 | 0 |
| `jobs` | 52 | 5 |
| `notifications` | 113 | 0 |
| `offerletters` | 0 | 0 |
| `resumeanalyses` | 15 | 0 |
| `savedjobs` | 4 | 0 |
| `sessions` | 4 | 0 |
| `testcompanymodels` | 0 | 0 |
| `videointerviews` | 38 | 0 |
| **TOTAL** | **1,228** | **321** |

---

## 2. Windows Installation Requirement (MongoDB Database Tools)

`mongodump` and `mongorestore` are part of **MongoDB Database Tools** and must be installed prior to running export/import operations.

### Option A: Install via Windows Package Manager (`winget`) — Recommended
Run the following PowerShell command as Administrator:

```powershell
winget install MongoDB.DatabaseTools
```

### Option B: Install via Chocolatey (`choco`)
```powershell
choco install mongodb-database-tools
```

### Option C: Manual Download & Installation
1. Download the installer from the official MongoDB Download Center:
   https://www.mongodb.com/try/download/database-tools
2. Run the MSI installer (or unpack the zip file to `C:\Program Files\MongoDB\Tools\bin`).
3. Add `C:\Program Files\MongoDB\Tools\bin` to your System `PATH` environment variable.
4. Verify installation by restarting PowerShell and executing:

```powershell
mongodump --version
mongorestore --version
```

---

## 3. MongoDB Atlas Cluster & Security Setup

Before restoring your data to MongoDB Atlas, create and configure your Atlas cluster:

### Step 3.1: Create MongoDB Atlas Cluster
1. Sign in to [MongoDB Atlas Cloud Console](https://cloud.mongodb.com/).
2. Create a new project named **SkillBridge AI**.
3. Deploy a cluster (Shared M0 for staging/free tier, or M10+ dedicated for production).
4. Choose your preferred cloud provider and region (e.g., AWS us-east-1 or ap-south-1).

### Step 3.2: Create Database User
1. Go to **Security** -> **Database Access**.
2. Click **Add New Database User**.
3. Select **Password Authentication**.
4. Generate a strong username (e.g., `skillbridge_admin`) and secure password.
5. Grant the role **Atlas Admin** or **Read and write to any database**.
6. Click **Add User**.

### Step 3.3: Configure Network Access (IP Whitelist)
1. Go to **Security** -> **Network Access**.
2. Click **Add IP Address**.
3. Add your current development machine IP address (or `0.0.0.0/0` temporarily for testing).
4. For production deployment, specify your application server static IP address.

### Step 3.4: Obtain Connection String
1. Go to **Database Deployments**.
2. Click **Connect** on your cluster -> Choose **Drivers** (Node.js).
3. Copy the SRV URI template:
   `mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/skillbridge_ai?retryWrites=true&w=majority`

---

## 4. Migration Architecture & Commands

```
   Local MongoDB
(127.0.0.1:27017/skillbridge_ai)
        │
        ▼
    mongodump
        │
        ▼
   Local Backup Folder
(./mongodb_backup)
        │
        ▼
  MongoDB Atlas Cloud
(cluster0.xxx.mongodb.net)
        │
        ▼
   mongorestore
        │
        ▼
  SkillBridge AI App
(MONGODB_URI in secrets)
```

### Step 4.1: Export Local Database (`mongodump`)

Execute the following PowerShell command from the repository root directory:

```powershell
# Create timestamped backup directory
$TIMESTAMP = Get-Date -Format 'yyyyMMdd_HHmmss'
$BACKUP_DIR = "./backups/mongodb_backup_$TIMESTAMP"

# Perform safe mongodump targeting local database
mongodump --uri="mongodb://127.0.0.1:27017/skillbridge_ai" --out="$BACKUP_DIR"
```

> [!IMPORTANT]
> `mongodump` strictly performs read operations. The existing local database and documents remain completely untouched and preserved for development.

### Step 4.2: Import Database to MongoDB Atlas (`mongorestore`)

Once your Atlas cluster is ready and credentials are configured, execute the restore command:

```powershell
# Specify your MongoDB Atlas connection string (replace credentials & cluster host)
$ATLAS_URI = "mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/skillbridge_ai?retryWrites=true&w=majority"

# Specify the path to the dumped skillbridge_ai folder
$DUMP_FOLDER = "$BACKUP_DIR/skillbridge_ai"

# Perform mongorestore to Atlas
mongorestore --uri="$ATLAS_URI" --nsInclude="skillbridge_ai.*" "$DUMP_FOLDER"
```

---

## 5. Application Environment & Production Security

### Step 5.1: Local Environment Switch (Optional)
To switch your local server environment to use Atlas, update `server/.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/skillbridge_ai?retryWrites=true&w=majority
```

> [!CAUTION]
> **NEVER COMMIT REAL CREDENTIALS TO GIT.**
> Ensure `.env`, `.env.production`, and `.env.docker` are listed in `.gitignore`. Only `.env.example` should be committed with placeholder values (`MONGODB_URI=your_mongodb_atlas_uri`).

### Step 5.2: Production Deployment Platform Configuration
For production platforms (Render, Vercel, AWS, Railway, Heroku, Docker secrets):
- Add `MONGODB_URI` as an environment variable / secret in the deployment service dashboard.
- Do not commit production `.env` files into the repository.

---

## 6. Demo Data Isolation & Cleanup Procedure

The local database contains 321 demo records tagged with `isDemo: true` across `candidates`, `applications`, `interviews`, and `jobs`.

If you wish to remove demo records from Atlas prior to production deployment:

### Option A: Via Seed Script
In `server/`:
```powershell
npm run clear:analytics
```

### Option B: Via MongoDB Shell / Query
Execute in Atlas Web Console or `mongosh`:

```javascript
use skillbridge_ai;
db.candidates.deleteMany({ isDemo: true });
db.applications.deleteMany({ isDemo: true });
db.interviews.deleteMany({ isDemo: true });
db.jobs.deleteMany({ isDemo: true });
```

---

## 7. Migration Verification Procedure

After running `mongorestore`, verify connection and document counts using the safe verification script:

```powershell
cd server
node scripts/verify_mongodb_atlas.js
```

### Expected Verification Output:
```
=========================================================
       SKILLBRIDGE AI - MONGO_DB ATLAS VERIFICATION
=========================================================
Target Connection URI: mongodb+srv://***:***@cluster0.xxx.mongodb.net/skillbridge_ai
MongoDB connection: OK
Connected Host: cluster0-shard-00-00.xxx.mongodb.net
Database: skillbridge_ai
Collections: 18
---------------------------------------------------------
Collection Summary (Document Counts):
 - applications            : 195
 - auditlogs               : 341
 - candidates              : 248
 - codingassessments       : 17
 - companies               : 82
 - documents               : 0
 - employees               : 1
 - interviewrooms          : 31
 - interviews              : 53
 - interviewsessions       : 31
 - jobs                    : 52
 - notifications           : 113
 - offerletters            : 0
 - resumeanalyses          : 15
 - savedjobs               : 4
 - sessions                : 4
 - testcompanymodels       : 0
 - videointerviews         : 38
---------------------------------------------------------
✅ Database verification complete. Data integrity intact.
=========================================================
```
