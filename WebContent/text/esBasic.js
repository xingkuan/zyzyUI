var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});
//"#esResult"
function esJiaoCaiSearch(htmlEl, qryStr) {
	client.search({
	  index: 'jiaocai',
	  type: 'v1',
	  size: 10,
	  /*body: {
	    //stored_field: ["tags"],
	    //query: {
	    //  match: {
	    //    'claims.content': '精神'
	    //  }
	    //} 
	    aggs: {
	        distinct: {
	            terms: {
	                field: "tags"
	            }
	        }
	    }
	  }
	  */
	  q:qryStr
	}).then(function (resp) {
	  console.log(resp);
	  // D3 code goes here.
	 let hits = resp.hits.hits;
	
	// create a div for a new doc
	// 1. clear (needed!)
	//var doc = d3.select("#esRight").select("#esResult").selectAll("div")
	d3.select(htmlEl).selectAll("div")
	         .remove();
	// ...and the update
	d3.select(htmlEl).selectAll("div")
	    //.data(hits['_source'])
	    // each doc
	    .data(hits)
	    .enter()
	    .append("div") 
	    // inside each doc, each elements
	    .html(function(d) {return ' '
	         + '<h2 class="name_cn">' + d._source.name_cn + '(' + d._source.name_py + ')' + '</h2>'
	         + '<p><img src="img/' + d._source.images[0] + '">' 
	         + '<p>' + d._source.specs1
	         + '<p>' + d._source.tags
	         + '<p>' + d._source.ref_tra
	         + '<p>' + d._source.ref_mod
	          ; })
	       /*.selectAll("p")
	       .data( function(eleData, i) {return d3.values(eleData._source);})
	       .enter().append("p")
	         .text(function(d) {return d;});*/
	    }, function (err) {
	        console.trace(err.message);
	    });
}

// TODO: too much duplicated codes with esSearch !!!
function esJiaoCaiSearchTags(htmlEl, qryStr) {
client.search({
  index: 'jiaocai',
  type: 'v1',
  size: 10,
  body: {
    //stored_field: ["tags"],
    query: {
      match: {
        'tags': qryStr
      }
    } 
  }
  //q:qryStr
}).then(function (resp) {
  console.log(resp);
  // D3 code goes here.
  var hits = resp.hits.hits;

   // create a div for a new doc
   // 1. clear (needed!)
   d3.select(htmlEl).selectAll("div")
         .remove();
   // ...and the update
   d3.select(htmlEl).selectAll("div")
    //.data(hits['_source'])
    // each doc
    .data(hits)
    .enter()
       .append("div") 
       // inside each doc, each elements
       .html(function(d) {return ' '
         + '<h2 class="name_cn">' + d._source.name_cn + '(' + d._source.name_py + ')' + '</h2>'
         + '<p><img src="img/' + d._source.images[0] + '">' 
         + '<p>' + d._source.specs1
         + '<p>' + d._source.tags
         + '<p>' + d._source.ref_tra
         + '<p>' + d._source.ref_mod
          ; })
       /*.selectAll("p")
       .data( function(eleData, i) {return d3.values(eleData._source);})
       .enter().append("p")
         .text(function(d) {return d;});*/
  }, function (err) {
    console.trace(err.message);
  });

}
