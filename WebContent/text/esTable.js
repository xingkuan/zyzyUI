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
	  index: 'infobot',
	  /*body: {
	    query: {
	      match: {
	        'content': '精神'
	      }
	    }
	  }*/
	  //q: qryStr
	  body: {
      	query: {
        	match: {
          content: qryStr
        }
      }
    }
	}).then(function (resp) {
	    //console.log(resp);
	    let hits = resp.hits.hits;
	
		// create the table header
		d3.select("thead")
			.selectAll("th")
		    .data(d3.keys(hits[0]._source))
		    //.data(d3.keys(hits[0]))
		    .enter()
			.append("th")
		    .text( function(d){return d} );
		
		// create rows
		// firstly, remove all old rows
		d3.select("tbody")
			.selectAll("tr")
		    .remove();
		//then, add the new rows
		let tr = d3.select("tbody")
			.selectAll("tr")
		    //.data(hits['_source'])
		    .data(hits)
		    .enter().append("tr") ;
		
		// . cells [2020.08.27] how did each data field match up the HTML table field? 
		let td = tr.selectAll("td")
		  .data( function(d) {console.log(d);return d3.values(d._source)})
		  .enter()
		  .append("td")
		  .text(function(d) {return JSON.stringify(d)})
	}, function (err) {
	    console.trace(err.message);
	});

}



function zyzyESsearch(qryStr) {
d3.json("http://localhost:8080/zyzySvc/es/esSearchHi/"+qryStr).then(function (resp) {
	    //console.log(resp);
	    let hits = resp.hits.hits;
	
		// create rows
		let tr = d3.select('#main')
		.selectAll("p")
		    .data(hits)
		    .enter()
		    .append("p") 
		    //.text(function(d) {
		    .html(function(d) {
		    	let stgSrcId=d['_source']['stg_src_id'];
		    	let stgSrcSeq=d['_source']['stg_src_seq'];
		    	let ver=0;
		    	let id=d['_id'];
		    	let srcName=d['_source']['name'];
		    	console.log(id);
		    	let p = stgSrcId +", " + stgSrcSeq + ", " + id;
		    	p='<a href="esDocByID.html?id='+id+'">' + id +'</a><br>';
		    	p=p + "; " + '<a href="docSrcs.html?srcTitle='+srcName+'">' + srcName+'</a><br>';
		    	p=p + '; ' + '<a href="stgSrcVW.html?sid='+stgSrcId+'&sseq='+stgSrcSeq+'&ver='+ver+'">' + stgSrcSeq+'</a><br>';
		    	for (i of d['highlight']['content']){
		    		p = p + i + '<br>';
		    	}
//	    	return unescape(JSON.stringify(d['highlight']['content']))  //unescape <, >
				return p;
		    })   
		    ;
	}, function (err) {
	    console.trace(err.message);
	});
}
function zyzyESdocByID(id) {
	d3.json("http://localhost:8080/zyzySvc/es/esDocByID/"+id)
	.then(function (resp) {
	    let hits = resp.hits.hits;
		// create rows
	   	console.log(resp);
		let tr = d3.select('#main')
			.selectAll("p")
	    	.data(hits)
	    	.enter()
	    	.append("p") 
	    	//.text(function(d) {
	    	.html(function(d) {
			 	return id + '<br>'
			 		+ d['_source']['content'];
	   	});
	},function (err) {
	   	console.trace(err.message);
	});
}
function zyzyESdocsByTitle(titleName) {
	d3.json("http://localhost:8080/zyzySvc/es/esSrcsByTitle/"+titleName)
	.then(function (resp) {
	    let hits = resp.hits.hits;
   		let rslt = titleName +'<br>';
   		for (const i of hits){ 
			rslt = rslt + i['_source']['content'] + '<br>';
		}	    		

		d3.select('#main')
//			.selectAll("p")
//	    	.data(hits)
//	    	.enter()
//	    	.append("p") 
	    	//.text(function(d) {
	    	.html(rslt);
	},function (err) {
	   	console.trace(err.message);
	});
}
