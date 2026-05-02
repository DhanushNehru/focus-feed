# Contributing to FocusFeed

First off, thank you for considering contributing to FocusFeed! 

FocusFeed is an open-source smart blog aggregator designed to filter out the noise and only show the content that matters. We want to keep it fast, beautiful, and distraction-free.

## Development Setup

1. Fork this repository and clone it to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. The SQLite database (`focusfeed.db`) will be automatically created in the root folder when you add your first feed.

## Pull Requests

1. Create a new branch for your feature (`git checkout -b feature/amazing-feature`).
2. Make your changes and test them thoroughly.
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request against the `main` branch.

## Areas for Contribution
- **Feed Parsing:** Improving the stability of `rss-parser` for obscure Atom feeds.
- **Rule Engine:** Adding more advanced rules (Regex, AI classification, reading time limits).
- **UI/UX:** Enhancing the glassmorphism design or adding new layouts (List vs Grid).

Thank you for helping make FocusFeed better!
