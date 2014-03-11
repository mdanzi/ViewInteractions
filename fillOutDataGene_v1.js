// this function expects its input data to have one root with a name and children values
// this function expects its root to be a gene
function fillOutDataGene(data,referenceTerms) {
	// first get all of the terms related to the root node 
	var newData=data;
	var rootName = newData.name;
	for (var i=0;i<referenceTerms.length;i++) {
		if (referenceTerms[i][0]===rootName) {
			// once we find a term that is related to this gene, we have to see if it is already one of that gene's children
			var isAlreadyPresent=0;
			for (var j=0;j<newData.children.length;j++) {
				if (referenceTerms[i][2]===newData.children[j].name) {
					isAlreadyPresent=1;
				}
			}
			// if we made it through all of the children without setting isAlreadyPresent to 1, then add this term as a child
			if (isAlreadyPresent===0) {
				var newChild = {"name":referenceTerms[i][2], "children":[]};
				newData.children.push(newChild);
			}
		}
	}
	// now that the root has been filled out, we have to do the same for each of its children
	for (var i=0; i<newData.children.length;i++) {
		var thisChildName=newData.children[i].name;
		for (var j=0; j<referenceTerms.length;j++) {
			// find all of the endtries for this reference term (note now we are using the third field to search instead of the first
				// because now we are seaching by term description to find genes)
			if (referenceTerms[j][2]===thisChildName) {
				var isAlreadyPresent=0;
				for (var k=0;k<newData.children[i].children.length;k++) {
					if (referenceTerms[j][0]===newData.children[i].children[k].name) {
						isAlreadyPresent=1;
					}
				}
				// now we also need to make sure this isn't the root node gene
				if (referenceTerms[j][0]===rootName) {
					isAlreadyPresent=1;
				}
				// if we made it through all of that without setting isAlreadyPresent to 1, then add this gene as a child
				if (isAlreadyPresent===0) {
					var newChild = {"name":referenceTerms[j][0]};
					newData.children[i].children.push(newChild);
				}
			}
		}
	}
	//and that is it, just return the newData set
	return newData;
}