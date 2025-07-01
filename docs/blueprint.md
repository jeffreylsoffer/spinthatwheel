# **App Name**: Card Deck Wheel

## Core Features:

- Fetch CMS Data: Fetch rule groups, prompts, and modifiers from the Strapi CMS, via API calls.
- Create Session Deck: Create a session-specific card deck by randomly picking one primary rule and its corresponding flipped rule from each group.
- Populate the Wheel: Dynamically build the wheel configuration, and populate the wheel slots based on the desired ratios of Rules, Prompts, and Modifiers. Add spin limiting.
- Spin and Reveal: Spin the 3D wheel and trigger animations to land on a randomly pre-determined outcome. Show result in a modal and track used/available items.
- Flip Cheat Sheet: Displays a modal to show primary/flipped rules. Players can update using provided cheatsheet in bottom UI.
- End Slot Buttons: An UI display on the results and status of used slots.

## Style Guidelines:

- Primary color: Intense Blue (#29ABE2) to bring an energizing element to the UX.
- Background color: Light Blue (#E1F5FE) a subtle light blue backdrop to give a calming effect that blends with the Primary.
- Accent color: Strong Cyan (#00FFFF) to offset the blue hues. Also creates clarity where needed.
- Font pairing: 'Playfair' (serif) for main headers and shorter copy and 'PT Sans' (sans-serif) for primary longer form descriptions. This keeps the look fresh, exciting, and interesting to draw in different kinds of readers.
- Use minimalist vector icons for modifiers like SWAP, FLIP, CLONE, and LEFT. Subtle color cues help, such as two opposing arrows for 'SWAP'.
- Modern layout with clear sections for the wheel, the result modal, and the "Flip Cheat Sheet." Leverage white space to create visual balance and prevent a cluttered look.
- Wheel spinning animation should feel 3D with realistic lighting and speed variations. Add ticker to show which item is slowing down to show on-screen.