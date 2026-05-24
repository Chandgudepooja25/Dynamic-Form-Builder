# Response Flow

This document traces the lifecycle of a single form response end-to-end.

## 1. Admin creates the form

```
POST /api/forms
Authorization: Bearer <admin JWT>

{
  "title": "Job Application",
  "questions": [ ... ]       // see examples/sample-form.json
}
```

The server stores it as a `Form` document and returns the generated `_id`.

## 2. User opens the form

```
GET /api/forms/:id/public
```

Returns the schema stripped of admin-only fields (e.g. response counts). The
frontend renders the first question via the `FormRunner` component.

## 3. User answers a question → server decides next question

After each answer the client calls:

```
POST /api/forms/:id/next
{
  "answers": { "q_has_experience": "no" },
  "currentQid": "q_has_experience"
}
```

The backend `logicService` evaluates the `logic` array on each subsequent
question in order, honoring `jump_to`, `hide`, `show`, and `end` actions.
Response: `{ nextQid: "q_portfolio" }` (skipping `q_years` and `q_stack`).

## 4. (Optional) Auto-save draft

```
POST /api/responses/draft
Authorization: Bearer <user JWT>
{
  "formId": "...",
  "answers": [ ... partial ... ]
}
```

Upserts a `Response` document with `status: "draft"` keyed by
`(userId, formId)`. On reload the client calls `GET /api/responses/draft?formId=...`
to resume.

## 5. User submits

```
POST /api/responses
{
  "formId": "...",
  "answers": [ ... full ... ]
}
```

Server-side `validator` re-runs:
- Required fields
- Type coercion (number, date)
- min/max, minLength/maxLength, regex
- Logic-aware "was this question even reachable?" check

On success the document is promoted to `status: "submitted"` with
`submittedAt` timestamp.

## 6. Admin reviews

```
GET /api/forms/:id/responses         # JSON list
GET /api/forms/:id/export            # CSV download
```

The CSV header is the question labels in schema order; each row is one
response.
