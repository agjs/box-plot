Ext.define("LSP.view.graphics.BoxPlot", {
  extend: "LSP.view.graphics.D3Component",
  alias: "widget.boxplot",
  showBox: true,
  showMedian: true,
  showOutliers: true,
  showWhiskers: true,

  draw: function(me, svg, svgWidth, svgHeight) {
    //console.log('boxplot draw', me);
    if (!me) {
      me = this;
    }
    if (!svgWidth && me.el) {
      svgWidth = me.getWidth();
    }
    if (!svgHeight && me.el) {
      svgHeight = me.getHeight();
    }
    if (!svg && me.el) {
      var componentId = me.getEl().dom.id;
      // Adds the svg canvas
      var oldSvg = d3.select("#" + componentId).select("svg");
      oldSvg.remove();
      svg = d3
        .select("#" + componentId)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    }

    if (!svg) return;

    var labels = false; // show the text labels beside individual boxplots?

    var xLabelsInclination =
      me.plotData.xAxis["labelsInclination"] === undefined
        ? -45
        : me.plotData.xAxis["labelsInclination"];

    var margin = {
      top: 10,
      right: 10,
      bottom: xLabelsInclination ? 40 : 10,
      left: 20
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var seriesNames = Object.keys(me.plotData.series);
    //var min = Infinity;
    var min =
      typeof me.plotData.yAxis.min === "number"
        ? me.plotData.yAxis.min
        : Infinity;
    var max = -Infinity;


    var whiskers = me.showWhiskers === true ? iqr(1.5) : me.showWhiskers;
    var chart = d3
      .box()
      .whiskers(whiskers)
      .height(height - margin.top - 10)
      .boxWidth(me.boxWidth)
      .domain([min, max])
      .showLabels(labels)
      .showOutliers(me.showOutliers)
      .showBox(me.showBox)
      .scatterDots(me.scatterDots)
      .showMedian(me.showMedian)
      .showMean(me.showMean);

    // the x-axis
    var xScale = d3.scale
      .ordinal()
      .domain(seriesNames)
      .rangeRoundBands([0, width], 0.3, 0.3);
    var xAxis = d3.svg
      .axis()
      .scale(xScale)
      .orient("bottom");

    // the y-axis
    var y = d3.scale
      .linear()
      .domain([min, max])
      .range([height - margin.top - margin.bottom, 0]);

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient("left")
      .ticks(8);

    // draw gridlines
    var gridlines = me.plotData.gridlines;
    if (!!gridlines) {
      svg
        .selectAll("path.yruler")
        .data(y.ticks())
        .enter()
        .append("path")
        .attr("class", "yruler")
        .attr(
          "transform",
          d =>
            "translate(" + (margin.left + 30) + "," + (y(d) + margin.top) + ")"
        )
        .attr(
          "d",
          `M 0 0
                    L ${width - margin.right} 0`
        )
        .attr("fill", "none");
    }
    // draw threshold
    var threshold = parseInt(me.plotData.threshold);
    if (!!threshold) {
      svg
        .append("path")
        .attr("class", "x threshold")
        //.attr("transform", "translate(" + (margin.left + 30) + "," + (height - margin.bottom ) + ")")
        .attr(
          "transform",
          "translate(" +
            (margin.left + 30) +
            "," +
            (y(threshold) + margin.top) +
            ")"
        )
        .attr(
          "d",
          `M 0 0
                    L ${width - margin.right} 0`
        )
        .attr("stroke", "red")
        .attr("fill", "none");
    }

    // draw the boxplots
    svg
      .selectAll(".boxplot")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", function(d) {
        return (
          "translate(" +
          (xScale(d[0]) + margin.left + 30) +
          "," +
          margin.top +
          ")"
        );
      })
      .call(chart.width(xScale.rangeBand()))
      .on("click", function(d) {
        console.log("boxplotclick");
        me.fireEvent("boxplotclick", me, d);
      })
      .on("mouseover", function(d) {
        console.log("boxplotmouseover");
        me.fireEvent("boxplotmouseover", me, d);
      })
      .on("mouseout", function(d) {
        console.log("boxplotmouseout");
        me.fireEvent("boxplotmouseout", me, d);
      })

      .append("svg:title")
      .text(function(d) {
        return d[4];
      });

    // draw y axis
    svg
      .append("g")
      .attr("class", "y axis")
      //.attr("class", "yruler")
      .attr(
        "transform",
        "translate(" + (margin.left + 30) + "," + margin.top + ")"
      )
      .call(yAxis)
      .append("text") // and text1
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(me.plotData.yAxis.label);

    // draw x axis
    svg
      .append("g")
      .attr("class", "x axis")
      //.attr("class", "xruler")
      .attr(
        "transform",
        "translate(" + (margin.left + 30) + "," + (height - margin.bottom) + ")"
      )
      .call(xAxis);

    // Rotate x axis labels. Should be controlled by some user input i think.
    svg
      .selectAll(".x text") // select all the text elements for the xaxis
      .attr("transform", function(d) {
        console.log("a", this.getBBox().height, margin.bottom);
        //return "translate(" + this.getBBox().height * -3 + "," + (this.getBBox().height + 30) + ")rotate(-45)";
        if (xLabelsInclination === 0)
          return (
            "translate(" +
            (this.getBBox().height * -3 + 50) +
            "," +
            (this.getBBox().height - margin.bottom / 2) +
            `)rotate(${xLabelsInclination})`
          );

        return (
          "translate(" +
          this.getBBox().height * -3 +
          "," +
          (this.getBBox().height + 30) +
          `)rotate(${xLabelsInclination})`
        );
      });

    if (me.plotData.xAxis.label) {
      svg
        .select("g.x.axis")
        .append("text") // text label for the x axis
        .attr("class", "label")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text(me.plotData.xAxis.label);
    }

    var insertLinebreaks = function(d) {
      var el = d3.select(this);
      if (!me.plotData.series[d]["details"]) return;
      var words = me.plotData.series[d].details.split("\n");
      el.text("");

      for (var i = 0; i < words.length; i++) {
        var tspan = el.append("tspan").text(words[i]);
        if (i > 0) tspan.attr("x", 0).attr("dy", "15");
      }
    };
    svg.selectAll("g.x.axis g text").each(insertLinebreaks);

    // Returns a function to compute the interquartile range.
    function iqr(k) {
      return function(d, i) {
        var q1 = d.quartiles[0],
          q3 = d.quartiles[2],
          iqr = (q3 - q1) * k,
          i = -1,
          j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
      };
    }

    if (me.mm_readyCallbackQueue) {
      me.mm_readyCallbackQueue.forEach(function(callback) {
        setTimeout(callback, 0);
      });
      me.mm_readyCallbackQueue = null; // Disable queue
    }
    me.mm_drawn = true;
    me.fireEvent("drawn", me);
  }
});
