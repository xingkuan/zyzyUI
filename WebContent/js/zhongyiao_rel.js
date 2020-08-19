//d3.csv("data/lsrel.csv", function(error, links) {
d3.json("data/lsrel.json", function(error, links) {
//?? "links" have an epmty line, which generate an extra node.
//?? how can you remove it?
var nodes = {};
var rel = {};
 
console.log(links);
// Compute the distinct nodes from the links.
links.forEach(function(link) {
//for (var i=0, len = links.length; i < len; i++) {
//link = links[i];
console.log(link.relnum);
   link.id = "rel" + link.relnum; 
   // link.relnum = link.relnum;
   var sLinkSrc = link.source;
   var sLinkTgt = link.target;
   link.source = nodes[link.source] || 
        (nodes[link.source] = {name: link.source, relcnt: 0, srccnt: 0, tgtcnt: 0});
   link.target = nodes[link.target] || 
        (nodes[link.target] = {name: link.target, relcnt: 0, srccnt: 0, tgtcnt: 0});
   link.relationship = link.relationship;
    
   if (nodes[sLinkSrc])
   {
         nodes[sLinkSrc]["relcnt"] = nodes[sLinkSrc]["relcnt"]+1;
         nodes[sLinkSrc]["srccnt"] = nodes[sLinkSrc]["srccnt"]+1;
   }
 
   if (nodes[sLinkTgt])
   {
         nodes[sLinkTgt]["relcnt"] = nodes[sLinkTgt]["relcnt"]+1;
         nodes[sLinkTgt]["tgtcnt"] = nodes[sLinkTgt]["tgtcnt"]+1;
   }
 
   // console.log(JSON.stringify(nodes));
   // console.log("NODEPROP: " + nodes[sLinkSrc].name);
//};
});
 
//var width = screen.width-80,
//    height = screen.height-80;
//.. "d3Relation" is defined in the index3.html, which contains this HTML
var width = document.getElementById('d3Relation').clientWidth,
    height = document.getElementById('d3Relation').clientHeight;
 
console.log("Width: " + width);
console.log("Height: " + height);
 
var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    //.linkDistance(200)
.gravity(0.05)
.charge(function(d) {return d.charge;})
.linkDistance(function(d) { return  d.dist; })
    .charge(-800)
    .on("tick", tick)
    .start();
 
var drag = force.drag()
            .on("dragstart", dragstart);
 
//var svg = d3.select("body").append("svg")
var svg = d3.select("#d3Relation").append("svg")
    .attr("width", width)
    .attr("height", height);
 
// build the arrow.
svg.append("svg:defs").selectAll("marker")
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
 
// add the links and the arrows
var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter()
.append("svg:path")
   .attr("id", function(d) { return d.id; } )
    .attr("class", "link")
    .attr("marker-end", "url(#end)");
 
var mytext = svg.append("svg:g").selectAll("text")
.data(force.links())
.enter()
.append("text")
.attr("dx", "150")
.attr("dy", "-8")
 .append("textPath")
 .attr("xlink:href", function(d) { return "#" + d.id; })
 .attr("style", "fill:magenta; font-weight:bold; font-size:12")
 .text(function(d) { return d.relationship; } );
 
// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node")
    .call(force.drag);
 
// add the nodes
node.append("circle")
    .attr("r", 12)
    .attr("fill", "grey")
   //.on("click", function(d){alert(d.name);})
   .on("click", function(d){esSearch(d.name);})
   .append("svg:title")
   .text(function(d) { return "Source: " + d.srccnt + " ~ Target: " + d.tgtcnt; });
 
// add the text
/*node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .attr("style", "fill:blue; font-weight:bold; font-size:16")
    .text(function(d) { return d.name; });
*/
 
node.append("text")
   .attr("text-anchor", "middle")
    // .attr("style", "font-weight:bold; font-size:12")
    .attr("style", function(d) {
      if (d.relcnt >= 3)
      {
         return "font-weight:bold; font-size:12; fill:red"
      }
      else
      {
         return "font-weight:bold; font-size:12"
      }
   })
   //.text(function(d) { return d.relcnt; });
    .attr("style", "fill:blue; font-weight:bold; font-size:16")
    .text(function(d) { return d.name; });
 
// add the curvy lines
function tick() {
    path.attr("d", function(d) {
        if (d.line_type == "L"){
           return "M" +
            d.source.x + "," +
            d.source.y + "L" +
            d.target.x + "," +
            d.target.y;
        }
        else{
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" +
            d.source.x + "," +
            d.source.y + "A" +
            dr + "," + dr + " 0 0,1 " +
            d.target.x + "," +
            d.target.y;
        }
    });
 
    node
         .attr("transform", function(d) {
             return "translate(" + d.x + "," + d.y + ")"; });
}
 
function dragstart(d)
{
   d3.select(this).classed("fixed", d.fixed = true);
}
if (error)
{
   console.log(error);
}
else
{
   console.log(nodes);
   console.log(links);
   console.log(path);
   console.log(rel);
}
});
 
