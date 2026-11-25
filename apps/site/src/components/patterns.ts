// Artistic impressionist gradient backdrops, analog textures, and soothing signal matrix patterns (Image 2 reference)
export const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

export const STIPPLE_NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='stippleFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23stippleFilter)' opacity='0.10'/%3E%3C/svg%3E")`;

// Soothing, calm, dark ambient glows (10-14% opacity max, zero eye strain)
export const ATMOSPHERIC_GRADIENTS = {
  // Hero: Soft soothing ambient glow (Warm Copper & Indigo, gentle on eyes)
  heroCosmosParticulate: `
    radial-gradient(circle 500px at 78% 75%, rgba(234, 88, 12, 0.12) 0%, rgba(194, 65, 12, 0.05) 45%, transparent 75%),
    radial-gradient(circle 550px at 22% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 80%),
    linear-gradient(180deg, #0d0e14 0%, #08090c 100%)
  `,

  // Panel 1 (Image 2 Style): Soothing Dark Copper / Amber Ambient Glow
  panelTerracotta: `
    radial-gradient(ellipse 90% 80% at 85% 25%, rgba(234, 88, 12, 0.14) 0%, rgba(194, 65, 12, 0.04) 50%, transparent 75%),
    linear-gradient(180deg, #0e0f14 0%, #08090c 100%)
  `,

  // Panel 2 (Image 2 Style): Soothing Deep Cobalt / Slate Ambient Glow
  panelSlate: `
    radial-gradient(ellipse 90% 80% at 50% 80%, rgba(59, 130, 246, 0.14) 0%, rgba(37, 99, 235, 0.04) 50%, transparent 75%),
    linear-gradient(180deg, #0e0f14 0%, #08090c 100%)
  `,

  // Panel 3 (Image 2 Style): Soothing Deep Emerald / Forest Ambient Glow
  panelForest: `
    radial-gradient(ellipse 90% 80% at 50% 75%, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.03) 50%, transparent 75%),
    linear-gradient(180deg, #0e0f14 0%, #08090c 100%)
  `,

  // Feature Split (Image 2 Style): Soothing Ambient Glow
  featureSplit: `
    radial-gradient(ellipse 90% 80% at 85% 35%, rgba(234, 88, 12, 0.13) 0%, transparent 70%),
    radial-gradient(ellipse 85% 75% at 20% 80%, rgba(59, 130, 246, 0.09) 0%, transparent 70%),
    linear-gradient(180deg, #0e0f14 0%, #08090c 100%)
  `,
};

// Signal Dot Matrix Patterns (Image 2 Reference: crisp illuminated points fading into dark void)
export const SIGNAL_DOT_PATTERNS = {
  // Panel 1: Amber / Copper Signal Dots (fading gracefully from top-right)
  terracotta: {
    'background-image': 'radial-gradient(circle, rgba(251, 146, 60, 0.50) 1.2px, transparent 1.6px)',
    'background-size': '15px 15px',
    'mask-image': 'radial-gradient(ellipse 95% 85% at 85% 25%, #000 15%, transparent 75%)',
    '-webkit-mask-image': 'radial-gradient(ellipse 95% 85% at 85% 25%, #000 15%, transparent 75%)',
  },

  // Panel 2: Sapphire / Blue Signal Dots (fading gracefully from bottom-center)
  slate: {
    'background-image': 'radial-gradient(circle, rgba(96, 165, 250, 0.50) 1.2px, transparent 1.6px)',
    'background-size': '15px 15px',
    'mask-image': 'radial-gradient(ellipse 95% 85% at 50% 80%, #000 15%, transparent 75%)',
    '-webkit-mask-image': 'radial-gradient(ellipse 95% 85% at 50% 80%, #000 15%, transparent 75%)',
  },

  // Panel 3: Emerald / Mint Signal Dots (fading gracefully from bottom-center)
  forest: {
    'background-image': 'radial-gradient(circle, rgba(52, 211, 153, 0.45) 1.2px, transparent 1.6px)',
    'background-size': '15px 15px',
    'mask-image': 'radial-gradient(ellipse 95% 85% at 50% 75%, #000 15%, transparent 75%)',
    '-webkit-mask-image': 'radial-gradient(ellipse 95% 85% at 50% 75%, #000 15%, transparent 75%)',
  },

  // Feature Split: Warm Copper / Amber Signal Dots
  featureSplit: {
    'background-image': 'radial-gradient(circle, rgba(251, 146, 60, 0.45) 1.2px, transparent 1.6px)',
    'background-size': '15px 15px',
    'mask-image': 'radial-gradient(ellipse 95% 85% at 85% 35%, #000 15%, transparent 80%)',
    '-webkit-mask-image': 'radial-gradient(ellipse 95% 85% at 85% 35%, #000 15%, transparent 80%)',
  },
};
