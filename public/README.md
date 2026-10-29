# Pawfect Match

A buildless dog matcher at https://allisontluo.github.io/dogmatch/. The approved prototype layout is now the main experience, with the original swipe gesture retained.

## Run and verify

```sh
python3 -m http.server 8094 --directory public
node --test tests/*.test.mjs
```

Open http://localhost:8094/. Use HTTP for native JavaScript modules. There is no account, backend or runtime AI service.

## Experience

- Original fullscreen dog-collage welcome with Start matching.
- One question at a time, four clickable chapters, no preselected answers, and a review screen for direct editing.
- Activity (0–4 hours) and hours away sliders, readable hours/minutes, a training dropdown.
- Recommended, Favorites and the complete 52-type Browse catalog with immediate name/type search. Your dogs opens saved favorites first when any are present. Match scores appear after finishing the questionnaire.
- **Swipe dogs:** drag the photo right to like/save or left to pass, with directional feedback. Like/Pass buttons, arrow keys, Undo and new rounds remain available. Rounds contain up to ten adaptive choices; restarting keeps favorites. A button beside the dog library links directly to swiping.
- **Final dogs:** after ten swipes, all liked dogs appear on their own screen with comparison checkboxes and top-pick buttons. The screen is also available from the menu or See my final dogs while swiping. Undo last swipe can reopen the last decision.
- **Reset answers:** clearly visible beside Swipe dogs and Edit answers, on questionnaire/review screens, and in settings. It clears quiz progress and starts a fresh swipe round, retaining favorites, comparisons, top pick and appearance.
- Compare up to three named dog profiles, reorder with drag handles or arrow buttons, see fit differences and preview a different activity time before applying it.
- Mark a changeable top pick with confirmation and a large photo. Reduced animation suppresses confetti and drag travel.
- Saved light/dark mode, text size (85–150%), keyboard focus and native dialogs.

## Saved-data upgrade

`experience-state.mjs` imports existing device data once into `pawfect-match-v2` and preferences into `pawfect-match-v2-preferences`.

Completed prototype answers take priority when present. Otherwise, a completed original questionnaire takes priority over a partial prototype. Favorites from both versions are retained. Comparison order starts with the chosen version, with room for up to three selections. The chosen version's swipe history is retained, and Undo accounts for favorites retained from the other version. Existing owner facts and photos are unchanged.

Original records (`uxdesign-pawfect-match-v1` and `pawfect-prototype-v2`) are left untouched for rollback. After migration, the new main record wins, including a user's explicit reset. Later edits in the separate prototype do not overwrite main-site answers.

## Active source

- `index.html`: app shell, dialogs and source credits.
- `experience.css`: approved blue/white design, Times New Roman, responsive layouts.
- `experience.js`: views, interactions, gestures and saving.
- `questions.mjs`: questionnaire definitions and readable time labels.
- `match-guidance.mjs`: consistent fit labels and concrete explanations of the selected answers.
- `experience-state.mjs`: normalization and one-time migration.
- `engine.mjs`, `catalog.mjs`, `profiles.mjs`: shared matching model and all 52 types.
- `comparison-tools.mjs`: comparison ordering.
- `photos/`: existing project and supplied photographs; credits remain in the website and `photos/credits.json`.

The prototype remains available at `/prototype/` as the approved reference. Earlier main-site assets remain in Git but are no longer loaded by the main page.

Taste direction: Editorial greeting, seed 2035120197, no new draw. This promotes the approved design, retaining the brand and existing photos. Browser checks use supported browser tools; the standalone Taste inspector is not claimed as run.

## Matching model

Scores are authored teaching estimates of dog-type fit, not adoption listings, AKC ratings or individual suitability guarantees. Base weights are activity 25, training 15, space 10, size 15, grooming 15, shedding 10 and experience 10. Coat and selected household preferences add weights; the chosen priority doubles relevant base weights. Labels and concrete activity, training, coat-care, and preference gaps explain each result. Discovery combines overall fit (85%) with learned similarity (15%).

Winnie, Monty, Mit and Link include owner-confirmed details, with unknown fields left unknown. Other identities are existing examples. The website distinguishes these from verified adoption listings. No new dog facts, photos or third-party dependencies were added during the transfer.
