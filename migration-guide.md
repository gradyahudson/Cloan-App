# HubSpot → WordPress Migration Guide
### NHOMS (nhoms.com) & MassOMS (massoms.com)

---

## Overview

This repository contains a WordPress theme and Elementor page templates for migrating both NHOMS and MassOMS from HubSpot CMS to WordPress with Elementor drag-and-drop editing.

**What's included:**
- `nhoms-massoms-theme/` — installable WordPress theme (zip and upload)
- `elementor-templates/nhoms/` — 6 page templates for NHOMS
- `elementor-templates/massoms/` — 6 page templates for MassOMS

---

## Step 1 — Set Up WordPress

1. Install WordPress on your host (or locally via [Local by Flywheel](https://localwp.com/))
2. Log in to WordPress Admin (`/wp-admin`)
3. Go to **Settings → General** and set:
   - Site Title: "NHOMS" or "MassOMS"
   - Timezone: America/New_York

> **Run two separate WordPress installs** — one for NHOMS, one for MassOMS — since they are different organizations/domains.

---

## Step 2 — Install & Activate the Theme

1. Zip the theme folder:
   ```bash
   cd /path/to/repo
   zip -r nhoms-massoms-theme.zip nhoms-massoms-theme/
   ```
2. In WordPress Admin go to **Appearance → Themes → Add New → Upload Theme**
3. Upload `nhoms-massoms-theme.zip` and click **Activate**
4. The site will now display with a basic header and footer

---

## Step 3 — Install Elementor

1. Go to **Plugins → Add New**
2. Search for **Elementor Website Builder** (free, by Elementor)
3. Install and Activate
4. *(Optional)* Install **Elementor Pro** for advanced features like a Header/Footer builder, Theme Builder, and popup forms

> **Elementor Free is sufficient** to import and edit all templates in this repo.

---

## Step 4 — Import Elementor Templates

Each page template is a `.json` file that imports directly into Elementor.

### How to import:
1. In WordPress Admin go to **Elementor → My Templates**
2. Click **Import Templates** (folder icon, top right)
3. Select a `.json` file from `elementor-templates/nhoms/` or `elementor-templates/massoms/`
4. Repeat for all templates you want

### NHOMS templates to import (`elementor-templates/nhoms/`):
| File | Page |
|------|------|
| `home.json` | Homepage |
| `about.json` | About NHOMS |
| `find-a-member.json` | Find a Member directory |
| `news-events.json` | News & Events |
| `resources.json` | Member Resources |
| `contact.json` | Contact |

### MassOMS templates to import (`elementor-templates/massoms/`):
| File | Page |
|------|------|
| `home.json` | Homepage |
| `about.json` | About MassOMS |
| `find-a-surgeon.json` | Find a Surgeon directory |
| `patient-resources.json` | Patient Resources |
| `news-events.json` | News & Events |
| `contact.json` | Contact |

---

## Step 5 — Create WordPress Pages & Apply Templates

For each page on the site:

1. Go to **Pages → Add New**
2. Set the page title (e.g., "Home", "About", "Find a Member")
3. Click **Edit with Elementor**
4. In the Elementor editor, click the **folder icon** (My Templates) in the bottom bar
5. Find the imported template and click **Insert**
6. The layout loads — now fill in real content (see Step 6)
7. Click **Publish**

### Set the Homepage:
1. Go to **Settings → Reading**
2. Set **Your homepage displays** to "A static page"
3. Select your Home page from the dropdown

---

## Step 6 — Migrate Content from HubSpot

### How to export content from HubSpot:

**Option A — Page by page (recommended):**
1. In HubSpot, go to **Marketing → Website → Website Pages**
2. Open each page in your browser
3. Copy text content (headings, body paragraphs, lists)
4. Download images (right-click → Save image)
5. Paste into the corresponding Elementor widget on your WordPress page

**Option B — HubSpot export:**
1. HubSpot Admin → **Settings → Tools → Export**
2. Export a CSV of page titles and URLs as a reference list
3. Use as a checklist to ensure all pages are migrated

### Content to migrate per page:
- All headings and body text
- Images (upload to WordPress Media Library first)
- Links (update to new WordPress URLs)
- Forms → recreate using WPForms or Contact Form 7 (see Step 7)
- Team member names/bios
- Events listing
- Resource/document downloads (upload PDFs to WordPress Media Library)

---

## Step 7 — Set Up Contact Forms

The contact page templates include a placeholder where the form goes.

1. Install **WPForms Lite** (free) or **Contact Form 7** (free)
2. Create a new form matching what was on HubSpot
3. Copy the shortcode (e.g., `[wpforms id="1"]`)
4. In Elementor, find the contact form placeholder HTML widget
5. Replace the placeholder with a **Shortcode** widget and paste your shortcode

---

## Step 8 — Configure Navigation Menus

1. Go to **Appearance → Menus → Create a new menu**
2. Create **Primary Menu** — add all pages
3. Create **Footer Menu** — add key links
4. Assign: Primary → "Primary Navigation" location, Footer → "Footer Navigation"

**Suggested NHOMS primary menu:**
- Home → About → Find a Member → News & Events → Resources → Contact

**Suggested MassOMS primary menu:**
- Home → About → Find a Surgeon → Patient Resources → News & Events → Contact

---

## Step 9 — Upload Logo & Brand Assets

1. Go to **Appearance → Customize → Site Identity**
2. Upload your logo (PNG with transparent background, ~300×96px)
3. Set favicon

**Update brand colors** in the theme's CSS variables:
- Open `nhoms-massoms-theme/style.css`
- Find `:root { ... }` at the top
- Update `--color-primary`, `--color-secondary`, etc. to match HubSpot brand
- Or override globally via **Elementor → Site Settings → Global Colors**

---

## Step 10 — Member/Surgeon Directory

The Find a Member / Find a Surgeon pages include placeholder search UI and sample cards.

**For a live searchable directory, choose one approach:**

**Option A — Business Directory Plugin (recommended for non-developers):**
1. Install **Business Directory Plugin** (free tier available)
2. Create a directory category for "Members" or "Surgeons"
3. Add each member/surgeon as a listing
4. Place the directory shortcode on the Find a Member/Surgeon page

**Option B — Custom Post Type (developer approach):**
1. Create a custom post type "Surgeon" using a plugin like **CPT UI** + **ACF**
2. Add fields: Name, Practice, City, Phone, Specialties
3. Create a custom archive template or use Elementor Pro's dynamic content

**Option C — Static cards (simplest):**
- Edit each member card directly in the Elementor HTML widgets
- Update the placeholder `[Surgeon Name]`, `[City]`, etc. with real data
- No plugin required, but not filterable/searchable

---

## Step 11 — SEO & Redirects

1. Install **Yoast SEO** or **Rank Math** (free)
2. Set meta titles and descriptions for each page
3. In your hosting/DNS settings, set up 301 redirects from old HubSpot URLs to new WordPress URLs

**Common redirect pattern:**
```
nhoms.com/find-a-member  →  nhoms.com/find-a-member/   (trailing slash)
nhoms.com/news           →  nhoms.com/news-events/      (if slug changed)
```

---

## Step 12 — Final QA Checklist

Before going live:

- [ ] All pages created and content migrated from HubSpot
- [ ] Images uploaded and displaying correctly
- [ ] Contact form works (test submission)
- [ ] Navigation menus set up for desktop and mobile
- [ ] Mobile responsiveness tested (iPhone, Android)
- [ ] Logo and favicon uploaded
- [ ] Homepage set in Settings → Reading
- [ ] Brand colors match HubSpot site
- [ ] SSL certificate active (https://)
- [ ] 301 redirects configured
- [ ] Old HubSpot site set to redirect to new WordPress site

---

## Editing Pages After Go-Live

To edit any page with drag-and-drop:

1. Log in to WordPress Admin
2. Go to **Pages** and find the page
3. Click **Edit with Elementor**
4. Click any section/widget to edit inline
5. Drag sections to reorder
6. Click **Update** to publish changes

---

## Support Resources

| Resource | URL |
|----------|-----|
| Elementor documentation | https://elementor.com/help/ |
| WordPress documentation | https://wordpress.org/documentation/ |
| WPForms docs | https://wpforms.com/docs/ |
| Business Directory Plugin | https://businessdirectoryplugin.com/documentation/ |
| HubSpot export help | https://knowledge.hubspot.com/website-pages/export-your-website-pages |
