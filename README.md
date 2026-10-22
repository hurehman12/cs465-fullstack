# cs465-fullstack
CS-465 Full stack development with MEAN

About the Project
Travlr Getaways is a full stack web application that I built using the MEAN stack: MongoDB, Express, Angular, and Node.js. The project includes a customer-facing website where users can view trip information and an Angular single-page application (SPA) for administrators to manage trips.
The application uses a RESTful API to connect the frontend to the Express backend and MongoDB database. I also added login authentication and JSON Web Tokens (JWT) to protect the admin features that allow users to add, edit, and delete trip information.

Architecture
Throughout this project, I worked with a few different types of frontend development. The customer-facing side uses Express, HTML, JavaScript, and Handlebars templates. Express follows the Model-View-Controller structure, so routes, controllers, views, and models each have their own purpose. This side of the application works well for displaying trip information to customers.
The admin side uses Angular as a single-page application. Angular is organized using components, services, models, and routes. Compared with the Express site, the Angular SPA feels more interactive because users can make changes without having to reload the entire page. Once an administrator logs in, they can add, edit, and delete trip information directly from the SPA.
The backend uses MongoDB, which is a NoSQL database. MongoDB worked well for this project because the trip data can be stored as documents that are similar to the JSON data being passed throughout the application. Mongoose is used to connect the Express and Node.js backend to MongoDB and also helps define the structure of the data.

Functionality
JSON and JavaScript are related, but they are not the same thing. JavaScript is a programming language that can be used to create application logic, functions, variables, and other behavior. JSON is mainly used as a format for storing and transferring data.
In this project, JSON helped connect the frontend and backend. The RESTful API sends trip information between the Angular SPA, Express server, and MongoDB in JSON format. This makes it easier for each part of the application to work with the same data.
There were also several times during the project when I refactored code. One example was reorganizing the customer-facing application into an MVC structure so the routes, controllers, views, and models were separated. I also moved the Angular API calls into a service instead of repeating the same HTTP code inside different components.
Using reusable components also made the project easier to manage. For example, trip cards could be reused to display multiple trips instead of writing separate code for each one. Reusable components reduce duplicate code and make future changes easier because one component can be updated instead of changing the same code in multiple places.

Testing
RESTful APIs use different HTTP methods depending on what the application needs to do. GET is used to retrieve information, POST is used to create new information, PUT is used to update information, and DELETE is used to remove information. Endpoints such as /api/trips and /api/trips/ tell the server which resource the request is working with.
Throughout the project, I tested the API endpoints to make sure trip information could be retrieved from and stored in MongoDB correctly. I also tested the Angular application with the API. For example, GET requests loaded trip information into the SPA, and PUT requests allowed me to edit a trip and save the changes back to the database.
I was also able to make changes through the Angular admin application and then see those same changes on the customer-facing Express site. This helped confirm that both sides of the application were connected to the same backend and database.
Security added another level of testing. The POST, PUT, and DELETE endpoints require a valid JSON Web Token. I tested requests without a token and confirmed that they were rejected with an unauthorized response. I also tested requests with valid tokens and confirmed that they were allowed through. Invalid or changed tokens were rejected as well.
On the frontend, the Add, Edit, and Delete options are hidden until the administrator logs in. This showed me that testing security is not just about making sure valid requests work. It is also important to make sure unauthorized requests do not work.

Reflection
This course helped me get a much better understanding of how all the different pieces of a full stack application connect together. Before this course, I understood some of these technologies individually, but building Travlr Getaways helped me see how the frontend, backend, database, API, and security all work together in one application.
I gained more experience with JavaScript, Node.js, Express, MVC architecture, MongoDB, Mongoose, RESTful APIs, and Angular. I also learned more about authentication using JSON Web Tokens and how to protect API endpoints so only logged-in users can make certain changes.
One of the biggest things I learned from this project was how to troubleshoot problems across different parts of an application. Sometimes an issue showing up in Angular was actually caused by the API, an Express route, a controller, or the database. Learning how to follow the request through each layer helped improve my debugging and problem-solving skills.
This course also helped me professionally because a lot of the same concepts apply to larger enterprise applications. Understanding how APIs, databases, authentication, frontend applications, and backend services all connect gives me a stronger foundation as a developer. It also gave me more experience explaining system architecture and documenting how an application works, which will help as I continue working toward more senior development and architecture-focused roles.
