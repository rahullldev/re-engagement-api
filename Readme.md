# Re-Engagement Email API

A backend service that automatically sends re-engagement emails to inactive users based on their last activity.

Built with **Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, BullMQ, Docker**, and **Nodemailer**.

---

# Features

* Automated re-engagement campaigns
* Manual campaign triggering through REST API
* Scheduled campaign execution using **node-cron**
* Background email processing with **BullMQ**
* PostgreSQL persistence using **Prisma ORM**
* Redis-backed job queue
* Responsive HTML email templates
* Campaign tracking (Pending, Sent, Failed)
* Automatic retry mechanism for failed emails
* Dockerized development environment

---

# Tech Stack

* Node.js
* TypeScript
* Express
* PostgreSQL
* Prisma ORM
* Redis
* BullMQ
* Nodemailer
* Docker & Docker Compose

---

# Architecture

```text
                    ┌──────────────────────┐
                    │   Cron Scheduler     │
                    │ (Runs every 4 mins)  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Campaign Service    │
                    │ Find inactive users  │
                    └──────────┬───────────┘
                               │
                               ▼
                 ┌────────────────────────────┐
                 │ Create EmailCampaign Record │
                 │       (PENDING)             │
                 └──────────┬──────────────────┘
                            │
                            ▼
                 ┌────────────────────────────┐
                 │      BullMQ + Redis        │
                 │      Queue Email Job       │
                 └──────────┬──────────────────┘
                            │
                            ▼
                 ┌────────────────────────────┐
                 │        Email Worker        │
                 │  (Concurrent Processing)   │
                 └──────────┬──────────────────┘
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
  Send Email via SMTP                  Update Campaign
                                      (SENT / FAILED)
```

---

# Campaign Flow

Users are selected based on inactivity.

| Days Inactive | Campaign |
| ------------- | -------- |
| 2 Days        | DAY_2    |
| 5 Days        | DAY_5    |
| 7 Days        | DAY_7    |

Only the latest applicable campaign is queued.

Each campaign can only exist once for a user using the composite unique constraint:

```text
(userId, campaignType)
```

This prevents duplicate emails even if the campaign is triggered multiple times.

---

# Email Campaign Tracking

Every campaign is stored in PostgreSQL.

Each record stores:

* User
* Campaign Type
* Campaign Status
* Retry Count
* Error Message (if any)
* Sent Timestamp
* Created Timestamp

Campaign statuses:

* **PENDING** – queued for processing
* **SENT** – delivered successfully
* **FAILED** – sending failed after processing

---

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/rahullldev/re-engagement-api.git

cd re-engagement-api
```

---

## 2. Configure Environment Variables

Create a `.env` file.

Example:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/reengagement

REDIS_URL=redis://redis:6379

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=YOUR_SMTP_USERNAME
SMTP_PASS=YOUR_SMTP_PASSWORD
```

---

# SMTP Configuration

You can use either **Mailtrap** (recommended for testing) or **Gmail SMTP**.

## Option 1 — Mailtrap (Recommended)

Create a free account:

https://mailtrap.io/

After logging in:

1. Open **Sandboxes**
2. Create or open a sandbox
3. Navigate to **SMTP Settings**
4. Copy:

   * SMTP Host
   * SMTP Port
   * Username
   * Password

Paste them into your `.env`.

Every email sent by this project will appear inside your Mailtrap Inbox for testing.

---

## Option 2 — Gmail SMTP

Enable **2-Step Verification** on your Google account.

Then:

1. Go to **Google Account**
2. Security
3. Search for **App Passwords**
4. Create a new App Password
5. Google generates a 16-character password

Use:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=YOUR_16_CHARACTER_APP_PASSWORD
```

---

# Running the Project

Start all services:

```bash
docker compose up --build
```

This starts:

* PostgreSQL
* Redis
* API Server

It also automatically runs pending Prisma migrations.

---

# Seed Demo Users

Populate the database with sample users.

```bash
docker compose exec app npm run seed
```

Seeded users:

* [imrahul2023+day2@gmail.com](mailto:imrahul2023+day2@gmail.com)
* [imrahul2023+day5@gmail.com](mailto:imrahul2023+day5@gmail.com)
* [imrahul2023+day7@gmail.com](mailto:imrahul2023+day7@gmail.com)
* [imrahul2023+test@gmail.com](mailto:imrahul2023+test@gmail.com)

You can change the data according to your requirements.



# Trigger Campaign Processing

The API exposes a manual endpoint for triggering campaign processing.

### Endpoint

```
POST /api/campaigns/process
```

Example URL:

```
http://localhost:5000/api/campaigns/process
```

---

### Using Postman

Create a new request:

* Method: **POST**
* URL:

```
http://localhost:5000/api/campaigns/process
```

No request body is required.

---

### Using curl (Windows / macOS / Linux)

```bash
curl -X POST http://localhost:5000/api/campaigns/process
```

---

# Automatic Campaign Processing

Campaign processing is also handled automatically using **node-cron**.

The current project is configured to execute **every 4 minutes** for testing purposes.

You can change the schedule by editing:

```
src/cron/engagement.cron.ts
```

Simply update the cron expression to whatever schedule you prefer (hourly, daily, etc.).

---

---

# Reset Database for Re-Testing

If you want to rerun tests from a clean state, you can reset the database and reseed it.

### Step 1 — Reset the database

```bash
docker compose exec app npx prisma migrate reset
```

This will drop the existing database and recreate it.

### Step 2 — Seed fresh data

```bash
docker compose exec app npm run seed
```

This ensures a fresh database with no existing campaigns, allowing you to rerun tests without conflicts.

---

# Queue Processing

Emails are processed asynchronously using BullMQ.

Features include:

* Background processing
* Automatic retries
* Configurable worker concurrency
* Failed job tracking
* Redis-backed queue

---

# Project Structure

```text
src
├── config/
├── controllers/
├── cron/
├── queue/
├── routes/
├── services/
├── workers/
├── templates/
├── prisma/
└── server.ts
```

---

# API

| Method | Endpoint                 | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/api/campaigns/process` | Trigger campaign processing manually |

---

# Notes

* Campaigns are created only once per user and campaign type.
* BullMQ automatically retries failed email jobs.
* Campaign status is updated after every processing attempt.
* PostgreSQL stores campaign history for auditing and debugging.
* Redis is used only for queue management; campaign data is persisted in PostgreSQL.
