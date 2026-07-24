# SkillInterview

SkillInterview is a responsive, JSON-driven technical interview preparation website built with HTML5, CSS3, vanilla JavaScript, Bootstrap 5, and Bootstrap Icons.

## Run locally

Browser security prevents JavaScript `fetch()` from reading local JSON through a `file://` URL. Start any static HTTP server from this folder:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

No install, build step, database, or backend is required.

## Features

- Responsive tutorial-style homepage, category library, practice mode, and bookmarks page
- Questions loaded exclusively from JSON files in `data/`
- Live search across question, answer, topic, tips, and related questions
- Difficulty filtering and animated accordion answers
- Code examples, output, notes, mistakes, tips, and related questions
- Bookmarks, completed progress, dark mode, and last category stored in LocalStorage
- Copy, native share, keyboard navigation, visible focus, and reduced-motion support

## Add a category

1. Create a JSON file in `data/` using the existing question schema.
2. Add its metadata and filename to `data/categories.json`.
3. Optionally add a Bootstrap Icon mapping in `assets/js/app.js`.

Use unique numeric question IDs within each category. The application creates a stable key from the category ID and question ID.

## Data schema

```json
{
  "id": 1,
  "category": "Python",
  "topic": "Basics",
  "difficulty": "Beginner",
  "time": "2 min",
  "question": "What is Python?",
  "answer": "Python is a high-level programming language.",
  "code": "print('Hello World')",
  "output": "Hello World",
  "notes": "Optional supporting note.",
  "tips": ["Mention readability"],
  "mistakes": ["Avoid inaccurate claims"],
  "related": ["Why is Python popular?"]
}
```

`code`, `output`, `notes`, `tips`, `mistakes`, and `related` are optional.
