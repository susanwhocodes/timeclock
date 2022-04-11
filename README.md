# Simple Time Clock Application


This project is meant to be a small code sample easily run and shared. As such, I wanted a lightweight solution that could run with minimal setup and installations. I chose to implement this program primarily with JavaScript and jQuery. Rather than using a database, I use the browser's localStorage and sessionStorage. Due to these design choices, there are various limitations, including that data cannot be shared across browsers and it is not scaleable for large data or ready for professional use.


## Requirements

This project was written to fulfill the following requirements:

Create an application that represents a simple time clock in the programming
language of your choice. The application must follow the requirements listed below:

* Allow user to be identified using a unique ID assigned to each employee.
	* Users that cannot be identified should not be able to use the application.
* Allow users to start a work shift.
	* Do not allow users to start multiple shifts simultaneously.
* Allow users to end a work shift.
	* Do not allow users to start a shift during an active shift.
* Allow users to start/end a break, but only during an active shift.
	* Do not allow employees to end a shift if a break is active.
* Allow users to start/end a lunch, but only during an active shift.
	* Do not allow employees to end a shift if a lunch is active.
* All shift data performed by users should be recorded and made available upon returning to the application.
* Allow for two types of users in the application; administrators and non-administrators.
* Allow administrators to perform any function at any time regardless of the rules stated previously.
* Allow administrators to view a summary report section that summarizes all the employee’s shift activity.


## Usage

To use this application locally, download the files and open index.html in a browser. Keep the existing file structure intact. An internet connection is required to access the jQuery library. This was tested on Chrome, Version 99.0.4844.82 (Official Build) (64-bit).

Valid users have been set up with the following sign in ids:

* manager
* employee1
* employee2
