function searchTree(data, value) {
  if(data.title == value) {
    return data;
  }
  if(data.children && data.children.length > 0) {
    for(var i=0; i < data.children.length; i++) {
      var node = traverseChildren(data.children[i], value);
      if(node != null) {
        return node;
      }
    }
  }
  return null;
}


var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

//client.ping({
//  requestTimeout: 30000,
//}, function (error) {
//  if (error) {
//    console.error('elasticsearch cluster is down!');
//  } else {
//    console.log('All is well');
//  }
//});

function esSearch(qryStr) {
client.search({
  index: 'bencaojb',
  type: 'v1',
  /*body: {
    query: {
      match: {
        'claims.content': '精神'
      }
    }
  }*/
  q: qryStr
}).then(function (resp) {
    //console.log(resp);
    var hits = resp.hits.hits;
    //console.log(hits);
    // D3 code
    //d3.select('#result').text(JSON.stringify(hits));

/* test to see what we got in "hits":
d3.values(hits)
  .forEach(function(obj){
    alert(obj["_source"]["name_cn"]);
});
*/
/* test to see what we got in "hits._source":
d3.keys(hits[0]._source)
  .forEach(function(obj){
    alert(obj);
});*/
/* for test
var hits = new Array(
        {id: 1, distance: 50},
        {id: 2, distance: 50},
        {id: 3, distance: 50},
        {id: 4, distance: 50},
        {id: 6, distance: 70}
 );
*/

// create the table header
var thead = d3.select("thead").selectAll("th")
    .data(d3.keys(hits[0]._source))
    //.data(d3.keys(hits[0]))
    .enter().append("th")
    .text( function(d){return d} );

// . create rows
//  . clear
var tr = d3.select("tbody").selectAll("tr")
    .remove();
//  . the update
var tr = d3.select("tbody").selectAll("tr")
    //.data(hits['_source'])
    .data(hits)
//    .exit().remove()
    .enter().append("tr") ;

// . cells
var td = tr.selectAll("td")
  .data( function(d) {return d3.values(d._source)})
//  .exit().remove()
  .enter().append("td")
    .text(function(d) {return JSON.stringify(d)})
}, function (err) {
    console.trace(err.message);
});

}
