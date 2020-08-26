/**
 * 
 */

var width = 800;
var height = 600;
var color = d3.scaleOrdinal(d3.schemeCategory10);
var svg;
var label = {
    'nodes': [],
    'links': []
	};

function updateForceLink(graph){
	//create lable for each node
	var labelLayout = d3.forceSimulation(label.nodes)
	    .force("charge", d3.forceManyBody().strength(-50))
	    .force("link", d3.forceLink(label.links).distance(0).strength(2));
	//the actual directed graph
	var graphLayout = d3.forceSimulation(graph.nodes)
	    .force("charge", d3.forceManyBody().strength(-3000))
	    .force("center", d3.forceCenter(width / 2, height / 2))
	    .force("x", d3.forceX(width / 2).strength(1))
	    .force("y", d3.forceY(height / 2).strength(1))
	    .force("link", d3.forceLink(graph.links)
					.id(function(d, i) {/*console.log(d, i);*/return d.id}).distance(50).strength(1))
	    .on("tick", ticked);
//					.id(function(d) {return d.id;}).distance(50).strength(1))
//					.id(function(d) {return d.rel;}).distance(50).strength(1))

	var adjlist = [];

	graph.links.forEach(function(d) {
	    adjlist[d.source.index + "-" + d.target.index] = true;
	    adjlist[d.target.index + "-" + d.source.index] = true;
	});

	//verify if two nodes are directly connected?
	function neigh(a, b) {
	    return a == b || adjlist[a + "-" + b];
	}
	
///	var svg = d3.select("#d3Relation").attr("width", width).attr("height", height);
	var container = svg.append("g");

	svg.call(
	    d3.zoom()
	        .scaleExtent([.1, 4])
	        .on("zoom", function() { container.attr("transform", d3.event.transform); })
	);

	var linksBase = container.append("g").attr("class", "links")
	    .selectAll("aaa")    //seems like the value does not matter; but the line havs to be included.
	    .data(graph.links)
	    .enter();
	var link = linksBase.append("path")
		.attr("id", function(d, id){return "path"+id;});  //create IDs so text can be displayed.
//**** */specified in CSS
//		    .attr("stroke", "#aaa")
//		    .attr("stroke-width", "1px");
	//Link text
	linkLabels=linksBase.append("text")
		 .append("textPath")
		 .attr("xlink:href", function(d, id) { return "#path" + id; })  //link to the ID of pathID
		 .attr("style", "fill:magenta; font-size:10")
		.attr("startOffset", "50%")
		 .text(function(d) {return d.rela; } );

	function updateLink(link) {
		link.attr("d", function(d){
			if (d.line_type == "L"){
				return "M" + d.source.x + "," + d.source.y  
						+ "L" + d.target.x + "," + d.target.y;
			}else{
				let dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dr = Math.sqrt(dx * dx + dy * dy);
				return "M" + d.source.x + "," + d.source.y 
					+ "A" + dr + "," + dr + " 0 0,1 "
					+  d.target.x + "," + d.target.y ;
			}
		})
		.attr("stroke", function(d){
			if (d.line_type == "L"){
					return "green";
				}else{
					return "red";
				}
			});
	}

	var node = container.append("g").attr("class", "nodes")
	    .selectAll("g")
	    .data(graph.nodes)
	    .enter()
	    .append("circle")
		    .attr("r", 5)
		    .attr("fill", function(d) { return color(d.group); })

	node.on("mouseover", focus).on("mouseout", unfocus);
	
	node.call(
	    d3.drag()
	        .on("start", dragstarted)
	        .on("drag", dragged)
	        .on("end", dragended)
	);
	
	node.on("click", function(d, id){console.log(d, id);esSearch(d.id);});
	
	//Label nodes
	var labelNode = container.append("g").attr("class", "labelNodes")
	    .selectAll("text")
	    .data(label.nodes)
	    .enter()
	    .append("text")
		    .text(function(d, i) { return i % 2 == 0 ? "" : d.node.id; })
		    .style("fill", "#555")
		    .style("font-family", "Arial")
		    .style("font-size", 12)
		    .style("pointer-events", "none"); // to prevent mouseover/drag capture

	node.on("mouseover", focus).on("mouseout", unfocus);

	function ticked() {
	    node.call(updateNode);
	    link.call(updateLink);
	
	    labelLayout.alphaTarget(0.3).restart();
	    labelNode.each(function(d, i) {
	        if(i % 2 == 0) {
	            d.x = d.node.x;
	            d.y = d.node.y;
	        } else {
	            var b = this.getBBox();
	
	            var diffX = d.x - d.node.x;
	            var diffY = d.y - d.node.y;
	
	            var dist = Math.sqrt(diffX * diffX + diffY * diffY);
	
	            var shiftX = b.width * (diffX - dist) / (dist * 2);
	            shiftX = Math.max(-b.width, Math.min(0, shiftX));
	            var shiftY = 16;
	            this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
	        }
	    });
	    labelNode.call(updateNode);
	}

	function fixna(x) {
	    if (isFinite(x)) return x;
	    return 0;
	}

	function focus(d) {
	    var index = d3.select(d3.event.target).datum().index;
	    node.style("opacity", function(o) {
	        return neigh(index, o.index) ? 1 : 0.1;
	    });
	    labelNode.attr("display", function(o) {
	      return neigh(index, o.node.index) ? "block": "none";
	    });
	    link.style("opacity", function(o) {
	        return o.source.index == index || o.target.index == index ? 1 : 0.1;
	    });
	}

	function unfocus() {
	   labelNode.attr("display", "block");
	   node.style("opacity", 1);
	   link.style("opacity", 1);
	}

	function updateNode(node) {
	    node.attr("transform", function(d) {
	        return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
	    });
	}

	function dragstarted(d) {
	    d3.event.sourceEvent.stopPropagation();
	    if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
	    d.fx = d.x;
	    d.fy = d.y;
	}

	function dragged(d) {
	    d.fx = d3.event.x;
	    d.fy = d3.event.y;
	}

	function dragended(d) {
	    if (!d3.event.active) graphLayout.alphaTarget(0);
	    d.fx = null;
	    d.fy = null;
	}
}

//"data/lsrel3.json", "#d3Relation"
function showForceLink(dataUrl, htmlEl){
	svg = d3.select(htmlEl).attr("width", width).attr("height", height);

	d3.json(dataUrl).then(function(graph) {
		graph.nodes.forEach(function(d, i) {
		    label.nodes.push({node: d});
		    label.nodes.push({node: d});
		    label.links.push({
		        source: i * 2,
		        target: i * 2 + 1
		    });
		});
	   updateForceLink(graph);
	});
}