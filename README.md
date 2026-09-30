# TruFit

TruFit is a portfolio prototype for an AI tool that turns photos of a broken or missing part into a print-ready replacement. Its one job is to tell the user, at every step, what was **measured** and what was **inferred**, and to never claim a printed part will fit.

This is a design demo. Photos, reconstruction and 3D placement are simulated with sample data. The flow and interface are real; the AI results are not.

**Live demo:** https://tru-fit-sigma.vercel.app

## The flow

1. **Capture**: add photos of the environment (a sample set is provided).
2. **Reconstruct**: review the detected measurements on a wireframe, each with a Measured or Inferred tag and a confidence. Tap any measurement to edit it.
3. **Mesh**: pick a part from the library (or a demo file), then tap the shaft where it should go.
4. **Fit**: review the calculated gear parameters. Values outside the acceptable range get a flag; only an overlap with other objects is an error.
5. **Export**: read the disclosure, then download the gear as STL, OBJ, PLY or GLB. The files are generated from your values.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Built with

Next.js, React, TypeScript, Tailwind CSS and three.js (for the exported meshes).
