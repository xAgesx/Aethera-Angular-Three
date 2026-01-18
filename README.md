# Aethera
Check the website live at : [xagesxaethera.vercel.app](https://xagesxaethera-5k1ad4kdh-testing-s-projects-449b3f0a.vercel.app)

This is my first project built with Angular, designed to explore the integration of Three.js within a modern web framework. It functions as an interactive landing page and dashboard that hosts a series of WebGL games, while managing standard CRUD operations and security via Firebase and Google APIs.
## Visual Showcase
You Can Check The App Live At : **xagesxaethera.vercel.app**<br>
If unable to, here are a few screenshots for virtual showcase :
<br>
<img width="900" height="600" alt="image" src="landing-screenshot.png" />
<table style="width:100%; border:0;">
  <tr>
    <td align="center">
      <img src="auth-screenshot.png" alt="login page" width="250" height="350">
      <br>
      <p>want to join us ? well proceed with a secure authentification !</p>
    </td>
    <td align="center">
      <img src="browse-screenshot.png" alt="browse Games" width="250" height="350">
      <br>
      <p>This is the List of games we have !</p>
    </td>
    <td align="center">
      <img src="dashboard-screenshot.png" alt="Dashboard" width="250">
      <br>
      <p>Manage all your liked games and have a look at your preferences</p>
    </td>
    <td align="center">
      <img src="reviews-screenshot.png" alt="reviews" width="250">
      <br>
      <p>the simple reviews system for games</p>
    </td>
    <td align="center">
      <img src="gameDetails-screenshot.png" alt="game details" width="250">
      <br>
      <p>curious about a particular game ? well all the info you need is here !</p>
    </td>
    <td align="center">
      <img src="VoidDash-screenshot.png" alt="void dash" width="250">
      <br>
      <p>one of the games we made with Three js</p>
    </td>
  </tr>
</table>

## Technical Deep Dive
1. Angular & Component Architecture

  The Learning Curve: As my first Angular project, I focused on mastering the component lifecycle, especially for initializing and disposing of Three.js scenes to prevent memory leaks.
  
  State Management: Managed app state and user sessions using Angular services and RxJS observables.

2. 3D Integration (Three.js)

  Interactive Landing Page: The hero section features a custom WebGL scene that responds to mouse movement and scroll events.
  
  Game Suite: Built and hosted several mini-games directly within Angular components. Each game uses its own Three.js renderer, managing collision detection and real-time score tracking.

3. Backend & Security (Firebase + APIs)

  Authentication: Integrated Firebase Auth for secure user sign-up and login (Email/Password).
  
  Database (CRUD): Used Firestore to handle real-time data.
  
  Create/Read: Users can post and view data (like high scores or profile updates).
  
  Update/Delete: Full permission-based control over user-generated content.
  
  Bot Protection: Implemented Google reCAPTCHA v2 on the authentication and contact forms to mitigate automated spam.

## Tech Stack

Frontend: Angular (v17+), TypeScript

3D Engine: Three.js

Styles: Tailwind CSS

Backend-as-a-Service: Firebase (Authentication, Firestore)

Third-Party APIs: Google reCAPTCHA v2



## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
