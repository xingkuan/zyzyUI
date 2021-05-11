/**
 * 
 */

function setupOptionField(elementID, srcUrl, srcDataFldName) {
	$.ajax({
		type: "GET",
		//url: "/zyzySvc/reader/template/getList",
		url: srcUrl,
		data: "",
		//dataType: "json",
		contentType: "text/plain",
		success: function(data) {
			//alert('elID 2: ' + elementID);
			//var tempList = document.getElementById(elID);
			//let id = "#" + "srcTempList";
			let id = "#" + elementID;
			let tempList = $(id);
			tempList.empty();
			$.each(data, function(i) {
				tempList.append(
					'<option value="' + data[i][srcDataFldName] + '">' + data[i][srcDataFldName] + '</option>'
				);
			});
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	});
}

//function setNoteD(sec, val){
function setTextFields(srcUrl, innerFn, innderFnX) {
	//let srcUrl="/zyzySvc/reader/note/get/"+val;
	$.ajax({
		type: "GET",
		url: srcUrl,
		data: "",
		//  dataType: "text",
		//  contentType: "application/text",
		success: function(data) {
			//alert(data);
			if (data != null) {
				//jsonData=JSON.parse(data);
				jsonData = data;
				innerFn();
			} else {
				innderFnX();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	});
}

function saveStgSrc(replacing, composeDataFn) {
	//rem alert('to create... \nsrc: ' + $('#srcNote').val() + '\n...tgt: ' +  $('#tgtNote').val() + "\n...relation:" + $('#selRelation option:selected').val());
	//rem console.log('add a note');
		url="/zyzySvc/STG/srcReplaceVersion0";
	if(!replacing)
		url="/zyzySvc/STG/srcSaveNewVersion";   
	$.ajax({
		type : 'POST',
		async: false,
		url : url,
		//contentType: 'application/json',
		contentType : 'application/text',
		//contentType: 'text/plain',
		//dataType: "json",
		dataType : "text",
		//data : '{"cat": "test1", "val": ' + $('#srcNote').val() + '}',
		data : composeDataFn(),
		success : function(data, textStatus, jqXHR) {
			$('#srcContent').val('note created successfully');
			//alert('note created successfully');
                window.location = "/html/";
		},
		error : function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	})
}



function zyzyStgDocById(srcUrl, innerFn, innderFnX){
	$.ajax({
		type: "GET",
		url: srcUrl,
		data: "",
		//  dataType: "text",
		//  contentType: "application/text",
		success: function(data) {
			//alert(data);
			if (data != null) {
				//jsonData=JSON.parse(data);
				jsonData = data;
				innerFn();
			} else {
				innderFnX();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + textStatus + errorThrown);
		}
	});
}

	function getRESTsingleRow(srcUrl){
		//let srcUrl = "/zyzySvc/STG/getSTGRegTEXT/"+srcId;
		var rslt=null;
		$.ajax({
			type: "GET",
			url: srcUrl,
			async: false,
			success: function(data) {
				if (data != null) {
					rslt = data[0];
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('error: ' + textStatus + errorThrown);
			}
		});
		return rslt;		
	}