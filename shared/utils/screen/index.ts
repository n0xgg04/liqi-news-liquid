import { Dimensions, PixelRatio } from "react-native";

export const { width, height } = Dimensions.get("window");
export const screenDimensions = Dimensions.get("screen");
export const maxWidth = 500;

// based on iphone 12's scale
const guidelineBaseWidth = 390;
// const guidelineBaseHeight = 844

const flexWidth = Math.min(width, maxWidth);

export const scaleSize = (size: number) =>
  (flexWidth / guidelineBaseWidth) * size;

export const scaleFontSize = (size: number) =>
  PixelRatio.getFontScale() >= 1 ? size : size * PixelRatio.getFontScale();
