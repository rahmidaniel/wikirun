import chroma from "chroma-js";

export const baseSize = 50;
export const baseColor = chroma('orange').css();

/**
 * Calculates 'downscaled' node size with a logarithmic function
 * @param size - parent node size
 */
export const calculateChildNodeSize = (size: number) => {
    return Math.log2(size);
}