# Relicry - A Mystical Card Game

## Overview

Relicry is a web-based card game application with a beautiful and intuitive user interface. The application is designed to be playful, engaging, and mobile-friendly, with a modern, dark theme and vibrant accents.

## Design and Features

### Visual Design

*   **Theme:** A dark, mystical theme that creates an immersive and engaging experience.
*   **Color Palette:**
    *   Background: A very dark desaturated blue (`#0D1117`).
    *   Primary Accent: A vibrant purple/magenta for buttons and highlights (`#F92672`).
    *   Card Background: A slightly lighter dark color (`#161B22`).
    *   Text: A light gray (`#C9D1D9`).
    *   Card Border: A subtle border in a slightly lighter shade than the card background.
*   **Typography:**
    *   **Primary Font:** "Inter" for body text, ensuring readability.
    *   **Title Font:** "Cinzel" for headings, adding a touch of fantasy and elegance.
*   **Animations & Effects:**
    *   **Card Hover:** Cards will have a subtle "lift" and glow effect on hover to provide tactile feedback.
    *   **Staggered Load:** The card grid will use a staggered animation for the cards to appear one by one, creating a dynamic entry effect.
    *   **Button Glow:** The "Populate Database" button will have a soft glow to draw attention to the primary action.

### Features

*   **Card Display:** The application fetches and displays a list of cards from a Firestore database.
*   **Database Population:** A button allows the user to populate the database with card data via a Cloud Function.
*   **Responsive Design:** The UI is fully responsive and works seamlessly on both desktop and mobile devices.

## Current Plan

The current plan is to implement the initial version of the user interface based on the design and features outlined above. This involves:

1.  **Setting up the layout:** Creating the root layout with the specified fonts and global styles.
2.  **Styling the main page:** Applying the dark theme, background, and typography to the main page.
3.  **Creating the card component:** Designing and styling the individual cards with the specified colors, borders, and hover effects.
4.  **Implementing the card grid:** Arranging the cards in a responsive grid layout with staggered animations.
5.  **Styling the button:** Designing the "Populate Database" button with the vibrant accent color and glow effect.
