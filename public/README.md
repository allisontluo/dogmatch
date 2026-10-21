# Pawfect Match

A buildless HTML, CSS, and vanilla JavaScript dog matcher with 51 representative
breed, size-variety, and mix profiles. No runtime AI service or backend is used.

## Run and test

From the repository root:

```sh
python3 -m http.server 8080 --directory public
node --test tests/dog-match.test.mjs
```

Open `http://localhost:8080/dog-match/`. The retained Java server also works:
`java src/Main.java`. Use HTTP rather than opening the HTML with `file://` because
the app uses native JavaScript modules.

## Experience

Complete four short steps: home, routine, preferences, and household. The household
step adds questions about children, pets, barking, visitors, and drool. A live
shortlist responds to answers. Completed quizzes unlock photo swiping below the
questionnaire. Swipe/drag right or left, use Like/Pass buttons, or focus the card
and use arrow keys. Likes save favorites; passes remove them from favorites.
Undo restores the last choice's prior favorite state. Restart clears swipe
learning while keeping the questionnaire and favorites.

Search all 51 types, save favorites, and select up to three dogs to compare. The
chart can show overall fit, activity, grooming, enrichment, or coat fullness.

## Matching and coat filtering

`engine.mjs` normalizes input and computes weighted scores. Base weights are
activity 25, enrichment 15, space 10, size 15, grooming 15, shedding 10, and
experience 10. A selected coat preference adds weight 30. Selected children or pet
needs add 15 each; quietness, visitor sociability, and lower drool add 10 each.
Neutral household choices add no weight. A priority doubles relevant base weights,
then the result is normalized. Long days away without support cap scores at 55.

Coat fullness is an authored visual estimate: 0 sleek, 1 shorter/wiry, 2 full or
feathered, 3 very full or curly. Grooming and individual variation affect appearance.
Fluffy-only filters the live shortlist and swipe deck to levels 2–3. Shorter-only
uses 0–1. Greyhounds and Whippets are level 0 and are excluded from fluffy-only
recommendations. The full catalog remains searchable, with coat mismatches marked.

Discovery combines overall profile fit (85%) and learned similarity (15%). Likes
favor similar coat appearance, size, and activity; passes favor different traits.
Learning confidence grows over the first three votes. Each matching type appears
once per round. Progress counts the current matching coat set. Switching filters
preserves decisions and exposes unseen dogs from the newly selected set.

All numerical profiles and household tendencies are teaching estimates, not AKC
ratings, medical prescriptions, or guarantees of individual compatibility/safety.
Children and other pets need supervised introductions and individual assessment.
Doodles are mixes with variable sizes and coats. Terrier is represented by a Jack
Russell Terrier. Poodle sizes are separate type profiles.

## Files and assets

- `index.html`: semantic questionnaire, result regions, and source disclosures.
- `style.css`: responsive blue, white, and navy design with local DM Sans fonts.
- `app.js`: form events, state persistence, rendering, gestures, search, comparison.
- `engine.mjs`: normalization, scoring, coat filtering, and saved-state recovery.
- `catalog.mjs`: 40 additional profiles and household estimates for all 51 types.
- `photos/`: bundled images and source/license metadata in `credits.json`.
- `fonts/OFL.txt`: DM Sans font license.
- `../../AI_LOG.txt`: exact user prompts, real fixes, and code-defense documentation.
- `../../tests/dog-match.test.mjs`: ten tests for scores, filters, expanded data,
  photos, household effects, history continuation, and old/corrupt data recovery.

The Aussiedoodle image was provided by the user; other images have source and
license credits in the website and `photos/credits.json`. Browser storage holds
answers, favorites, comparisons, and swipe history. Clear-data removes only this
project's key. Old records remain compatible; new household fields default to
neutral values. Storage errors fall back to session-only behavior.

## Visible match profiles

Liked dogs appear as photo cards directly under “Your matches”, without opening
the all-types catalog. `profiles.mjs` contains a stable fictional name, age, and
interests for each type, including Ginger, age 5, the fetch-loving Golden Retriever.
A sample-profile notice distinguishes these examples from real adoption listings
or verified facts about the pictured dogs. Scores still use dog-type estimates.
Each card has About details, save/remove, and comparison controls. With no likes,
the grid shows three suggestions that respect the coat filter. My matches
navigation and a link beneath swiping make the section easy to find.

## Winnie, themes, and match charts

Winnie's owner supplied her name and female gender. Her age and interests are left
unspecified. Other personal profiles remain illustrative. The theme button saves
a light/dark preference separately from quiz data, falling back to the system
preference when unset. Circular charts show profile-fit scores and remaining
difference, with readable percentages and accessible labels; other comparison
metrics retain bars. Shortened copy keeps detailed methodology in the disclosure.
