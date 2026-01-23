# CSS & Tailwind CSS Interview Questions

Based on your Anime Explorer app.

---

## CSS Fundamentals

### Box Model
```css
/* What is the total width? */
.box {
  width: 100px;
  padding: 10px;
  border: 5px solid black;
  margin: 20px;
}
/* Answer: 100 + 10*2 + 5*2 = 130px total width */
```

### Centering Elements

#### Method 1: Flexbox
```css
.parent {
  display: flex;
  justify-content: center;  /* horizontal */
  align-items: center;      /* vertical */
}
```

#### Method 2: Grid
```css
.parent {
  display: grid;
  place-items: center;
}
```

#### Method 3: Absolute + Transform
```css
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

#### Method 4: Margin Auto (horizontal only)
```css
.child {
  margin: 0 auto;
}
```

### Specificity
```css
/* Order from lowest to highest specificity */
div {}                              /* 0,0,1 */
.class {}                           /* 0,1,0 */
#id {}                              /* 1,0,0 */
style="color: red"                  /* 1,0,0,0 */
!important                          /* Infinity */
```

### Position Property
```css
.static   { position: static; }    /* Default, no positioning */
.relative { position: relative; }  /* Relative to normal position */
.absolute { position: absolute; }  /* Relative to nearest positioned ancestor */
.fixed    { position: fixed; }     /* Relative to viewport */
.sticky   { position: sticky; }    /* Sticks on scroll */
```

### Z-index
```css
/* Only works on positioned elements */
.parent { z-index: 1; }
.child { z-index: 100; }  /* Higher z-index = on top */
```

---

## Flexbox (Your App Uses This!)

### Your App's Flexbox:
```tsx
/* AnimeMainList.tsx */
<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
  {/* Flex column on mobile, row on desktop */}
</div>
```

### Flex Container Properties
```css
.container {
  display: flex;
  flex-direction: row | column;          /* Main axis direction */
  justify-content: flex-start | center | space-between;  /* Main axis alignment */
  align-items: stretch | center | flex-start;            /* Cross axis alignment */
  flex-wrap: nowrap | wrap;              /* Allow wrapping */
  gap: 10px;                             /* Space between items */
}
```

### Flex Item Properties
```css
.item {
  flex-grow: 1;    /* Grow to fill space (default 0) */
  flex-shrink: 0;  /* Shrink when space is tight (default 1) */
  flex-basis: 200px; /* Initial size before growing/shrinking */
  flex: 1 0 200px;  /* shorthand: grow shrink basis */
  align-self: center; /* Override container alignment */
}
```

### Common Layouts

**Holy Grail Layout:**
```css
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main {
  flex: 1;  /* Takes remaining space */
}
```

**Card Grid:**
```css
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.card {
  width: calc(25% - 20px);  /* 4 cards per row */
}
```

---

## Grid (Your App Uses This!)

### Your App's Grid:
```tsx
/* AnimeMainList.tsx */
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>
```

### Grid Container Properties
```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;  /* 3 equal columns */
  grid-template-columns: repeat(3, 1fr);     /* 3 equal fractions */
  grid-template-columns: 200px 1fr;          /* Fixed + remaining */
  grid-template-rows: 100px auto;
  gap: 20px;
}
```

### Grid Item Placement
```css
.item {
  grid-column: 1 / 3;    /* Span from line 1 to 3 */
  grid-row: 1 / 2;       /* Span 1 row */
  grid-area: 1 / 1 / 2 / 3;  /* row-start / col-start / row-end / col-end */
}
```

### Grid Template Areas
```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}
.header { grid-area: header; }
```

---

## Tailwind CSS (Your App Uses This!)

### Your App's Tailwind Classes:
```tsx
/* AnimeMainList.tsx */
<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
  <input
    type="text"
    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600"
  />
</div>
```

### Common Utility Classes

#### Spacing
```css
/* Margin */
m-4      { margin: 1rem; }
mx-4     { margin-left: 1rem; margin-right: 1rem; }
my-4     { margin-top: 1rem; margin-bottom: 1rem; }
mt-4     { margin-top: 1rem; }
mb-4     { margin-bottom: 1rem; }

/* Padding */
p-4      { padding: 1rem; }
px-4     { padding-left: 1rem; padding-right: 1rem; }
py-4     { padding-top: 1rem; padding-bottom: 1rem; }
```

#### Sizing
```css
/* Width */
w-full   { width: 100%; }
w-1/2    { width: 50%; }
w-auto   { width: auto; }
w-screen { width: 100vw; }

/* Height */
h-full   { height: 100%; }
h-screen { height: 100vh; }
```

#### Colors
```css
/* Text */
text-gray-900   111827; }
text-gray-600 { color: #    { color: #4b5563; }
text-red-500     { color: #ef4444; }

/* Background */
bg-white         { background-color: white; }
bg-gray-100      { background-color: #f3f4f6; }
bg-red-500       { background-color: #ef4444; }

/* Border */
border           { border: 1px solid; }
border-gray-300  { border-color: #d1d5db; }
border-2         { border-width: 2px; }
```

#### Typography
```css
/* Font Size */
text-xs   { font-size: 0.75rem; }
text-sm   { font-size: 0.875rem; }
text-base { font-size: 1rem; }
text-lg   { font-size: 1.125rem; }
text-xl   { font-size: 1.25rem; }
text-2xl  { font-size: 1.5rem; }
text-3xl  { font-size: 1.875rem; }

/* Font Weight */
font-thin       { font-weight: 100; }
font-light      { font-weight: 300; }
font-normal     { font-weight: 400; }
font-medium     { font-weight: 500; }
font-bold       { font-weight: 700; }
```

#### Borders
```css
rounded       { border-radius: 0.25rem; }
rounded-lg    { border-radius: 0.5rem; }
rounded-xl    { border-radius: 0.75rem; }
rounded-full  { border-radius: 9999px; }
rounded-t-lg  { border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
```

#### Effects
```css
/* Shadow */
shadow        { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
shadow-sm     { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
shadow-md     { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
shadow-lg     { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

/* Opacity */
opacity-50    { opacity: 0.5; }
opacity-75    { opacity: 0.75; }
opacity-100   { opacity: 1; }
```

### Flexbox in Tailwind
```css
flex            { display: flex; }
flex-col        { flex-direction: column; }
flex-row        { flex-direction: row; }
justify-center  { justify-content: center; }
justify-between { justify-content: space-between; }
items-center    { align-items: center; }
items-start     { align-items: flex-start; }
gap-4           { gap: 1rem; }
flex-wrap       { flex-wrap: wrap; }
flex-1          { flex: 1 1 0%; }
flex-auto       { flex: 1 1 auto; }
```

### Grid in Tailwind
```css
grid              { display: grid; }
grid-cols-1       { grid-template-columns: repeat(1, minmax(0, 1fr)); }
grid-cols-2       { grid-template-columns: repeat(2, minmax(0, 1fr)); }
grid-cols-3       { grid-template-columns: repeat(3, minmax(0, 1fr)); }
grid-cols-4       { grid-template-columns: repeat(4, minmax(0, 1fr)); }
gap-4             { gap: 1rem; }
gap-x-4           { column-gap: 1rem; }
gap-y-4           { row-gap: 1rem; }
```

### Responsive Design (Prefixes)
```css
/* Mobile first - no prefix */
block          { display: block; }

/* sm - min-width: 640px */
sm:block       { @media (min-width: 640px) { display: block; } }
sm:flex        { @media (min-width: 640px) { display: flex; } }

/* md - min-width: 768px */
md:flex-col    { @media (min-width: 768px) { flex-direction: column; } }
md:grid-cols-3 { @media (min-width: 768px) { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

/* lg - min-width: 1024px */
lg:grid-cols-4 { @media (min-width: 1024px) { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* xl - min-width: 1280px */

/* 2xl - min-width: 1536px */
```

### Your App's Responsive Pattern:
```tsx
/* AnimeMainList.tsx */
<div className="
  grid                                 {/* Mobile: default 1 column */}
  grid-cols-1                          {/* Mobile: 1 column */}
  sm:grid-cols-2                       {/* sm (640px+): 2 columns */}
  md:grid-cols-3                       {/* md (768px+): 3 columns */}
  lg:grid-cols-4                       {/* lg (1024px+): 4 columns */}
  gap-6
">
```

### Hover & Focus States
```css
hover:bg-blue-500   { @media (hover: hover) { background-color: #3b82f6; } }
focus:ring-2        { outline: none; box-shadow: 0 0 0 2px white, 0 0 0 4px blue; }
active:bg-blue-700  { background-color: #1d4ed8; }
disabled:opacity-50 { opacity: 0.5; cursor: not-allowed; }
```

### Transitions
```css
transition          { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
transition-all      { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
duration-300        { transition-duration: 300ms; }
ease-in-out         { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
```

### Your App's Transition:
```tsx
<input
  className="
    px-3 py-2
    rounded-lg
    border border-gray-300
    bg-white
    text-gray-800
    focus:outline-none
    focus:ring-2 focus:ring-gray-600
    transition  /* Smooth transition on all properties */
  "
/>
```

### Dark Mode
```css
dark:bg-gray-900   { @media (prefers-color-scheme: dark) { background-color: #111827; } }
dark:text-white    { @media (prefers-color-scheme: dark) { color: white; } }
```

---

## CSS vs Tailwind Comparison

| Feature | CSS | Tailwind |
|---------|-----|----------|
| **Learning curve** | Easy | Steeper (many classes) |
| **File size** | Can grow large | Smaller (purges unused) |
| **Naming** | Need to name everything | Utility names provided |
| **Consistency** | Hard to maintain | Easy with design tokens |
| **Responsive** | Media queries | Prefix classes |
| **State (hover/focus)** | Pseudo-classes | Prefix classes |
| **Best for** | Large teams, design systems | Rapid prototyping |

---

## Common Layout Challenges

### 1. Sticky Header
```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### 2. Card with Image Aspect Ratio
```css
.card {
  position: relative;
  padding-top: 56.25%; /* 16:9 aspect ratio */
}
.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### 3. Equal Height Cards
```css
/* Grid solution */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.card {
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
}
```

### 4. Modal Overlay
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}
```

---

## Tailwind Configuration

### Your tailwind.config.js:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      spacing: {
        '128': '32rem',
      }
    },
  },
  plugins: [],
}
```

---

## Interview Questions & Answers

### Q: What's the difference between Flexbox and Grid?
> "Flexbox is one-dimensional - either row OR column. Great for simple layouts like navigation bars or card rows. Grid is two-dimensional - row AND column at the same time. Perfect for overall page layouts or card grids. I use Grid for the anime card grid in my app because I need precise 2D control, and Flexbox for component internals like aligning icons with text."

### Q: How does Tailwind differ from traditional CSS?
> "Tailwind uses utility classes instead of custom CSS classes. Instead of writing `.card { padding: 1rem; border-radius: 0.5rem; }`, you write `<div class='p-4 rounded-lg'>. This speeds up prototyping and ensures consistency. Tailwind also purges unused styles in production, keeping CSS small."

### Q: How do you handle responsive design?
> "I use Tailwind's responsive prefixes. Mobile first - start with base classes, then add sm:, md:, lg:, xl: for larger screens. For example, my anime grid uses grid-cols-1 by default, then sm:grid-cols-2, md:grid-cols-3, lg:grid-cols-4."

### Q: What is the box model?
> "Every element is a box with: content, padding, border, and margin. The total size is width + padding + border. In CSS box-sizing: content-box is default (width is content only), while border-box includes padding and border in the width."

### Q: How do you center an element?
> "Multiple ways: Flexbox with justify-center and align-items-center is my go-to. For a single child, grid with place-items: center also works well. For absolute positioning, I use top: 50%; left: 50%; transform: translate(-50%, -50%)."

---

## Your App's CSS Patterns

### Button with Tailwind (AnimeMainList.tsx):
```tsx
<Button
  variant="outlined"
  sx={{
    color: "black",
    borderColor: "black",
    "&:hover": {
      backgroundColor: "rgba(49, 49, 49, 0.08)",
      borderColor: "black",
    },
  }}
>
  Load more
</Button>
```

### Input Field (AnimeMainList.tsx):
```tsx
<input
  type="text"
  className="
    px-3 py-2
    rounded-lg
    border border-gray-300
    bg-white
    text-gray-800
    focus:outline-none
    focus:ring-2 focus:ring-gray-600 focus:border-gray-600
    transition
    w-full
  "
/>
```

### Card Grid (AnimeMainList.tsx):
```tsx
<div className="
  grid
  grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
  gap-6
">
  {/* Anime cards */}
</div>
```

---

