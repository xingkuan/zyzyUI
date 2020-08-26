// ************** force diagram    *****************
var margin = {top: 10, right: 120, bottom: 10, left: 40},
    width = 500 - margin.right - margin.left,
    height = 740 - margin.top - margin.bottom;



d3.json("data/lsrel.json").then(function(links) {
	var theSvg = d3.select("#d3Relation");
	theSvg.append("svg")
	    .attr("width", width)
	    .attr("height", height)
  	    .call(d3.zoom().on("zoom", function () {
	      theSvg.attr("transform", d3.event.transform)
	     }))
		;
	 
	var nodesMap = [];
	var nodes=[]; 
	//console.log(links);
	// Compute the distinct nodes from the links.
	links.forEach(function(link) {
	   link.id = "rel" + link.relnum; 
	   // link.relnum = link.relnum;
	   var sLinkSrc = link.source;
	   var sLinkTgt = link.target;
	   link.source = nodesMap[link.source] || 
	        (nodesMap[link.source] = {name: link.source, relcnt: 0, srccnt: 0, tgtcnt: 0});
	   link.target = nodesMap[link.target] || 
	        (nodesMap[link.target] = {name: link.target, relcnt: 0, srccnt: 0, tgtcnt: 0});
	   link.relationship = link.relationship;
	    
	   if (nodesMap[sLinkSrc])
	   {
	         nodesMap[sLinkSrc]["relcnt"] = nodesMap[sLinkSrc]["relcnt"]+1;
	         nodesMap[sLinkSrc]["srccnt"] = nodesMap[sLinkSrc]["srccnt"]+1;
	   }
	 
	   if (nodes[sLinkTgt])
	   {
	         nodesMap[sLinkTgt]["relcnt"] = nodesMap[sLinkTgt]["relcnt"]+1;
	         nodesMap[sLinkTgt]["tgtcnt"] = nodesMap[sLinkTgt]["tgtcnt"]+1;
	   }
	 
	   // console.log(JSON.stringify(nodes));
	   // console.log("NODEPROP: " + nodes[sLinkSrc].name);
	//};
	});
	//create a needed list of nodes from nodesMap
	for (const [key, v] of Object.entries(nodesMap)) {
  	nodes.push(v);
	}
	 
	var force = d3.forceSimulation(nodes)
	  .force('charge', d3.forceManyBody().strength(-100))
	  .force('center', d3.forceCenter(width / 2, height / 2))
	  .force('link', d3.forceLink().links(links))
 	  // .force("link", d3.forceLink().id(function(d) { return d.id; }))
	;
	//  .on('tick', ticked);
	 

updateLinks() ;
updateNodes();



function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

	function updateLinks() {
		  var gLinks = theSvg.append("g")
				.attr("class", "links")
                .style("links", "#aaa")
                .selectAll("link")
                .data(links);

       gLinks.enter()
			.append("link");
/*	gLinks.enter().append("circle")
	    .attr("r", 12)
	    .attr("fill", "grey")
	   .on("click", function(d){alert(d.name);})
	   .on("click", function(d){esSearch(d.name);})
	   .append("svg:title")
	   .text(function(d) { return "Source: " + d.srccnt + " ~ Target: " + d.tgtcnt; });
*/
		
	// build the arrow.
/*	gLinks.append("svg:defs").selectAll("marker")
	    .data(["end"])
	  .enter().append("svg:marker")
	    .attr("id", String)
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 22)
	    .attr("refY", -1)
	    .attr("markerWidth", 8)
	    .attr("markerHeight", 8)
	    .attr("orient", "auto")
	  .append("svg:path")
	    .attr("d", "M0,-5L10,0L0,5");
*/	 
	// add the links and the arrows
	var path = gLinks
	  .enter()
	.append("svg:path")
	   .attr("id", function(d) { return d.id; } )
	    .attr("class", "link")
	    .attr("marker-end", "url(#end)");
	 
	var mytext = gLinks
	.enter()
	.append("text")
	.attr("dx", "150")
	.attr("dy", "-8")
	 .append("textPath")
	 .attr("xlink:href", function(d) { return "#" + d.id; })
	 .attr("style", "fill:magenta; font-weight:bold; font-size:12")
	 .text(function(d) { return d.relationship; } );

	function updateNodes() {
		var gNodes = theSvg.append("g")
            .attr("class", "nodes")
			.selectAll("circle")
            .data(nodes);


/*
	gNodes.selectAll("circle")
            .data(nodes)
  			.enter().append("circle")
      		 .attr("r", function(d){return +d.radius})
      		 .style("fill", function(d){return d.fill})
      		 .style("stroke", function(d){return d.stroke})
      		 .style("stroke-width", "1px")
  			 .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
*/
		gNodes.enter()
			.append("text")
		  .text(function(d){return d.name;})
	    .attr("class", "node")
		.merge(gNodes)

	gNodes.append("circle")
	    .attr("r", 12)
	    .attr("fill", "grey")
	   //.on("click", function(d){alert(d.name);})
	   .on("click", function(d){esSearch(d.name);})
	   .append("svg:title")
	   .text(function(d) { return "Source: " + d.srccnt + " ~ Target: " + d.tgtcnt; });

/*
			// define the nodes
		var u = svg.select('.nodes')
			.selectAll("text")
		    .data(nodes)

 u.enter()
    .append('text')
    .text(function(d) {
      return d.name
    })
    .merge(u)
    .attr('x', function(d) {
      return d.x
    })
    .attr('y', function(d) {
      return d.y
    })
    .attr('dy', function(d) {
      return 5
    })

  u.exit().remove()
  /*

*/


	}	
	
	function ticked() {
		updateLinks()
		updateNodes()
	}
})



//"data/lsrel.json", "#d3Relation"
function showForceField(dataUrl, htmlEl){
	theSvg = d3.select(htmlEl).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
		.call(d3.zoom().scaleExtent([1/2, 8])   //zoom and pan
			.on("zoom", function () {       
       		theSvg.attr("transform", d3.event.transform)
   		 }))
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Assigns parent, children, height, depth
	theRoot = d3.hierarchy(data, function(d) { return d.children; });
	theRoot.x0 = height / 2;
	theRoot.y0 = 0;

    updateTree(theRoot);
}
