# Hormonal Risk Screening Backend

Express + MongoDB backend for the women's hormonal risk screening app.

## Run

1. Copy `.env.example` to `.env`
2. Set `MONGODB_URI`
3. Install and start:

```bash
npm install
npm run dev
```

## API Endpoints

- `POST /api/profile`
- `POST /api/symptoms/log`
- `GET /api/symptoms/:userId`
- `POST /api/screen`
- `GET /api/screen/history/:userId`
- `GET /api/screen/progression/:userId`
- `GET /api/screen/report/:sessionId`
- `POST /api/lab/upload` (multipart form-data, file field: `report`)
- `POST /api/symptoms/chat-parse`

## Example Payloads

### POST /api/profile

```json
{
  "age": 28,
  "cycleRegularity": "irregular",
  "averageCycleLength": 35,
  "lifestyle": {
    "sleepHours": 5.5,
    "stressLevel": 4,
    "exerciseFrequency": "low"
  },
  "dietType": "vegetarian",
  "recentEvents": {
    "pregnancy": false,
    "medicationChange": true,
    "weightChange": true
  }
}
```

### POST /api/symptoms/log

```json
{
  "userId": "USER_ID",
  "symptoms": [
    {
      "name": "fatigue",
      "severity": 4,
      "frequency": "daily",
      "durationWeeks": 8,
      "worsening": true
    },
    {
      "name": "hair_fall",
      "severity": 3,
      "frequency": "weekly",
      "durationWeeks": 10,
      "worsening": false
    }
  ]
}
```

### POST /api/screen

```json
{
  "userId": "USER_ID",
  "labValues": {
    "hemoglobin": 10.8,
    "tsh": 5.2,
    "ferritin": 18
  }
}
```

The response always includes:

`"This is a screening result, not a diagnosis."`
