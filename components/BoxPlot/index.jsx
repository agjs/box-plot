import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { getLightBackground, getMinMax } from "./utils";

import "./style.css";

export default ({
  data: { xAxis = {}, yAxis = {}, series = {} },
  dimensions: { svgWidth, svgHeight },
  themeName,
  showBox,
  showMedian,
  showOutliers,
  showWhiskers
}) => {
  const d3Container = useRef(null);

  const getXLabelsInclination = xAxis => {
    const { labelsInclination } = xAxis;
    return labelsInclination === undefined ? -45 : labelsInclination;
  };

  const margin = {
    top: 10,
    right: 10,
    bottom: getXLabelsInclination(xAxis) ? 40 : 10,
    left: 20
  };

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;
  const barWidth = 40;
  const boxPlotColor = "#898989";
  const medianLineColor = "#ffffff";
  const axisColor = "#898989";

  const { min, max } = getMinMax(series);
  const seriesNames = Object.keys(series);

  const getThemeStyles = (themeName = "dark") => {
    switch (themeName) {
      case "light":
        return `
             /* <![CDATA[ */
            .axis path, .axis line { fill: none; stroke: white; stroke-width: 1; shape-rendering: crispEdges; }
            .axislabel { font: 12px Arial; fill: white; } 
            .axis text { fill: white; }
            .yruler, .xruler path, .yruler, .xruler line { fill: none; stroke: #3B4556; stroke-width: 1; shape-rendering: crispEdges; }
            .titleLabel { fill: white }
            /* ]]\> */
            `;
      case "dark":
        return `
            /* <![CDATA[ */
            .axis path, .axis line { fill: none; stroke: black; stroke-width: 1; shape-rendering: crispEdges; }
            .axislabel { font: 12px Arial; fill: black; } .axis text { fill: black; }
            .yruler, .xruler path, .yruler, .xruler line { fill: none; stroke: #E9E4D9; stroke-width: 1; shape-rendering: crispEdges; }
            .titleLabel { fill: black }
            /* ]]\> */
        `;
    }
  };

  function boxQuartiles(d) {
    return [d3.quantile(d, 0.75), d3.quantile(d, 0.5), d3.quantile(d, 0.25)];
  }

  const getInterquartileRange = k => {
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

  const getData = () => {
    return seriesNames.map((name, index) => {
      const { values, color } = series[name];

      return {
        ...series[name],
        key: name,
        color: color || getLightBackground(index),
        quartile: boxQuartiles(values),
        whiskers: [
          yAxis.min || Math.min(...values),
          yAxis.max || Math.max(...values)
        ]
      };
    });
  };

  useEffect(() => {
    const plotData = getData();

    const svg = d3.select("svg");

    svg
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .append("style")
      .text(getThemeStyles(themeName));

    svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const yAxisBox = svg.append("g").attr("transform", "translate(40,0)");
    const xAxisBox = svg.append("g").attr("transform", "translate(40,0)");

    const xScale = d3
      .scaleBand()
      .domain(seriesNames)
      .rangeRound([0, width], 0.3, 0.3);

    const yScale = d3
      .scaleLinear()
      .domain([min, max])
      .range([height - margin.top - margin.bottom, 10])
      .nice();

    const g = svg.append("g").attr("transform", "translate(20,0)");

    const verticalLines = g
      .selectAll(".verticalLines")
      .data(plotData)
      .enter()
      .append("line")
      .attr("x1", d => {
        return xScale(d.key) + barWidth / 2;
      })
      .attr("y1", d => {
        return yScale(d.whiskers[0]);
      })
      .attr("x2", d => {
        return xScale(d.key) + barWidth / 2;
      })
      .attr("y2", d => {
        return yScale(d.whiskers[1]);
      })
      .attr("stroke", boxPlotColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5")
      .attr("fill", "none");

    const rects = g
      .selectAll("rect")
      .data(plotData)
      .enter()
      .append("rect")
      .attr("width", barWidth)
      .attr("height", d => {
        return yScale(d.quartile[2]) - yScale(d.quartile[0]);
      })
      .attr("x", d => {
        return xScale(d.key);
      })
      .attr("y", d => {
        return yScale(d.quartile[0]);
      })
      .attr("fill", d => {
        return d.color;
      })
      .attr("stroke", boxPlotColor)
      .attr("stroke-width", 1);

    const horizontalLineConfigs = [
      {
        // Top whisker
        x1: d => {
          return xScale(d.key);
        },
        y1: d => {
          return yScale(d.whiskers[0]);
        },
        x2: d => {
          return xScale(d.key) + barWidth;
        },
        y2: d => {
          return yScale(d.whiskers[0]);
        },
        color: boxPlotColor
      },
      {
        // Median
        x1: d => {
          return xScale(d.key);
        },
        y1: d => {
          return yScale(d.quartile[1]);
        },
        x2: d => {
          return xScale(d.key) + barWidth;
        },
        y2: d => {
          return yScale(d.quartile[1]);
        },
        color: medianLineColor
      },
      {
        // Bottom whisker
        x1: d => {
          return xScale(d.key);
        },
        y1: d => {
          return yScale(d.whiskers[1]);
        },
        x2: d => {
          return xScale(d.key) + barWidth;
        },
        y2: d => {
          return yScale(d.whiskers[1]);
        },
        color: boxPlotColor
      }
    ];

    if (showWhiskers) {
      for (const config of horizontalLineConfigs) {
        const { x1, x2, y1, y2, color } = config;
        g.selectAll(".whiskers")
          .data(plotData)
          .enter()
          .append("line")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("stroke", color)
          .attr("stroke-width", 1)
          .attr("fill", "none");
      }
    }

    svg
      .append("g")
      .attr("transform", "translate(40,0)")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
      );

    const yAxis = d3.axisLeft(yScale).ticks(8);
    yAxisBox
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(${margin.left + 30}, ${margin.top})`)
      .call(yAxis);

    const xAxis = d3.axisBottom(xScale);
    xAxisBox
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(${margin.left + 42.5}, ${height - 20})`)
      .call(xAxis);
  }, []);

  return <svg className="box" ref={d3Container} />;
};
