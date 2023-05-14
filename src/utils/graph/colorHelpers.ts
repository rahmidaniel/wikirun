import chroma from "chroma-js";

/***
 * Determines where to pick the color on a scale,
 * 0 is the left-side, 1 is the right-side color.
 * `getColorLinear` function uses it.
 */
const scaleBias = 0.8;
export function calculateEdgeColor(parentColor: string, groupColor: string){
    // Create a color transition and pick one closer to the `groupColor`
    const colorBetween = groupColor//getColorLinear(parentColor, groupColor);
    // Add a level of transparency
    return chroma(colorBetween).luminance(0.5, 'lch').css();
}

export function getColorLinear(parentColor: string, groupColor: string) {
    const linearTransition = chroma.scale([parentColor, groupColor]).mode('lab');
    return linearTransition(scaleBias).css();
}