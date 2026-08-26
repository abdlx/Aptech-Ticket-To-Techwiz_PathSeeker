# Phase 1 data model

Phase 1 establishes identity, user-provided profile facts, normalized career taxonomy foundations, and short-lived authentication records. It deliberately contains no calculated Career Passport or recommendation state; those belong to Phase 2 service-owned models.

```mermaid
erDiagram
    USER ||--o| USER_PROFILE : owns
    USER ||--o{ SESSION : authenticates_with
    USER ||--o{ VERIFICATION_TOKEN : receives
    USER_PROFILE }o--o{ SKILL : self_reports

    USER {
        ObjectId _id PK
        string normalizedEmail UK
        string role
        string stage
        string status
    }
    USER_PROFILE {
        ObjectId _id PK
        ObjectId userId UK
        array education
        array skills
        array interests
        object preferences
    }
    SKILL {
        ObjectId _id PK
        string slug UK
        string name
        string category
    }
    DOMAIN {
        ObjectId _id PK
        string slug UK
        string name
        number sortOrder
    }
    SESSION {
        ObjectId _id PK
        ObjectId userId FK
        string tokenHash
        date expiresAt TTL
    }
    VERIFICATION_TOKEN {
        ObjectId _id PK
        ObjectId userId FK
        string purpose
        string tokenHash
        date expiresAt TTL
    }
```

## Ownership contract

| Data | Authorized future writer |
| --- | --- |
| User identity fields | Auth/User service |
| User role and suspension state | Admin service |
| Profile facts and self-rated skills | Profile service |
| Session and verification hashes | Auth service |
| Skills and domains | Admin taxonomy service |

Controllers, voice providers, automation tools, and LLMs must not write calculated or security-sensitive fields directly.

## Lifecycle rules

- Normal users require a `stage`; administrators do not.
- User deletion is represented by `status: "deleted"` and `deletedAt` before any later privacy cleanup workflow.
- Sessions and verification tokens store hashes only and expire through MongoDB TTL indexes.
- Profiles have a unique `userId`, so every user has at most one factual profile.
- Skill references use `ObjectId`; skill names and aliases are display/search metadata rather than relationship keys.
- Seed reset removes only records with deterministic seed-owned IDs.
