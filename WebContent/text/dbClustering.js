//"/zyzySvc/reader/hbList/getHB", "#d3Cluster"
function VisualizeClustering(htmlEl, dataUrl) {
	let width,
		height,
		svgNodes,
		nodes;
	let simulation, textNodes;
	let colorScale = ['orange', 'lightblue', '#B19CD9'];

	let box = document.querySelector(htmlEl);
	width = box.clientWidth;
	height = box.clientHeight;

	//get data
	$.ajax({
		type: "GET",
		url: dataUrl,
		data: "",
		//  dataType: "text",
		//  contentType: "application/text",
		success: function(data) {
			//	console.log(data);
			nodes = JSON.parse(data);
			drawNodes(nodes);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	});

	function drawNodes(nodes) {
		svgNodes = d3.select(htmlEl)
			.call(d3.zoom().on("zoom", function() {       //zoom and pan
				svgNodes.attr("transform", d3.event.transform)
			}))
			.selectAll('g')
			.data(nodes)
			.enter()
			.append('g');

		//add circles
		svgNodes.append('circle')
			.attr('r', function(d) { return 5; })
			//.style('fill', function(d) {  return d.color;})
			.style('fill', function(d) { return "#87AFC7"; })
		//add text
		textNodes = svgNodes.append('text')
			.text(function(d) { return d.name; })
			.attr("text-anchor", "middle")
			.attr("style", "font-weight:bold; font-size:10; fill:gray")

		//setup the forceSimulation and start
		simulation = d3.forceSimulation(nodes)
			.force("charge", d3.forceManyBody().strength(5))
			.force("center", d3.forceCenter(width / 2, height / 2))
			//.force("x", d3.forceX(width / 2).strength(1))
			//.force("y", d3.forceY(height / 2).strength(1))
			.force('collision', d3.forceCollide().radius(function(d) { return 20; }))
			//.on("tick", ticked)
			;
	}

	/* ************************************************ */
	function ticked() {
		svgNodes.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	}
}

function recluster(keyColl) {
	textNotes.attr("style", function(d) {
		if (d.cats.includes(keyColl)) { return "font-weight:bold; font-size:12; fill:green"; }
		else { return "font-size:5; fill:black"; }
	});

	simulation    // hope it is visible from here...
		//.force('x', d3.forceX().x(function(d) { if(d.cats.includes(c)){ return 200;} else {return 600;}}).strength(5)) 
		.force('x', d3.forceX().x(function(d) { if (d.cats.includes(keyColl)) { return 150; } else { return 900; } }))
		//.force('y', d3.forceY().y(function(d) { return 0;}).strength(3)) 
		.force('y', d3.forceY().y(function(d) { if (d.cats.includes(keyColl)) { return 150; } else { return 900; } }))
		.alphaTarget(0.1)
		.restart()
		;
}

