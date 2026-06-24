# MedTracker

A personal medication tracker that pulls real drug information from the openFDA API and flags potential interactions between the medications in your list. Search any prescription or OTC drug, see the FDA's official purpose, dosing, warnings, and side effects, and get warned when the FDA label of one of your meds explicitly mentions another med you're tracking.

## Built With

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- openFDA Drug Label API

## Features

- **FDA search** — Search the openFDA drug label database for any prescription or OTC medication
- **Personal med list** — Add medications with your own dosage and notes; persisted to localStorage
- **Detail view** — Purpose, indications, official FDA dosing, warnings, side effects
- **Interaction detection** — Scans FDA warning text for other meds in your list, surfaces the exact FDA quote
- **Polished UI** — Animated cards, skeleton loading states, responsive grid

## How Interaction Detection Works

For each medication, the app pulls the full FDA label text. When you open the detail view, it searches that med's warnings for the brand names, generic names, and significant active ingredients of the other meds in your list. A match means the FDA's own label calls out a specific drug-drug warning — for example, Tylenol's label saying "Ask a doctor or pharmacist before use if you are taking the blood thinning drug warfarin" matches if you have warfarin in your list.

This only catches interactions the FDA explicitly names in the label. It is not a replacement for a pharmacist or clinical interaction checker.

## Run Locally

1. Clone the project

       git clone https://github.com/zerxelk/MedTracker.git

2. Install dependencies

       cd MedTracker
       npm install

3. Start the dev server

       npm run dev

Open http://localhost:3000 in your browser.

## License

This project is licensed under the MIT License.