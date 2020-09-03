// ************** tree diagram    *****************


/***set the svg, load data and get go ...*****/
//d3.select(self.frameElement).style("height", "500px");
function esTree(htmlEl, dataUrl, nodeClickfn){
	let margin = {top: 10, right: 120, bottom: 10, left: 20};
	//    width = 400 - margin.right - margin.left,
	//    height = 400 - margin.top - margin.bottom;
	
	let i = 0,
	    duration = 750,
	    theRoot,
		theSvg;
	// a tree layout and assigns the size
	let treemap;

	let box = document.querySelector(htmlEl);
	width = box.clientWidth;
	height = box.clientHeight;

	treemap = d3.tree()
      .size([height, width]);

	d3.json(dataUrl).then(function(data) {
	/*theSvg = d3.select(htmlEl).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)*/
		theSvg = d3.select(htmlEl)	
			.call(d3.zoom().on("zoom", function () {       //zoom and pan
       			theSvg.attr("transform", d3.event.transform)
   		 	 }))
        	.append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Assigns parent, children, height, depth
		theRoot = d3.hierarchy(data, function(d) { return d.children; });
		theRoot.x0 = height / 2;
		theRoot.y0 = 0;
	
	    updateTree(theRoot);
	})

/************************************* */
	function updateTree(source) {
	  // Assigns the x and y position for the nodes
	  var treeData = treemap(theRoot);
	
	  var nodes = treeData.descendants(),
	      links = treeData.descendants().slice(1);
	
	  // Normalize for fixed-depth.
	  nodes.forEach(function(d){ d.y = d.depth * 180});
	
	  //.......... Nodes section ................
	  // update node. What's for?[2020.08.22]
	  var node = theSvg.selectAll('g.node')
	      .data(nodes, function(d) {return d.id || (d.id = ++i); });
	  //add transfomr: <g class="node" transfomr= ...
	  // <g ...> 
	  //    <g class="node" transfomr= ..> ..</g>
	  // </g>
	  var nodeEnter = node.enter().append('g')
	      .attr('class', 'node')
	      .attr("transform", function(d) {
	        return "translate(" + source.y0 + "," + source.x0 + ")";
	    })
	    .on('click', click);
	  // .. <g class="node" transfomr= ..>
	  //      <circle ...><circle>
	  // .. </g>
	  nodeEnter.append('circle')
	      .attr('class', 'node')
	      .attr('r', 1e-6)
	      .style("fill", function(d) {
	          return d._children ? "lightsteelblue" : "#fff";
	      });
	  // .. <g class="node" transfomr= ..>
	  //      <circle ...><circle>
	  //      <text ...>...<text>
	  // .. </g>
	  nodeEnter.append('text')
	      .attr("dy", ".35em")
	      .attr("x", function(d) {
	          return d.children || d._children ? -13 : 13;
	      })
	      .attr("text-anchor", function(d) {
	          return d.children || d._children ? "end" : "start";
	      })
	      .text(function(d) { return d.data.name; });
	
	  // UPDATE
	  var nodeUpdate = nodeEnter.merge(node);
	
	  // Transition to the proper position for the node
	  nodeUpdate.transition()
	    .duration(duration)
	    .attr("transform", function(d) { 
	        return "translate(" + d.y + "," + d.x + ")";
	     });
	
	  // Update the node attributes and style
	  nodeUpdate.select('circle.node')
	    .attr('r', 10)
	    .style("fill", function(d) {
	        return d._children ? "lightsteelblue" : "#fff";
	    })
	    .attr('cursor', 'pointer');
	
	  // Remove any exiting nodes
	  var nodeExit = node.exit().transition()
	      .duration(duration)
	      .attr("transform", function(d) {
	          return "translate(" + source.y + "," + source.x + ")";
	      })
	      .remove();
	
	  // On exit reduce the node circles size to 0
	  nodeExit.select('circle')
	    .attr('r', 1e-6);
	
	  // On exit reduce the opacity of text labels
	  nodeExit.select('text')
	    .style('fill-opacity', 1e-6);
	
	  // .......... links section .................
	  //update link(?)
	  var link = theSvg.selectAll('path.link')
	      .data(links, function(d) { return d.id; });
	  // <g ...> 
	  //    <path class="link" transfomr= ..> ..</g>
	  // </g>
	  var linkEnter = link.enter().insert('path', "g")
	      .attr("class", "link")
	      .attr('d', function(d){
	        var o = {x: source.x0, y: source.y0}
	        return diagonal(o, o)
	      });
	  // UPDATE
	  var linkUpdate = linkEnter.merge(link);
	
	  // Transition back to the parent element position
	  linkUpdate.transition()
	      .duration(duration)
	      .attr('d', function(d){ return diagonal(d, d.parent) });
	
	  // Remove any exiting links
	  var linkExit = link.exit().transition()
	      .duration(duration)
	      .attr('d', function(d) {
	        var o = {x: source.x, y: source.y}
	        return diagonal(o, o)
	      })
	      .remove();	
	
		// Stash the old positions for transition.
		nodes.forEach(function(d) {
		    d.x0 = d.x;
		    d.y0 = d.y;
		  });
	
		//to be used as CSS attrib. value
		function diagonal(s, d) {
		    path = `M ${s.y} ${s.x}
	            C ${(s.y + d.y) / 2} ${s.x},
	              ${(s.y + d.y) / 2} ${d.x},
	              ${d.y} ${d.x}`
		    return path
		}
		// Toggle children on click.
		//TODO:  esSearch() need to be passed in as a parameter!
		//let nodeLinkFn = esJiaoCaiSearchTags;
		//let nodeLinkFn=fn;
		function click(d) {
			let keyTerm = d.data.name;
			
			/*..........
			let keyColl = "";
	  			let p = d;
	  			while (p.depth > 1) {
	  				keyColl = '|' + p.data.name + keyColl;
	  				p = p.parent;
	  			}
	  			//now, p is at the top. Add it to the name:
	  			keyColl = p.data.name + keyColl;
			............*/
			
			if (d.children) {
		       	d._children = d.children;
		       	d.children = null;
//				esJiaoCaiSearchTags("#esResult", d.data.name);
				nodeClickfn(keyTerm);
			} else {
		       	//alert(d.name);
		       	// just to be nice: clean up the selectiong
		       	document.getElementById('symptom').selectedIndex = 0;
//		       	esJiaoCaiSearchTags(d.data.name, "#esResult");
				//nodeLinkFn(d.data.name, "#esResult");
				nodeClickfn(keyTerm);   
		       	d.children = d._children;
		      	d._children = null;
			}
			updateTree(d);
		}
	}
/************************************* */
}
