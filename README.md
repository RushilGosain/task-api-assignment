# Task Manager API — Take-Home Assignment

A RESTful Task Manager API built with **Node.js and Express**, with automated unit and integration testing using **Jest and Supertest**.

This project was completed as part of the **Full Stack Developer Intern Take-Home Assignment**.

---

## 🔗 Links

* **GitHub Repository:** [ https://github.com/RushilGosain/task-api-assignment ]
* **Live API:** [ https://untested-api-task-manager.onrender.com/ ]

---

## 🛠️ Tech Stack

* **Node.js**
* **Express.js**
* **Jest**
* **Supertest**
* **UUID**

---

## 📁 Project Structure

```text
task-api/
│
├── src/
│   ├── routes/
│   │   └── tasks.js
│   │
│   ├── services/
│   │   └── taskService.js
│   │
│   ├── utils/
│   │   └── validators.js
│   │
│   └── app.js
│
├── tests/
│   ├── taskService.test.js
│   └── tasks.test.js
│
├── BUG_REPORT.md
├── package.json
├── package-lock.json
└── README.md
```

---

# 🚀 Features

The API supports the following operations:

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/tasks`                 | Get all tasks           |
| GET    | `/tasks?status=todo`     | Filter tasks by status  |
| GET    | `/tasks?page=1&limit=10` | Paginate tasks          |
| GET    | `/tasks/stats`           | Get task statistics     |
| POST   | `/tasks`                 | Create a task           |
| PUT    | `/tasks/:id`             | Update a task           |
| DELETE | `/tasks/:id`             | Delete a task           |
| PATCH  | `/tasks/:id/complete`    | Complete a task         |
| PATCH  | `/tasks/:id/assign`      | Assign a task to a user |

---

# 📌 API Endpoints

## 1. Get All Tasks

```http
GET /tasks
```

Returns all tasks.

### Example

```bash
curl http://localhost:3000/tasks
```

---

## 2. Filter Tasks by Status

```http
GET /tasks?status=todo
```

Supported statuses:

```text
todo
in_progress
done
```

---

## 3. Paginate Tasks

```http
GET /tasks?page=1&limit=10
```

Example:

```text
Page 1 → Tasks 1–10
Page 2 → Tasks 11–20
Page 3 → Remaining tasks
```

The pagination offset bug found during testing was fixed so that API page numbers correctly map to JavaScript array indexes.

---

## 4. Get Task Statistics

```http
GET /tasks/stats
```

Example response:

```json
{
  "todo": 5,
  "in_progress": 3,
  "done": 7,
  "overdue": 2
}
```

---

# 5. Create a Task

```http
POST /tasks
```

### Request Body

```json
{
  "title": "Complete assignment",
  "description": "Finish the Task Manager API assignment",
  "status": "todo",
  "priority": "high"
}
```

### Required Field

```text
title
```

### Supported Statuses

```text
todo
in_progress
done
```

### Supported Priorities

```text
low
medium
high
```

---

# 6. Update a Task

```http
PUT /tasks/:id
```

### Example Request

```json
{
  "title": "Updated task title",
  "priority": "high"
}
```

Returns `404` if the requested task does not exist.

---

# 7. Delete a Task

```http
DELETE /tasks/:id
```

Returns:

```http
204 No Content
```

if the task is successfully deleted.

Returns:

```http
404 Not Found
```

if the task does not exist.

---

# 8. Complete a Task

```http
PATCH /tasks/:id/complete
```

Completing a task changes its status to:

```text
done
```

and records the completion time.

---

# 9. Assign a Task

```http
PATCH /tasks/:id/assign
```

### Request Body

```json
{
  "assignee": "Rushil"
}
```

### Successful Response

```json
{
  "id": "task-id",
  "title": "Complete assignment",
  "assignee": "Rushil"
}
```

### Validation

The `assignee` field must:

* Be a string
* Not be empty
* Not contain only whitespace

Invalid input returns:

```http
400 Bad Request
```

If the task does not exist:

```http
404 Not Found
```

### Reassignment

If a task is already assigned, assigning it again replaces the existing assignee.

For example:

```text
First assignment:
John

Second assignment:
Rushil

Final assignee:
Rushil
```

Leading and trailing whitespace is removed before storing the assignee.

---

# 🧪 Testing

The project includes both **unit tests** and **integration tests**.

### Unit Tests

`tests/taskService.test.js`

Covers:

* Task creation
* Default values
* Custom task values
* Finding tasks
* Getting all tasks
* Status filtering
* Pagination
* Updating tasks
* Removing tasks
* Completing tasks
* Task statistics

### Integration Tests

`tests/tasks.test.js`

Covers:

* `GET /tasks`
* Status filtering
* Pagination
* `GET /tasks/stats`
* `POST /tasks`
* `PUT /tasks/:id`
* `DELETE /tasks/:id`
* `PATCH /tasks/:id/complete`
* `PATCH /tasks/:id/assign`

Edge cases include:

* Invalid titles
* Invalid statuses
* Invalid priorities
* Missing tasks
* Empty assignees
* Whitespace-only assignees
* Invalid assignee types
* Reassigning an already assigned task

---

# 📊 Test Coverage

The test suite achieved coverage above the assignment requirement of **80%**.

Latest verified coverage before the additional assignment endpoint tests:

| Metric     | Coverage |
| ---------- | -------: |
| Statements |   94.02% |
| Branches   |   85.33% |
| Functions  |   92.30% |
| Lines      |   93.44% |

Run the tests yourself with:

```bash
npm test
```

Run the coverage report with:

```bash
npm run coverage
```

---

# 🐛 Bugs Identified

During testing, two issues were identified.

## 1. Incorrect Pagination Offset

The original implementation used:

```js
const offset = page * limit;
```

Because the API uses 1-based page numbers, this caused the first page to start from the wrong task.

### Fix

Changed it to:

```js
const offset = (page - 1) * limit;
```

This correctly maps:

```text
Page 1 → Index 0
Page 2 → Index 10
Page 3 → Index 20
```

---

## 2. Task Priority Changed When Completing

The `completeTask()` implementation explicitly set:

```js
priority: 'medium'
```

This caused a high-priority task to become medium priority when completed.

For example:

```text
Before:
priority = high
status = todo

After:
priority = medium
status = done
```

The issue was identified through testing and documented in `BUG_REPORT.md`.

---

# 📄 Bug Report

A detailed bug report is available in:

```text
BUG_REPORT.md
```

It includes:

* How the bugs were discovered
* Expected behavior
* Actual behavior
* Root causes
* Fix approach
* Testing results
* `PATCH /tasks/:id/assign` design decisions

---

# ⚙️ Local Setup

## Prerequisites

Make sure you have:

* Node.js 18 or higher
* npm

Check your versions:

```bash
node --version
npm --version
```

---

## Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Move into the project:

```bash
cd untested-api-task-manager
```

Install dependencies:

```bash
npm install
```

---

# ▶️ Running the API

Start the server:

```bash
npm start
```

The API will run on:

```text
http://localhost:3000
```

---

# 🧪 Running Tests

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run coverage
```

---

# 🌐 Live API

The deployed API is available at:

```text
<YOUR_LIVE_API_URL>
```

### Health Check

```http
GET /
```

Expected response:

```json
{
  "message": "Task API is running",
  "status": "success"
}
```

---

# 🔍 What I Would Test Next

With additional time, I would add tests for:

* Invalid pagination values
* Pagination boundary conditions
* Invalid query parameters
* Malformed JSON request bodies
* Additional date validation cases
* Concurrent task updates
* Error-handling middleware
* API behavior against the deployed environment
* More extensive validation of task updates

I would also consider adding automated API tests as part of a CI pipeline so that tests and coverage are automatically checked on every pull request.

---

# 💡 Observations

One of the main issues discovered during testing was the pagination offset calculation. The API exposed 1-based page numbers while the underlying JavaScript array uses zero-based indexes, which caused the first page to skip the first set of tasks.

Another issue was that completing a task unexpectedly changed its priority to `medium`. Since task completion and task priority represent different pieces of information, this behavior was identified as an unexpected side effect.

---

# ❓ Questions Before Production

Before shipping this API to production, I would clarify:

1. **Persistence**

   * Should tasks be stored in a database instead of in-memory storage?
   * What database is preferred?

2. **Authentication & Authorization**

   * Who is allowed to create, update, delete, complete, or assign tasks?
   * Should users only be able to modify their own tasks?

3. **Task Assignment**

   * Should reassignment always be allowed?
   * Should only specific users or roles be allowed to assign tasks?

4. **Validation**

   * What are the exact validation rules for titles, descriptions, dates, and task fields?

5. **Error Handling**

   * Is a standard API error response format required?

6. **Production Reliability**

   * What logging and monitoring requirements are expected?
   * Is rate limiting required?

7. **API Documentation**

   * Should the API be documented using OpenAPI/Swagger?

8. **Deployment**

   * What are the expected production hosting and environment requirements?

---

# 📌 Assignment Deliverables

This repository contains the requested assignment deliverables:

* ✅ Unit tests
* ✅ Integration tests
* ✅ Edge-case tests
* ✅ Bug report
* ✅ Bug fix
* ✅ `PATCH /tasks/:id/assign`
* ✅ Validation for the assignment endpoint
* ✅ Handling for missing tasks
* ✅ Reassignment behavior
* ✅ Test coverage report
* ✅ Deployment-ready Express API

---

## Author

**Rushil Gosain**

B.Tech — Computer Science & Engineering

GitHub: [RushilGosain](https://github.com/RushilGosain)
