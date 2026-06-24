# MedTracker

A medication tracking application that integrates with the U.S. Food and Drug Administration's openFDA Drug Label API to provide users with authoritative drug information and detect potential drug-drug interactions within a user's medication list.

## Overview

MedTracker allows users to maintain a personal list of medications and view the corresponding FDA-published label information for each. When multiple medications are present, the application analyzes the official warning text of each medication for references to other medications in the user's list, surfacing potential interactions alongside the original FDA-sourced text as evidence.

The interaction detection is text-based and limited to interactions explicitly named in FDA label documentation. It is not a substitute for professional clinical interaction checkers or pharmacist review.

## Built With

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- openFDA Drug Label API

## Features

- **FDA medication search** — Query the openFDA drug label database by brand or generic name
- **Medication list management** — Add medications with user-defined dosage and notes; data persisted to local storage
- **Drug detail view** — Displays FDA-published purpose, indications, dosing instructions, warnings, and adverse reactions
- **Interaction detection** — Identifies references to other tracked medications within FDA warning text and presents the matching excerpt

## API Reference

The application consumes a single external endpoint:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `https://api.fda.gov/drug/label.json` | Returns FDA-published drug label data filtered by brand or generic name |

No API key is required.

## Environment Variables

No environment variables are currently required. Future versions integrating authentication and cloud persistence will require Supabase configuration.

## Run Locally

1. Clone the repository

       git clone https://github.com/zerxelk/MedTracker.git

2. Install dependencies

       cd MedTracker
       npm install

3. Start the development server

       npm run dev

The application will be available at `http://localhost:3000`.

## Disclaimer

This software is provided for informational purposes only and does not constitute medical advice. Drug interaction detection is based on best-effort text matching against FDA label data and may not identify all clinically relevant interactions. Users should consult a licensed healthcare provider or pharmacist before making medication-related decisions.

## License

This project is licensed under the MIT License.