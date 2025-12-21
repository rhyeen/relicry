# Project Blueprint

## Overview

This document outlines the development plan for a web application that leverages Firebase for its backend services and Next.js for the frontend. The application will serve as a companion for TCG (Trading Card Game) events, providing information about cards, events, quests, and rewards.

## Implemented Features

### Core Technologies

*   **Frontend:** Next.js with App Router
*   **Backend:** Firebase (Firestore, Functions, Authentication, Storage)
*   **Styling:** (To be determined, will use modern design principles)

### Firebase Integration

*   **Firestore:** Used as the primary database. Data is mostly publicly accessible, with specific authenticated-only access for certain operations.
*   **Firebase Functions:** Used for special backend logic, particularly for authenticated calls (e.g., admin actions).
*   **Firebase Authentication:** Google Authentication is used to identify users, with a distinction between "admin" and "player" roles.
*   **Firebase Storage:** Used for storing images for cards, events, etc.

### Page Structure & Routing

The application uses a specific URL structure to represent different types of content. All routes are case-insensitive.

*   `/apex/[id]`: **Apex Pages** - Displays different content based on whether the user is authenticated as an admin.
*   `/[version]/[id]`: **Card Pages** - Displays different versions of a card.
    *   `version`: `1` (Normal), `2` (Foiled), `3` (Alt Art).
*   `/e/[id]`: **Event Pages** - Displays information about a specific TCG event.
*   `/q/[id]`: **Quest Pages** - Displays information about exhibitors/vendors for a specific quest.
*   `/t[token_number]/[quest_id]`: **Quest Token Pages** - Displays the vendor associated with a specific quest token.
    *   `token_number`: `1`, `2`, or `3`.
*   `/e/[event_id]/[quest_id]`: **Reward Pages** - Displays the reward for completing a quest at a specific event.
*   `/admin/...`: **Admin Pages** - A section of the site for administrative tasks, requiring admin authentication.

### Common Page Functionality

*   **Authentication:**
    *   Users can log in with Google.
    *   Admin users have access to different views and functionality on certain pages (e.g., Apex pages, Admin pages).
    *   Logged-in "player" users can perform actions like saving a card to their collection.
*   **Performance:**
    *   Pages are designed to be highly performant, especially for use at conventions with potentially poor internet connectivity.
    *   Emphasis on offline caching and other performance optimization techniques. Static content is prioritized.
*   **Case-Insensitive Routing:** URLs are treated as case-insensitive (e.g., `/q/xyz123` is the same as `/Q/XYZ123`).

## Current Task: Initial Setup and Firebase Integration

The current task is to set up the project structure based on these requirements and integrate Firebase services as described. This involves:

1.  Confirming Firebase configuration in `src/utils/firebase.ts`.
2.  Setting up the basic routing structure in the `/app` directory.
3.  Implementing a basic authentication flow using Firebase Authentication.
4.  Creating placeholder pages for each of the defined page types.
5.  Adding the firebase configuration to the `.idx/mcp.json` file.
