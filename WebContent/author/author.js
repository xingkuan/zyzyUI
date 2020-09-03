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


function saveNode(composeDataFn) {
	$.ajax({
		type: 'POST',
		url: "/zyzySvc/reader/saveNode",
		//contentType: 'application/json',
		//contentType: 'application/text',
		//contentType: 'text/plain',
		//dataType: "json",
		//dataType: "text",
		//data : '{"cat": "test1", "val": ' + $('#srcNote').val() + '}',
		data: composeDataFn(),
		success: function(data, textStatus, jqXHR) {
		//	alert('note created successfully');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('error: ' + errorThrown + jqXHR.responseText);
		}
	});
}
