function redrawPath(d) {

  // unhighlight all stops to prepare to highlight the new stops
  $('.js-path').each(function(index) {
    $(this).attr("class", "js-path link");
  });

  // old city will no longer be highlighted, just clicked city is highlighted
  $('#' + window.old).attr('class', '');
  $('#' + window.recent).attr('class', 'circle-old');
  $('#' + d.name).attr('class', 'circle-recent');

  // the previously clicked city is old now. Just clicked is recent
  window.old    = window.recent;
  window.recent = d.name;

  // calculate stops for the new cities
  stops = window.graph.findShortestPath(window.old, window.recent);
  var newDistance = 0;

  if (stops) {
    for (var i = 0; i < stops.length - 1; i++) {
      pathId = "#" + stops[i] + '-' + stops[i + 1];
      $(pathId).attr('class', 'js-path link-highlighted');
      newDistance += parseInt($(pathId).attr('distance'));
    }
  }
  else{
    newDistance = Infinity
  }

  // Send a message to the user if there is no path
  if (newDistance == 0){
    newDistance = "Zero miles. You are already here!";
  } else if (!isFinite(newDistance)){
    newDistance = "Infinite miles. Please donate so that we can build this route.";
  }else {
    newDistance = newDistance + " miles."
  }


  $('#distance-count').text(newDistance);
}
