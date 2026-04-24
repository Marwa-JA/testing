# Event Marketplace

A full-stack event booking platform built with Spring Boot (Java 21) and React 19.

## Prerequisites

| Tool               | Version                    |
| ------------------ | -------------------------- |
| Java               | 21                         |
| Maven (via `mvnw`) | bundled                    |
| Node.js            | 20+                        |
| npm                | 10+                        |
| k6                 | latest (`brew install k6`) |

---

## Configuration

The backend requires two credential files that are **not** committed to the repository.

### 1. `backend/src/main/resources/application.properties`

Copy the example and fill in your values:

```bash
cp backend/src/main/resources/application.properties.example \
   backend/src/main/resources/application.properties
```

Edit the file and replace every `YOUR_*` placeholder.

### 2. `backend/src/main/resources/serviceAccountKey.json`

Download your Firebase service account key from the Firebase Console and place it at this path.

---

## Running the Application

### Backend

```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## Running the Tests

### Unit & Integration Tests (Java)

```bash
cd backend
./mvnw test -Dspring.profiles.active=test
```

Test reports are generated at `backend/target/surefire-reports/`.

### E2E Tests (Playwright)

> The frontend dev server starts automatically via `webServer` in `playwright.config.js`.

```bash
cd frontend
npm install
npx playwright install --with-deps chromium
npm run test:e2e

# Open the HTML report after the run
npm run test:e2e:report
```

### Performance Tests (k6)

Start the backend first, then:

```bash
# Install k6
brew install k6   # macOS
# or: https://k6.io/docs/get-started/installation/

# Run the load test
cd performance
k6 run load_test.js

# Run against a different host
k6 run -e BASE_URL=http://staging.example.com load_test.js
```

See `performance/results_summary.md` for observed results and threshold details.

---

## CI/CD Pipeline

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push and pull request:

| Stage             | What it does                                             |
| ----------------- | -------------------------------------------------------- |
| **GitLeaks**      | Scans the full commit history for leaked secrets         |
| **Backend Tests** | Runs all JUnit tests with the `test` Spring profile      |
| **Frontend Build**| Verifies the React app compiles cleanly                  |
| **E2E Tests**     | Runs Playwright tests in headless Chromium               |
| **Deploy**        | Placeholder deploy step (runs on `main` pushes only)     |

---

## Test Coverage Summary

| Layer       | Framework              | Tests                                                                              |
| ----------- | ---------------------- | ---------------------------------------------------------------------------------- |
| Unit        | JUnit 5 + Mockito      | `BookingServiceTest` — 18 cases covering business rules, edge cases, error paths   |
| Integration | MockMvc standalone     | `BookingControllerTest` — 8 cases covering HTTP status codes and response bodies   |
| Performance | k6                     | Load test with 4-stage ramp (up to 30 VUs), thresholds on p95 latency + error rate |
| E2E         | Playwright             | 9 scenarios: navigation, form presence, events list, login validation              |

---

## Project Structure

```text
eventmarketplace/
├── .github/workflows/ci.yml     # CI/CD pipeline
├── backend/                     # Spring Boot API
│   └── src/
│       ├── main/java/...        # Application source
│       └── test/java/...        # Unit + integration tests
├── frontend/                    # React SPA
│   ├── e2e/                     # Playwright E2E tests
│   ├── playwright.config.js
│   └── src/
├── performance/
│   ├── load_test.js             # k6 load test script
│   └── results_summary.md      # Test results
└── README.md
```
