function fillOutInteractionData (initialGenes, interactionTerms) {
	var temp=[];
	for (var i=0;i<initialGenes.length;i++) {
		var thisName=initialGenes[i].name;
		var thisGroup=initialGenes[i].group;
		var thisGroupID=initialGenes[i].groupID;
		var thisNode={"name":thisName, "group":thisGroup,"groupID":thisGroupID,"class":"sourceNode", "shape":"rectangle","radius":30,"edgeCount":0};
		temp.push(thisNode);
	}
	console.log("initialGenes.length = " + initialGenes.length);
	
	
	var data = {"nodes":[], "edges":[]};
	data.nodes=temp;
	console.log(data);
	var degreesOfFreedom=1; // this is the number of generations of connections we want to allow
	for (var i=0;i<degreesOfFreedom;i++) {
		// read through all current nodes and add new nodes and new edges for each connection that they have in the interactionTerms set
		var numOfInitialNodes=data.nodes.length;
		for (var j=0;j<numOfInitialNodes;j++) {
			for (var k=0; k<interactionTerms.length; k++) {
				if (data.nodes[j].name===interactionTerms[k][0]) {
					// once we find a match, check to see if its partner is already a node in the set
					var alreadyANode=0;
					var indexOfTargetNode=-1;
					var thisEdge=-1;
					for (var l=0;l<data.nodes.length;l++) {
						if (data.nodes[l].name===interactionTerms[k][1]){
							alreadyANode=1;
							indexOfTargetNode=l;
						}
					}
					// if we have already made this a node, check if there is a link between the two nodes
					if (alreadyANode==1) {
						var edgeExists=0;
						for (var l=0;l<data.edges.length;l++) {
							if (data.edges[l].source===j) {
								if (data.edges[l].target===indexOfTargetNode) {
									edgeExists=1;
									thisEdge=l;
								}
							}
							if (data.edges[l].source===indexOfTargetNode) {
								if (data.edges[l].target===j) {
									edgeExists=1;
									thisEdge=l;
								}
							}
						}
						// if there isn't one already, create one
						if (edgeExists===0) {
							data.edges.push({"source":j,"target":indexOfTargetNode,"evidence":interactionTerms[k][2],"pubmedID":interactionTerms[k][3],"evidences":1});
							data.nodes[j].edgeCount=data.nodes[j].edgeCount+1;
							data.nodes[indexOfTargetNode].edgeCount=data.nodes[indexOfTargetNode].edgeCount+1;
						}
						// if this edge already exists, then we have found an additional piece of supporting evidence for it
						if (edgeExists===1) {
							data.edges[thisEdge].evidences=data.edges[thisEdge].evidences+1;
						}
					}
					// if the gene is not already a node, then make a node
					else if (i===0){
						data.nodes.push({"name":interactionTerms[k][1],"class":"targetNode","shape":"circle","radius":20,"edgeCount":1});
						// and make an edge
						data.edges.push({"source":j,"target":(data.nodes.length-1),"evidence":interactionTerms[k][2],"pubmedID":interactionTerms[k][3],"evidences":1});
						data.nodes[j].edgeCount=data.nodes[j].edgeCount+1; 
					}
					else {
						// if this is the second degree of freedom, do nothing 
					}
				}
				// now we do the exact same thing again but checking if this node is listed as the target (gene2)
				if (data.nodes[j].name===interactionTerms[k][1]) {
					// once we find a match, check to see if its partner is already a node in the set
					var alreadyANode=0;
					var indexOfTargetNode=-1;
					var thisEdge=-1;
					for (var l=0;l<data.nodes.length;l++) {
						if (data.nodes[l].name===interactionTerms[k][0]) {
							alreadyANode=1;
							indexOfTargetNode=l;
						}
					}
					// if we have already made this a node, check if there is a link between the two nodes
					if (alreadyANode===1) {
						var edgeExists=0;
						for (var l=0;l<data.edges.length;l++) {
							if (data.edges[l].source===j) {
								if (data.edges[l].target===indexOfTargetNode) {
									edgeExists=1;
									thisEdge=l;
								}
							}
							if (data.edges[l].source===indexOfTargetNode) {
								if (data.edges[l].target===j) {
									edgeExists=1;
									thisEdge=l;
								}
							}
						}
						// if there isn't an edge already, create one
						if (edgeExists===0) {
							data.edges.push({"source":j,"target":indexOfTargetNode,"evidence":interactionTerms[k][2],"pubmedID":interactionTerms[k][3],"evidences":1});
							data.nodes[j].edgeCount=data.nodes[j].edgeCount+1;
							data.nodes[indexOfTargetNode].edgeCount=data.nodes[indexOfTargetNode].edgeCount+1;
						}
						// if this edge already exists, then we have found an additional piece of supporting evidence for it
						if (edgeExists===1) {
							data.edges[thisEdge].evidences=data.edges[thisEdge].evidences+1;
						}
					}
					// if the gene is not already a node, then make a node
					else if (i===0) {
						data.nodes.push({"name":interactionTerms[k][0],"class":"targetNode","shape":"circle","radius":20,"edgeCount":1});
						//and make an edge
						data.edges.push({"source":j,"target":(data.nodes.length-1),"evidence":interactionTerms[k][2],"pubmedID":interactionTerms[k][3],"evidences":1});
						data.nodes[j].edgeCount=data.nodes[j].edgeCount+1;
					}
					else {
						// if this is the second (or later) degree of freedom, do nothing
					}
				}
			}
		}
		
		console.log(data);
		
		// Now we can filter the data to only keep edges that have the minimum required number of evidences
		if (requiredEvidences>1) {
			// go through each edge and see if it has at least the required number of evidences
			for (var j=0;j<data.edges.length;j++) { 
				if (data.edges[j].evidences<requiredEvidences) {
					sourceIndex=data.edges[j].source;
					targetIndex=data.edges[j].target;
					data.nodes[sourceIndex].edgeCount=data.nodes[sourceIndex].edgeCount-1;
					data.nodes[targetIndex].edgeCount=data.nodes[targetIndex].edgeCount-1;
					data.edges.splice(j,1);
					j=j-1;
				}
			}
			// now go through the nodes and remove any nodes that do not have any incoming edges and adjust the calls of the edges accordingly 
			for (var j=0;j<data.nodes.length;j++) {
				if ((data.nodes[j].edgeCount<2) & (data.nodes[j].class=="targetNode")) {
					if (data.nodes[j].edgeCount>0) {
						for (var k=0;k<data.edges.length;k++) {
							if (data.edges[k].target===j) {
								sourceIndex=data.edges[k].source;
								data.nodes[sourceIndex].edgeCount=data.nodes[sourceIndex].edgeCount-1;
								data.edges.splice(k,1);
								k=k-1;
							}
							else if (data.edges[k].source===j) {
								targetIndex=data.edges[k].target;
								data.nodes[targetIndex].edgeCount=data.nodes[targetIndex].edgeCount-1;
								data.edges.splice(k,1);
								k=k-1;
							}
						}
					}
					data.nodes.splice(j,1);
					for (var k=0;k<data.edges.length;k++) {
						if (data.edges[k].source>j) {
							data.edges[k].source=data.edges[k].source-1;
						}
						if (data.edges[k].target>j) {
							data.edges[k].target=data.edges[k].target-1;
						}
					}
					j=j-1;
				}
			}
		}
		console.log(data);
		
		// if we want to manually omit one of the target nodes, this script will do it
		if (omitSomething===1) {
			var omit="UBC";
			var omitIndex=-1;
			for (var j=0;j<data.nodes.length;j++) {
				if (data.nodes[j].name===omit) {
					omitIndex=j;
				}
			}
			for (var j=0;j<data.edges.length;j++) {
				if (data.edges[j].source===omitIndex) {
					targetIndex=data.edges[j].target;
					data.nodes[omitIndex].edgeCount=data.nodes[omitIndex].edgeCount-1;
					data.nodes[targetIndex].edgeCount=data.nodes[targetIndex].edgeCount-1;
					data.edges.splice(j,1);
					j=j-1;
				}
				else if (data.edges[j].target===omitIndex) {
					sourceIndex=data.edges[j].source;
					data.nodes[sourceIndex].edgeCount=data.nodes[sourceIndex].edgeCount-1;
					data.nodes[omitIndex].edgeCount=data.nodes[omitIndex].edgeCount-1;
					data.edges.splice(j,1);
					j=j-1;
				}
			}
			for (var j=initialGenes.length;j<data.nodes.length;j++) {
				if (data.nodes[j].edgeCount===0) {
					data.nodes.splice(j,1);
					for (var k=0;k<data.edges.length;k++) {
						if (data.edges[k].source>j) {
							data.edges[k].source=data.edges[k].source-1;
						}
						if (data.edges[k].target>j) {
							data.edges[k].target=data.edges[k].target-1;
						}
					}
					j=j-1;
				}
			}
		}
		// if there are more round left (for degrees of freedom > 1 only), go through and reset the evidence counts on all edges
		if (i<degreesOfFreedom-1) {
			for (var j=0;j<data.edges.length;j++) {
				data.edges[j].evidences=0;
			}
		}		
	}
	// and thats it! data has now been constructed, we just need to display it now. 
	return data;
}