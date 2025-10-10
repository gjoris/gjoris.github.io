# Geroen Joris Tech Blog

[![Deploy Hugo site to GitHub Pages](https://github.com/gjoris/gjoris.github.io/actions/workflows/hugo-deploy.yml/badge.svg)](https://github.com/gjoris/gjoris.github.io/actions/workflows/hugo-deploy.yml)

Personal tech blog focusing on AWS, DevSecOps, software architecture, and security.

🌐 **Live Site**: [https://gjoris.github.io](https://gjoris.github.io)

## About

This blog is built with [Hugo](https://gohugo.io/) using the [DoIt](https://github.com/HEIGE-PCloud/DoIt) theme. It features:

- 🌍 Multilingual support (English & Dutch)
- 🎨 Custom branding and styling
- 🔍 SEO optimized with Open Graph and JSON-LD
- 📱 Fully responsive design
- 🚀 Automated deployment via GitHub Actions
- ♿ Accessibility compliant

## Topics Covered

- AWS Cloud Architecture
- DevSecOps Practices
- Software Security
- Infrastructure as Code
- Best Practices & Lessons Learned
- Personal Projects

## Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.112.0 or later)
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/gjoris/gjoris.github.io.git
cd gjoris.github.io

# Initialize submodules (theme)
git submodule update --init --recursive

# Start Hugo development server
hugo server -D

# Visit http://localhost:1313
```

### Creating New Posts

```bash
# Create a new post
hugo new posts/my-new-post.en.md

# Create bilingual post
hugo new posts/my-new-post.en.md
hugo new posts/my-new-post.nl.md
```

### Building for Production

```bash
# Build the site
hugo --minify

# Output will be in ./public/
```

## Project Structure

```
.
├── archetypes/          # Content templates
├── assets/              # CSS, JS, images (processed by Hugo)
├── content/             # Markdown content
│   ├── posts/          # Blog posts
│   ├── about.*.md      # About pages
│   └── contact.*.md    # Contact pages
├── layouts/             # Custom layout overrides
│   └── partials/       # Partial templates
├── static/              # Static files (copied as-is)
├── themes/              # Hugo themes (DoIt)
├── hugo.toml           # Hugo configuration
└── .github/
    └── workflows/      # GitHub Actions CI/CD
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. Checks out the repository
2. Sets up Hugo Extended
3. Builds the site with `hugo --minify`
4. Deploys to GitHub Pages

## Contributing

This is a personal blog, but if you find typos or issues, feel free to open an issue or submit a pull request.

## License

- Blog content: © 2025 Geroen Joris. All rights reserved.
- Code examples in posts: [MIT License](https://opensource.org/licenses/MIT)
- Theme (DoIt): [MIT License](https://github.com/HEIGE-PCloud/DoIt/blob/main/LICENSE)

## Connect

- 💼 [LinkedIn](https://linkedin.com/in/geroenjoris)
- 🐙 [GitHub](https://github.com/gjoris)
- 🎵 [Fasleutel Project](https://gjoris.github.io/fasleutel/)

---

Built with ❤️ using Hugo and deployed on GitHub Pages.
