import { union } from "lodash";

export const getLightBackground = n => {
  const col = [
    "#666666",
    "#00cccc",
    "#009999",
    "#cc3399",
    "#990066",
    "#3399cc",
    "#0066cc",
    "#99cc33",
    "#339966",
    "#ffcc33",
    "#ff6600",
    "#33ffcc",
    "#ff6699",
    "#33ccff",
    "#33cc66",
    "#ff9900",
    "#996699",
    "#660066",
    "#336699",
    "#003399"
  ];
  return col[n % col.length];
};

export const getMinMax = array => {
  const unique = union(...Object.values(array).map(s => s.values));
  return {
    min: Math.min(...unique),
    max: Math.max(...unique)
  };
};
