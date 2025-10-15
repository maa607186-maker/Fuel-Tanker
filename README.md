# Fuel Tracker - MVP

## Overview
Fuel Tracker is a minimum viable product (MVP) web application designed to help drivers record fuel fill-ups and analyze consumption and costs over time. Users register with email/password, log each fill-up details, and view history and statistics.

---

## Screens (MVP)
- Landing / Home (logged out)
- Sign Up
- Sign In
- Dashboard (logged in, with vehicle selector)
- Vehicle Management (list, add, edit, delete)
- Add / Edit Fill-Up
- History
- Statistics — Brand/Grade
- Settings / Profile
- Legal Pages
- Error Page

---

## UX Notes
- Use inline validation and helper text on Add/Edit forms (e.g., show computed unit price and tolerance diff).
- Sticky “Add Fill-Up” button on screen.
- Clear tooltips/glossary for metrics (e.g., “L/100km: lower is better”).
- Default dashboard period: last 30 days; allow quick toggles (30/90/YTD/Custom).
- Vehicle selector present in dashboard, history, and statistics views.

---

## Implementation Guidelines (MVP)

### Technology Stack
- Backend: REST API using Node.js/NestJS or Java/Spring Boot or .Net
- Database: PostgreSQL with schema management via Liquibase or similar
- Authentication: Session cookies with CSRF protection
- Frontend: ReactJS (or Angular 2) with responsive UI and client + server validation
- DevOps: Dockerized service with `docker-compose.yaml` for local development and deployment
- Migrations & Seeds: Baseline admin and dev users seeded for development environments

---

## Deployment
To run the application locally:

```bash
git clone <repository-url>
docker-compose up


## Fuel Tracker - Flow Diagram (MERN Stack)

+--------------------+
| Landing / Home      |
| (Unauthenticated)   |
+---------+----------+
          |
          v
+--------------------+
| Sign Up / Sign In   |
+---------+----------+
          |
          v
+--------------------+
| Dashboard          |
| (Logged In)        |
| - Vehicle Selector |
+---------+----------+
          |
          v
+------------------------+
| Vehicle Management     |
| - List/Add/Edit/Delete |
+------------------------+
          |
          v
+------------------------+
| Fuel Entry Management  |
| - Add/Edit/Delete Fill-Ups |
+------------------------+
          |
          v
+------------------------+
| History & Statistics   |
| - Filter, Sort, Paginate |
| - Rolling & All-time Stats|
+------------------------+
          |
          v
+------------------------+
| Settings / Profile     |
| - Preferences & Units |
+------------------------+


## Derived Metrics & Calculations

All metrics are computed per vehicle; aggregations can also be calculated across all vehicles when selected in the dashboard.

### Per-fill Computed Fields (for each entry after the baseline)
- **distance_since_last** = current_odometer − previous_odometer (same vehicle)
- **unit_price** = total / liters

### Efficiency
- **Metric view:** consumption (L/100km) = (liters / distance_since_last) × 100 (if distance > 0)
- **Imperial view:** MPG = distance_since_last (mi) / volume (gal)

### Cost Metrics
- **cost_per_km** = total / distance_since_last (if distance > 0)
- **cost_per_mile** (converted when in Imperial view)

### Aggregations
- Rolling window (default last 30 days, configurable):
  - average cost per liter
  - average consumption (L/100km or MPG)
  - average distance per day
  - average cost per km
  - total spend & total distance
- Per brand and per grade:
  - all-time averages (consumption, cost per liter, cost per km)
  - number of fill-ups per brand/grade

### Rounding Rules
- Currency display: 2 decimals (locale-aware)
- Volumes: 2 decimals
- Prices per liter: 2–3 decimals (default 2)
- Efficiency (L/100km): 1 decimal
- MPG: 1 decimal
- Distances: integer km/mi

### Acceptance Criteria
- After adding two or more entries for a vehicle, the app displays per-fill metrics and rolling (e.g., 30-day) and all-time aggregates.
- Per-brand averages update immediately once data changes.
- Switching unit system flips correctly between L/100km and MPG.

---

## Statistics & Dashboards

### Overview Dashboard
- Cards showing:
  - Current rolling average consumption
  - Rolling average cost per liter
  - Total spend (selected period)
  - Total distance
  - Average cost per km
  - Average distance/day
- Charts:
  - Cost per liter over time (line chart)
  - Consumption over time (L/100km or MPG) (line chart)
- Selectors:
  - Period selector: last 30/90 days, year-to-date, custom range
  - Vehicle selector: single vehicle or all combined

### Brand/Grade Comparison
- Table showing:
  - Brand × (average cost per liter, average consumption, number of fill-ups)

### Acceptance Criteria
- Selecting a period or vehicle updates all widgets and charts.
- Empty-state messaging appears when the selected range has no data.

---

## Non-Functional Requirements

### Security & Privacy
- Store passwords using strong one-way hashing.
- Session management with HTTP-only, Secure cookies.
- Data isolation enforced so users access only their own data.
- Store only necessary PII (email).
- Provide account deletion (hard-delete user data).
- Log authentication events (sign-in, password reset).

### Performance
- Pages render first meaningful content within 2 seconds on typical broadband and mid-range devices.
- History and dashboard queries for up to 5,000 DB entries complete within 500 ms (95th percentile).

### Reliability
- User-friendly error handling without exposing stack traces.
- Server errors logged with correlation IDs.

### Compliance & Legal
- Provide Terms of Service & Privacy Policy pages (basic templates).
- GDPR basics: data export (CSV) and deletion on request.

### Observability
- Application logs contain user ID (hashed or internal) and correlation ID.

### Browser & Device Support
- Latest two major Chrome versions supported.
- Responsive design for mobile (≥360px width) and desktop (≥1280px).

### Other
- Code is readable, maintainable, and consistent with style guidelines.
- Implementation follows framework best practices; avoid exotic/unsupported patterns.
- Uniform feature implementation to reduce cognitive load.
- Solution is production-ready: secure by design, preventing data leaks; strict tenant isolation enforced.
- Architecture kept simple and understandable, preferring straightforward solutions.

---

If you want me to add more sections or details, please let me know!
