# Pet Tracker Documentation

This directory contains the VitePress documentation site for Pet Tracker.

## 📖 Documentation Structure

```
docs/
├── .vitepress/           # VitePress configuration
│   └── config.ts         # Site configuration
├── public/               # Static assets
├── getting-started/      # Setup and installation guides
├── introduction/         # What is Pet Tracker
├── api/                  # API reference
├── configuration/        # Service setup guides
├── contributing/         # Contributing guidelines
├── index.md              # Homepage
└── changelog.md          # Version history
```

## 🚀 Development

### Prerequisites
- Node.js 18+
- pnpm (recommended)

### Install Dependencies
```bash
pnpm install
```

### Start Development Server
```bash
pnpm docs:dev
```

The documentation site will be available at `http://localhost:5173`.

### Build for Production
```bash
pnpm docs:build
```

### Preview Production Build
```bash
pnpm docs:preview
```

## 📝 Writing Documentation

### Markdown Features

VitePress supports enhanced Markdown features:

#### Code Blocks with Syntax Highlighting
```typescript
interface Pet {
  id: string;
  name: string;
  type: PetType;
}
```

#### Custom Containers
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a danger notice
:::

::: info
This is an info notice
:::

#### File Tree
```
src/
├── components/
├── screens/
└── services/
```

### Frontmatter

Pages can include frontmatter for metadata:

```yaml
---
title: Custom Page Title
description: Custom page description
---
```

### Navigation

Update `.vitepress/config.ts` to modify:
- Navigation menu
- Sidebar structure
- Site metadata

## 🎨 Customization

### Theme Configuration

The site uses the default VitePress theme with custom configuration in `config.ts`:

- Colors and branding
- Navigation structure
- Footer information
- Social links

### Assets

Place static assets in the `public/` directory:
- Images: `public/images/`
- Icons: `public/icons/`
- Favicons: `public/favicon.ico`

## 📱 Responsive Design

The documentation is automatically responsive and works well on:
- Desktop computers
- Tablets
- Mobile devices

## 🔍 Search

VitePress includes built-in search functionality that indexes all documentation content automatically.

## 🌐 Deployment

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy Documentation
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: pnpm install
      - name: Build documentation
        run: pnpm docs:build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vitepress/dist
```

### Netlify
1. Connect your repository to Netlify
2. Set build command: `pnpm docs:build`
3. Set publish directory: `docs/.vitepress/dist`
4. Deploy

### Vercel
1. Import your repository in Vercel
2. Set framework preset: "Other"
3. Set build command: `pnpm docs:build`
4. Set output directory: `docs/.vitepress/dist`
5. Deploy

## 🤝 Contributing

To contribute to the documentation:

1. **Fix typos and improve content**: Edit pages directly
2. **Add new sections**: Create new markdown files
3. **Update navigation**: Modify `.vitepress/config.ts`
4. **Add images**: Place in `public/` directory
5. **Test changes**: Run `pnpm docs:dev` locally

### Documentation Guidelines

- **Be clear and concise**: Use simple language
- **Include examples**: Show code and screenshots
- **Keep current**: Update for new features
- **Link related content**: Cross-reference other pages
- **Test instructions**: Verify all steps work

## 📋 Content Checklist

When adding new documentation:

- [ ] Content is accurate and up-to-date
- [ ] Code examples are tested
- [ ] Screenshots are current
- [ ] Links work correctly
- [ ] Navigation is updated if needed
- [ ] Mobile layout looks good
- [ ] Search can find the content

## 🔗 Useful Links

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Vue.js Documentation](https://vuejs.org/) (VitePress is built on Vue)

The documentation is a crucial part of Pet Tracker - it helps users get started and developers contribute effectively! 📚🐾
