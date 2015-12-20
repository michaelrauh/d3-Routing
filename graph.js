// load the csv data into a matrix, with distance cast as an integer
$(document).ready(function () {
  d3.text("data.csv", function(text) {
    var data = d3.csv.parseRows(text).map(function(row) {
      return row.map(function(value, index) {
        if(index == 2) {
          return parseInt(value);
        } else {
          return value;
        }
      });
    });

    //convert data into a list of link objects
    var links = [];

    data.forEach(function(dataElement) {
      var dataLink = { source: dataElement[0], target: dataElement[1], distance: dataElement[2] };
      links.push(dataLink);
    });

    var nodes = {};

    // Compute the distinct nodes from the links.
    links.forEach(function(link) {
      link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
      link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });
    });

    // create graph to calculate shortest path
    var map = {};

    links.forEach(function(link) {
      var target   = link.target.name;
      var distance = link.distance;
      var source   = link.source.name;

      if (!map.hasOwnProperty(source))
        map[source] = {};

      map[source][target] = distance;
    });

    graph = new Graph(map);

    window.graph  = graph;

    // Set defaults
    window.old    = "Cincinnati"
    window.recent = 'Akron';

    stops = graph.findShortestPath(window.old, window.recent);

    // set standard styling for regular non-path links
    links.forEach(function(link){
      link.klass = "link"
    })

    var totalPathDistance = 0;

    // if a link is on the path, highlight it. Also keep track of distance
    for (var i = 0; i < stops.length - 1; i++){
      source = stops[i]
      target = stops[i + 1]

      links.forEach(function(link){
        if (source == link.source.name && target == link.target.name){
          link.klass = "link-highlighted"
          totalPathDistance += link.distance;
        }
      })
    }

    $('#distance-count').text(totalPathDistance + " miles.");

    //set up d3 force object with linkdistance proportional to path length
    var width  = window.innerWidth * .8
    var height = window.innerHeight * .8

    var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .charge(-300)
    .on("tick", tick)

    force.linkDistance(function(link) {
      return link.distance * 20
    });

    force.start();

    //make container for svg properties
    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

    // Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
    .data(["end"])
    .enter().append("marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");

    //draw links and make them easy for the click handler to find
    var path = svg.append("g").selectAll("path")
    .data(force.links())
    .enter().append("path")
    .attr("id", function(d) { return d.source.name + '-' + d.target.name; })
    .attr("class", function(d) { return d.klass + ' js-path'; })
    .attr('distance', function(d) { return d.distance; })
    .attr("marker-end", "url(#end)");

    // draw city nodes and color them if they are visited
    var circle = svg.append("g").selectAll("circle")
    .data(force.nodes())
    .enter().append("circle")
    .attr("r", 6)
    .attr("id", function(d) { return d.name ; })
    .attr("class", function(d) {
      if (d.name == window.recent){
         return "circle-recent" }
         else if (d.name == window.old) {
           return "circle-old";
         }
    })
    .on('click', function(d) { redrawPath(d) });

    //label cities
    var text = svg.append("g").selectAll("text")
    .data(force.nodes())
    .enter().append("text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; });

    // encode movement and elliptic path logic
    function tick() {
      path.attr("d", linkArc);
      circle.attr("transform", transform);
      text.attr("transform", transform);
    }

    function linkArc(d) {
      var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    function transform(d) {
      return "translate(" + d.x + "," + d.y + ")";
    }
  });
});
