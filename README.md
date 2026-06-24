# MedTracker

I built this because medication info is scattered across pharmacy labels, sketchy WebMD pages, and pamphlets nobody reads. MedTracker is one place to keep the medications you actually take, with the official FDA information for each one and a check for whether any of them call out each other in their warning labels.

You search a drug, the app pulls its label data from the openFDA API, and it shows up as a card. Click the card and you see what it's for, the FDA's dosing instructions, and the warnings — broken into readable sections instead of one giant block of legalese. If you have multiple medications added, the detail view scans each one's warnings for mentions of the others. If Tylenol's label says "ask a doctor before use if you are taking the blood thinning drug warfarin" and you've got warfarin in your list, you see that warning surfaced right at the top, with the exact FDA quote as evidence.

The interaction check isn't a substitute for a pharmacist. It only catches what the FDA explicitly names in label text, so it'll miss things. The app is upfront about that.

Built with Next.js 16, TypeScript, Tailwind, shadcn/ui, and Framer Motion. Data from the openFDA Drug Label API. State persists to localStorage.

To run it locally:

    npm install
    npm run dev

Then open http://localhost:3000.