import chroma from 'chroma-js';

export function calculateEdgeColor(parentColor: string, groupColor: string): string {
  const colorBetween = getColorLinear(parentColor, groupColor);
  return chroma(colorBetween).alpha(0.7).hex('rgba'); // .luminance(0.5, 'lch')
}

export function getColorLinear(parentColor: string, groupColor: string, scaleBias = 0.8): string {
  const colorScale = chroma.scale([parentColor, groupColor]).mode('lab');
  return colorScale(scaleBias).hex('rgba');
}
