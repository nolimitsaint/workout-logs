Project 1 Solo - CPSC 3750  ReadMe

Workout Logs — Local Collection Manager
Course: CPSC 3750Project: Solo Project 1 — Local Collection ManagerStudent: [Your Name]Environment: Localhost (XAMPP)

Project Overview

This project is a Workout Logs Collection Manager that allows users to Create, Read, Update, and Delete (CRUD) workout records. Each workout entry represents a single workout session and includes information such as date, exercise, sets, reps, and weight.
The application runs locally using XAMPP and stores data using JavaScript objects with localStorage persistence, ensuring data is not lost when the page is refreshed.

How to Run the Application Locally
1. Install XAMPP
2. Start Apache from the XAMPP Control Panel
3. Place the project folder inside:/Applications/XAMPP/htdocs/workout-logs
4. 
5. Open a browser and navigate to:http://localhost/workout-logs
6. 

*Warning*: This project is not deployed publicly and runs only on localhost as required.

Data Model
Each workout record uses the following structure:

{
  id: number,
  date: string,
  exercise: string,
  sets: number,
  reps: number,
  weight: number
}
* Each record has a unique ID
* Data is stored in a JavaScript array
* Persistence is handled via localStorage

CRUD Functionality
1) Create
* Users can add a new workout using the form.
* Input validation ensures required fields and valid numeric ranges.

2) Read
* All workouts are displayed in a table (List View).
* Data loads automatically from localStorage on page load.

3) Update (Edit)
* Users can edit an existing workout.
* Clicking Edit populates the form with existing data.
* Submitting updates modifies the same record (no duplicates).

4) Delete
* Users can delete a workout.
* A confirmation dialog appears before deletion.
* Deleted data persists after refresh.

Stats View
The application includes a Stats View that updates dynamically:
* Total workouts
* Average weight lifted (lbs)
Stats update automatically when workouts are added, edited, or deleted.

Persistence
* Data is stored using localStorage
* The application seeds 30 initial records on first load
* Refreshing the page does not erase user data

 UI Notes
* Clean, readable layout
* Desktop-first design
* Separate sections for:
    * Add/Edit Form
    * Stats View
    * Workout List
* Basic CSS styling applied

Submission Evidence
The submission includes:
* Screenshot of XAMPP Control Panel with Apache running
* Screenshot of the application running in the browser
* GitHub repository link containing the source code

Project Status
All required features for Solo Project 1 have been implemented successfully, including:
* Full CRUD functionality
* Local execution via XAMPP
* Data persistence with localStorage
* Stats View with domain-specific data