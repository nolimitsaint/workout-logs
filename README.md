Workout Logs — Cloud Collection Manager

Course: CPSC 3750
Project: Solo Project 2 — Cloud Collection Manager
Student: St Angelo Davis
Frontend Hosting: Netlify
Backend: Python (Flask)
Data Persistence: Server-side JSON files

Live Application

Netlify URL (Frontend):
👉 https://verdant-custard-db96c9.netlify.app

Backend API (Render):
👉 https://workout-logs-8oyd.onrender.com

The application is publicly accessible and works in an incognito/private browser window.

Project Overview

This project extends the local Collection Manager from Solo Project 1 into a cloud-hosted, client/server web application.

The frontend UI remains similar, but all data operations are now handled by a backend service. The browser no longer owns the data. Every Create, Read, Update, and Delete (CRUD) operation is performed through backend API routes.

Workout records are persisted on the server using JSON files, allowing data to persist across browser refreshes and different devices.

Architecture Overview

Frontend

- Hosted on Netlify

- Built with HTML, CSS, and vanilla JavaScript

- Communicates with the backend via HTTP fetch() requests

Backend

- Built with Python (Flask)

- Hosted on Render

- Exposes REST-style API routes for CRUD, paging, and stats

- Persists data in server-side JSON files

(Data Persistence (JSON) ) 

All workout data is stored in a server-side JSON file:

backend/data/workouts.json


The backend loads this file on startup and writes changes back to it after every create, update, or delete.

The application starts with 30 seeded records.

Data persists across:

Page refreshes

Browser sessions

Different devices

No SQL or external databases are used, as required.

(Data Model)

Each workout record follows this structure:

{
  "id": number,
  "date": string,
  "exercise": string,
  "sets": number,
  "reps": number,
  "weight": number
}

(Features & Functionality)
CRUD via Backend

Create: Add a new workout using the form

Read: Fetch workouts from the backend with paging

Update: Edit an existing workout (form auto-populates)

Delete: Remove a workout with confirmation prompt

All CRUD operations are processed by backend API routes.

(Paging)

-Fixed page size of 10 records per page

- Next / Previous navigation buttons

- Current page indicator

- Paging remains correct after add, edit, or delete operations

(Stats View)

- The application includes a live Stats View showing:

- Total number of workouts (entire dataset)

- Average weight lifted (lbs) — domain-specific statistic

- Stats are calculated on the backend and updated dynamically in the UI.


(Backend API Routes)

Method	Route	Description
GET	/api/workouts	Fetch paged workouts
POST	/api/workouts	Create a new workout
PUT	/api/workouts/:id	Update an existing workout
DELETE	/api/workouts/:id	Delete a workout
GET	/api/stats	Fetch total + average weight stats

(Loom Video) 

- A Loom screen recording is included with the submission demonstrating:

- Netlify frontend loading

- Backend API running

- Full CRUD functionality

- JSON persistence across refresh

- Paging behavior

- Stats updating dynamically

(Repository)

GitHub Repository:
👉 https://github.com/nolimitsaInt/workout-logs

(Notes for Instructor)

The backend is hosted on Render (free tier).

On first access after inactivity, the backend may take a few seconds to wake up.

Once active, the application performs normally.

(Project Status) 

All requirements for Solo Project 2 have been fully implemented:

Cloud deployment on Netlify

Backend CRUD with Flask

JSON persistence

Paging (10 per page)

Stats view

Validation (client + server)

Public accessibility without setup

- How to Test the Application

1) Open the live Netlify URL

https://verdant-custard-db96c9.netlify.app

- Open the link in an incognito/private browser window to verify public accessibility.

2) Verify initial data

- Confirm that the application loads with 30 existing workout records.

- Navigate through pages using Next and Previous buttons.

- Verify that each page shows exactly 10 records.

3) Test Create (Add Workout)

- Fill out the Add Workout form with valid data.

- Submit the form and confirm:

- The new workout appears in the list.

- Paging updates correctly if a new page is created.

Stats update immediately.

4) Test Validation

- Attempt to submit the form with missing fields or invalid values.

- Confirm that validation errors are shown and the workout is not created.

5) Test Update (Edit Workout)

- Click Edit on an existing workout.

- Confirm the form is populated with existing data.

- Modify the workout and submit.

- Verify the changes persist after refreshing the page.

6) Test Delete

- Click Delete on a workout.

- Confirm a delete confirmation prompt appears.

- Confirm the workout is removed only after confirmation.

- Refresh the page and verify the record remains deleted.

7) Test Stats View

Verify that:

- Total Workouts reflects the entire dataset.

- Average Weight updates correctly after add, edit, or delete actions.

8) Test Persistence

- Refresh the browser.

- Close and reopen the browser.

- Open the application on a different device or browser.

- Confirm all data changes persist.