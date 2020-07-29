import { getXLabelsInclination } from "./utils";

export default ({ xAxis, svgHeight, svgWidth }) => {
  const margin = {
    top: 10,
    right: 10,
    bottom: getXLabelsInclination(xAxis) ? 40 : 10,
    left: 20
  };

  return {
    margin,
    width: svgWidth - margin.left - margin.right,
    height: svgHeight - margin.top - margin.bottom,
    barWidth: 40,
    boxPlotColor: "#898989",
    medianLineColor: "#ffffff",
    axisColor: "#898989"
  };
};
