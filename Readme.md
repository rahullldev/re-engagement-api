# Re-Engagement Email API

A backend service that automatically sends re-engagement emails to inactive users based on their last activity.

Built using **Node.js, TypeScript, Express, PostgreSQL, Prisma, Redis, BullMQ and Docker**.

---

## Features

- Scheduled campaign processing using **node-cron**
- Manual campaign trigger through REST API
- Background email processing using **BullMQ**
- PostgreSQL persistence with **Prisma ORM**
- Responsive HTML email templates
- Campaign tracking (status, retries, sent time)
- Dockerized development environment
- Mailtrap integration for email testing

---

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- Nodemailer
- Mailtrap SMTP
- Docker & Docker Compose


# Architecture

```
                 Cron Job
                     │
                     ▼
          CampaignService
                     │
     Finds inactive users
                     │
                     ▼
          Create EmailCampaign
                     │
                     ▼
          BullMQ Queue (Redis)
                     │
                     ▼
             Email Worker
                     │
                     ▼
           Nodemailer + Mailtrap
                     │
                     ▼
             Update Campaign Status
```

---

# Campaign Flow

Users are selected based on their inactivity period.

| Days Inactive | Campaign |
|---------------|----------|
| 2 Days | DAY_2 |
| 5 Days | DAY_5 |
| 7 Days | DAY_7 |

Each campaign is sent **only once** using a unique constraint on:

```
(userId, campaignType)
```

to prevent duplicate emails.

---

# Email Tracking

Every campaign is stored in PostgreSQL.

Information tracked:

- User
- Campaign Type
- Status (Pending / Sent / Failed)
- Retry Count
- Error Message
- Sent Time

---

# Running the Project

## 1. Clone

```bash
git clone <repository-url>

cd re-engagement-api
```

---

## 2. Configure Environment

Create a `.env`

Example:

```env
PORT=5000

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/reengagement

REDIS_URL=redis://redis:6379

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=YOUR_MAILTRAP_USERNAME
SMTP_PASS=YOUR_MAILTRAP_PASSWORD

SMTP_FROM=ReEngagement <noreply@example.com>

APP_URL=https://example.com
```

---

## 3. Start Docker

```bash
docker compose up --build
```

This starts

- PostgreSQL
- Redis
- API

and automatically runs pending Prisma migrations.

---

## 4. Seed Demo Users

```bash
docker compose exec app npm run seed
```

Seeded users:

- inactive-day2@example.com
- inactive-day5@example.com
- inactive-day7@example.com
- active-user@example.com

---

## 5. Trigger Campaign Processing

```
POST /api/campaigns/process
```

Example:

```
POST http://localhost:5000/api/campaigns/process
```

---

## Cron Job

The scheduler periodically checks inactive users and automatically queues campaign emails.

For testing purposes the schedule can be adjusted in:

```
src/cron/engagement.cron.ts
```

---

## Mail Testing

Emails are sent using **Mailtrap SMTP**.

After configuring your Mailtrap credentials in `.env`, every email will appear in your Mailtrap Inbox.

---

## Queue Processing

Emails are processed asynchronously using BullMQ.

Benefits:

- Background processing
- Automatic retries
- Configurable concurrency
- Failed job handling

---

## Database

Main tables:

### User

Stores registered users and their last activity.

### EmailCampaign

Stores:

- campaign type
- delivery status
- retry count
- sent timestamp
- error information

---

## Logging

Application logs include:

- Campaign execution
- Queue processing
- Email sending
- Delivery success/failure
- Timestamps for each processed email

---

# Future Improvements

- Batch queue insertion using `queue.addBulk()`
- Rate limiting for SMTP providers
- Admin dashboard for campaign history
- Campaign analytics
- Template editor
- Metrics & monitoring
- Unit & integration tests

---

# Notes

During development, `node-cron` v4 exhibited missed execution behavior due to a known upstream issue. The project uses **node-cron v3** for stable scheduling.

---

Thank you for reviewing this submission.