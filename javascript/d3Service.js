const archContainer = document.getElementById('arch_viz');
const containerWidth = archContainer.clientWidth;

// Set dimensions and margin
var margin = { top: 10, right: 30, bottom: 30, left: 40 },
  width = containerWidth - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  lossHeight = 300 - margin.top - margin.bottom,
  rectWidth = 120,
  rectHeight = 42;

var x;
var y;
var lossX;
var lossY;

function createArchitectureGraph() {
  d3.selectAll('#arch-svg').remove();

  var violationScale = d3
    .scaleOrdinal()
    .domain([true, false])
    .range(['orange', '#74abed']);

  // Append svg object
  var archSvg = d3
    .select('#arch_viz')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('id', 'arch-svg')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Initialize dependencies
  var dependency = archSvg
    .selectAll('line')
    .data(dependencies)
    .enter()
    .append('line')
    .style('stroke', '#aaa');

  // Initialize services
  var service = archSvg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(services)
    .enter()
    .append('g')
    .on('click', selectService);

  service
    .append('rect')
    .attr('id', 'service-rect')
    .attr('width', rectWidth)
    .attr('height', rectHeight)
    .attr('fill', function (d) {
      return violationScale(d.violation_detected);
    })
    .attr('x', -(rectWidth / 2))
    .attr('y', -(rectHeight / 2));

  service
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text(function (d) {
      return d.name;
    });

  var simulation = d3
    .forceSimulation(services)
    .force(
      'link',
      d3
        .forceLink()
        .id(function (d) {
          return d.id;
        })
        .links(dependencies)
        .distance(10)
    )
    .force('charge', d3.forceManyBody().strength(-300).distanceMax(150))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(rectWidth))
    .on('end', ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    dependency
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      });

    service.attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  }

  function selectService(service) {
    highlightService(service.name);
  }
}

function createDataGraph(serviceData) {
  // Remove old graphs
  d3.selectAll('#data-svg').remove();

  // Fix data
  serviceData.forEach(function (d) {
    d.time = parseInt(d.time);
    d.qos = parseFloat(d.qos);
    d.failureLoss = parseFloat(d.failureLoss);
    d.deploymentLoss = parseFloat(d.deploymentLoss);
    d.loadBalancingLoss = parseFloat(d.loadBalancingLoss);
  });

  // Append svg object
  var dataSvg = d3
    .select('#data_viz')
    .append('svg')
    .attr('id', 'data-svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('id', 'data-svg-g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Add x axis
  x = d3
    .scaleLinear()
    .domain(
      d3.extent(serviceData, function (d) {
        return d.time;
      })
    )
    .range([0, width])
    // .nice();
  var xGrid = dataSvg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(''));
  var xAxis = dataSvg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  // Add y axis
  y = d3.scaleLinear().domain([0, 110]).range([height, 0]).nice();
  dataSvg
    .append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));
  dataSvg.append('g').call(d3.axisLeft(y));

  // Get closest x index of mouse
  var bisect = d3.bisector(function (d) {
    return d.time;
  }).left;

  // Add clip path
  var clip = dataSvg
    .append('defs')
    .append('svg:clipPath')
    .attr('id', 'clip')
    .append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('x', 0)
    .attr('y', 0);

  // Create brush
  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on('end', updateChart);

  var lineChart = dataSvg
    .append('g')
    .attr('clip-path', 'url(#clip)')
    .attr('id', 'line-chart');

  // Add line
  lineChart
    .append('path')
    .attr('id', 'data-line')
    .datum(serviceData)
    .attr('fill', 'rgba(116,171,237,0.2)')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.0)
    .attr(
      'd',
      d3
        .area()
        .x(function (d) {
          return x(d.time);
        })
        .y0(y(0))
        .y1(function (d) {
          return y(d.qos);
        })
    );

  // Create circle that travels along chart
  var focus = dataSvg
    .append('g')
    .append('circle')
    .style('fill', 'rgba(116,171,237,0.1)')
    .style('stroke', 'steelblue')
    .attr('r', 3.5)
    .style('opacity', 0);

  // Create text that travels along chart curve
  var focusText = dataSvg
    .append('g')
    .append('text')
    .style('opacity', 0)
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'middle');

  // Add brush
  lineChart.append('g').attr('class', 'brush').call(brush);

  lineChart
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  function mouseover() {
    focus.style('opacity', 1);
    focusText.style('opacity', 1);
  }

  function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(serviceData, x0, 1);
    selectedData = serviceData[i];
    focus.attr('cx', x(selectedData.time)).attr('cy', y(selectedData.qos));
    focusText
      .html(selectedData.qos + ' | ' + selectedData.time)
      .attr('x', x(selectedData.time) + 15)
      .attr('y', y(selectedData.qos));
  }

  function mouseout() {
    focus.style('opacity', 0);
    focusText.style('opacity', 0);
  }

  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChart() {
    extent = d3.event.selection;

    // Update domain
    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      x.domain(
        d3.extent(serviceData, function (d) {
          return d.time;
        })
      );
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      lineChart.select('.brush').call(brush.move, null);
    }

    // Update axis and line
    xGrid
      .transition()
      .duration(1000)
      .call(d3.axisBottom(x).tickSize(-height).tickFormat(''));
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Update data line
    lineChart
      .select('#data-line')
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .area()
          .x(function (d) {
            return x(d.time);
          })
          .y0(y(0))
          .y1(function (d) {
            return y(d.qos);
          })
      );

    // Update specification line
    lineChart
      .select('#specification-line')
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .line()
          .x(function (d) {
            return x(d.time);
          })
          .y(function (d) {
            return y(d.qos);
          })
      );
  }

  if (specificationIsHidden === false) {
    var cause = document.getElementById('causes').value;
    fetchSpecification(selectedService.id, cause).then((res) => {
      handleSpecification(res);
    });
  }
}

function drawSpecification(specification) {
  const max_initial_loss = specification.max_initial_loss;
  const max_recovery_time = specification.max_recovery_time;
  const max_loss = specification.max_lor;

  data = [
    {
      qos: 100,
      time: 0.0,
    },
  ];

  // Create dataset
  var specificationEndpoint = -1.0;
  var transientBehaviorEndpoint = -1.0;
  for (var i = 0; i < serviceData.length; i++) {
    var elem = serviceData[i];

    if (
      elem.time > specificationEndpoint &&
      elem.time > transientBehaviorEndpoint
    ) {
      if (elem.qos < expected_qos) {
        if (isInitialLoss(i)) {
          var initialLossIndex = getInitialLossIndex(i);
          var initialLoss = serviceData[initialLossIndex];
          specificationEndpoint = initialLoss.time + parseFloat(max_recovery_time);

          transientBehaviorEndpoint = getTransientBehaviorEndpoint(
            serviceData,
            initialLossIndex,
            specificationEndpoint
          );

          data.push({ qos: 100, time: initialLoss.time });
          data.push({
            qos: parseFloat(100 - max_initial_loss),
            time: initialLoss.time,
          });

          if (specificationEndpoint > transientBehaviorEndpoint) {
            transientBehaviorEndpoint = specificationEndpoint;
          }

          data.push({ qos: 100, time: specificationEndpoint });
        }
      }
    }
  }

  data.push({ qos: 100, time: serviceData[serviceData.length - 1].time });

  d3.select('#line-chart')
    .append('path')
    .attr('id', 'specification-line')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'red')
    .attr('stroke-width', 2.0)
    .attr(
      'd',
      d3
        .line()
        .x(function (d) {
          return x(d.time);
        })
        .y(function (d) {
          return y(d.qos);
        })
    );

  d3.select('#line-chart-loss')
    .append('line')
    .attr('id', 'specification-line-loss')
    .attr('stroke', 'red')
    .attr('stroke-width', 2.0)
    .attr('x1', 0.0)
    .attr('y1', function (d) {
      return lossY(max_loss);
    })
    .attr('x2', width)
    .attr('y2', function (d) {
      return lossY(max_loss);
    });

  function isInitialLoss(index) {
    if (index + 1 >= serviceData.length) {
      return false;
    }

    var med = getMedianOfNextValues(serviceData, index);
    if (med < qos_threshold) {
      console.log(
        'Found initial loss at ' +
          serviceData[index].time +
          ' with a median qos of ' +
          med +
          ' (spec: ' +
          specification.max_initial_loss +
          ')'
      );
      return true;
    }
    return false;
  }

  function getInitialLossIndex(index) {
    if (index > 0) {
      return index - 1;
    }
    return index;
  }

  function getTransientBehaviorEndpoint(data, startIndex, specificationEndpoint) {
    for (var i = startIndex + 1; i < data.length; i++) {
      var measurement = data[i];
      if (measurement.time < specificationEndpoint) {
        continue;
      }

      if (measurement.qos >= expected_qos) {
        var med = getMedianOfNextValues(data, i);
        if (med >= qos_threshold) {
          return data[i].time;
        }
      }
    }
    return data[data.length - 1].time;
  }

  function getMedianOfNextValues(data, startIndex) {
    if (startIndex + 1 >= data.length) {
      return data[startIndex].qos
    }

    const current = data[startIndex];
    const next = data[startIndex + 1];

    var qos = [];
    if (parseInt(next.time) > parseInt(current.time) + 5) {
      qos = interpolate(current, next);
    } else {
      nextValues = getNextValues(data, startIndex);
      qos = nextValues.map((service) => service.qos);
    }

    return median(qos);
  }

  function getNextValues(data, startIndex) {
    const lastIndex =
      data.length >= startIndex + 5 ? startIndex + 5 : data.length - 1;
    return data.slice(startIndex, lastIndex);
  }

  function median(values) {
    if (values.length === 0) return 0;

    values.sort((a, b) => {
      return a - b;
    });

    var center = Math.floor(values.length / 2);

    if (values.length % 2) {
      return values[center];
    }
    return values[center - 1] + values[center] / 2.0;
  }

  function interpolate(first, last) {
    var points = [];
    for (var i = 0; i < 5; i++) {
      points.push(parseInt(first.time) + i);
    }

    var x = [parseInt(first.time), parseInt(last.time)];
    var y = [first.qos, last.qos];

    return everpolate.linear(points, x, y);
  }
}

function removeDataViz() {
  d3.selectAll('#data-svg').remove();
  serviceData = null;
}

function removeLossViz() {
  d3.selectAll('#loss-svg').remove();
}

function removeSpecificationPath() {
  d3.selectAll('#specification-line').remove();
  d3.selectAll('#specification-line-loss').remove();
  specification = null;
}

function drawTransientLossGraph() {
  // Remove old graphs
  d3.selectAll('#loss-svg').remove();

  // Append svg object
  var lossSvg = d3
    .select('#loss_viz')
    .append('svg')
    .attr('id', 'loss-svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', lossHeight + margin.top + margin.bottom)
    .append('g')
    .attr('id', 'loss-svg-g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Add x axis
  lossX = d3
    .scaleLinear()
    .domain(
      d3.extent(serviceData, function (d) {
        return d.time;
      })
    )
    .range([0, width])
    // .nice();
  var xGrid = lossSvg
    .append('g')
    .attr('class', 'grid')
    .attr('transform', 'translate(0,' + lossHeight + ')')
    .call(d3.axisBottom(lossX).tickSize(-lossHeight).tickFormat(''));
  var xAxis = lossSvg
    .append('g')
    .attr('transform', 'translate(0,' + lossHeight + ')')
    .call(d3.axisBottom(lossX));
  lossY = d3
    .scaleLinear()
    .domain([
      0,
      d3.max([specification.max_lor + 50, d3.max(serviceData, getLossData)]),
    ])
    .range([lossHeight, 0])
    .nice();
  lossSvg
    .append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(lossY).tickSize(-width).tickFormat(''));
  lossSvg.append('g').attr('id', 'loss-axis-left').call(d3.axisLeft(lossY));

  // Get closest x index of mouse
  var bisect = d3.bisector(function (d) {
    return d.time;
  }).left;

  // Add clip path
  var clip = lossSvg
    .append('defs')
    .append('svg:clipPath')
    .attr('id', 'clip_loss')
    .append('svg:rect')
    .attr('width', width)
    .attr('height', lossHeight)
    .attr('x', 0)
    .attr('y', 0);

  // Create brush
  var brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, lossHeight],
    ])
    .on('end', updateChart);

  var lineChart = lossSvg
    .append('g')
    .attr('clip-path', 'url(#clip_loss')
    .attr('id', 'line-chart-loss');

  lineChart
    .append('path')
    .attr('id', 'data-line-loss')
    .datum(serviceData)
    .attr('fill', 'rgba(116,171,237,0.2)')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 1.0)
    .attr(
      'd',
      d3
        .area()
        .x(function (d) {
          return lossX(d.time);
        })
        .y0(lossY(0))
        .y1(function (d) {
          return lossY(getLossData(d));
        })
    );

  // Create circle that travels along chart
  var focus = lossSvg
    .append('g')
    .append('circle')
    .style('fill', 'rgba(116,171,237,0.1)')
    .style('stroke', 'steelblue')
    .attr('r', 3.5)
    .style('opacity', 0);

  // Create text that travels along chart curve
  var focusText = lossSvg
    .append('g')
    .append('text')
    .style('opacity', 0)
    .attr('text-anchor', 'left')
    .attr('alignment-baseline', 'middle');

  // Add brush
  lineChart.append('g').attr('class', 'brush').call(brush);

  lineChart
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  function mouseover() {
    focus.style('opacity', 1);
    focusText.style('opacity', 1);
  }

  function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(serviceData, x0, 1);
    selectedData = serviceData[i];
    focus.attr('cx', lossX(selectedData.time)).attr('cy', lossY(getLossData(selectedData)));
    focusText
      .html(getLossData(selectedData) + ' | ' + selectedData.time)
      .attr('x', lossX(selectedData.time) + 15)
      .attr('y', lossY(getLossData(selectedData)));
  }

  function mouseout() {
    focus.style('opacity', 0);
    focusText.style('opacity', 0);
  }

  var idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChart() {
    extent = d3.event.selection;

    // Update domain
    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350));
      lossX.domain(
        d3.extent(serviceData, function (d) {
          return d.time;
        })
      );
    } else {
      lossX.domain([lossX.invert(extent[0]), x.invert(extent[1])]);
      lineChart.select('.brush').call(brush.move, null);
    }

    // Update axis and line
    xGrid
      .transition()
      .duration(1000)
      .call(d3.axisBottom(lossX).tickSize(-lossHeight).tickFormat(''));
    xAxis.transition().duration(1000).call(d3.axisBottom(lossX));

    // Update data line
    lineChart
      .select('#data-line-loss')
      .transition()
      .duration(1000)
      .attr(
        'd',
        d3
          .area()
          .x(function (d) {
            return lossX(d.time);
          })
          .y0(lossY(0))
          .y1(function (d) {
            return lossY(getLossData(d));
          })
      );
  }
}

function getLossData(d) {
  const causesSelect = document.getElementById('causes');
  const cause = causesSelect.value;

  switch (cause) {
    case 'failure':
      return d.failureLoss;
    case 'deployment':
      return d.deploymentLoss;
    case 'load-balancing':
      return d.loadBalancingLoss;
    default:
      return d.failureLoss;
  }
}
