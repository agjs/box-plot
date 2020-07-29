import * as d3 from "d3";
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

const _themes = {
  light: `
          /* <![CDATA[ */
          .axis path, .axis line { fill: none; stroke: white; stroke-width: 1; shape-rendering: crispEdges; }
          .axislabel { font: 12px Arial; fill: white; } 
          .axis text { fill: white; }
          .yruler, .xruler path, .yruler, .xruler line { fill: none; stroke: #3B4556; stroke-width: 1; shape-rendering: crispEdges; }
          .titleLabel { fill: white }
          /* ]]\> */,
          `,
  dark: `
          /* <![CDATA[ */
          .axis path, .axis line { fill: none; stroke: black; stroke-width: 1; shape-rendering: crispEdges; }
          .axislabel { font: 12px Arial; fill: black; } .axis text { fill: black; }
          .yruler, .xruler path, .yruler, .xruler line { fill: none; stroke: #E9E4D9; stroke-width: 1; shape-rendering: crispEdges; }
          .titleLabel { fill: black }
          /* ]]\> */
        `
};

export const getThemeStyles = (themeName = "dark") => {
  return _themes[themeName];
};

export const getXLabelsInclination = xAxis => {
  const { labelsInclination } = xAxis;
  return labelsInclination === undefined ? -45 : labelsInclination;
};

/**
 * @url https://en.wikipedia.org/wiki/Quantile_function
 * @description In probability and statistics, the quantile function, associated with a probability distribution of a random variable, specifies the value of the random variable such that the probability of the variable being less than or equal to that value equals the given probability. It is also called the percent-point function or inverse cumulative distribution function.
 */
export const boxQuartiles = d => {
  return [d3.quantile(d, 0.75), d3.quantile(d, 0.5), d3.quantile(d, 0.25)];
};

export const sortNumbersBySize = (a, b) => a - b;

export const getInterquartileRange = k => {
  return (d, i) => {
    const q1 = d.quartiles[0],
      q3 = d.quartiles[2],
      iqr = (q3 - q1) * k,
      i = -1,
      j = d.length;
    while (d[++i] < q1 - iqr);
    while (d[--j] > q3 + iqr);
    return [i, j];
  };
};

export const createPlotData = (series, seriesNames, yAxis={}) => {
  return seriesNames.map((name, index) => {
    const { values, color } = series[name];

    return {
      ...series[name],
      key: name,
      color: color || getLightBackground(index),
      quartile: boxQuartiles(values.sort(sortNumbersBySize)),
      whiskers: [
        yAxis.min || Math.min(...values),
        yAxis.max || Math.max(...values)
      ]
    };
  });
};
