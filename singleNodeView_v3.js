function singleNodeView(rootNode, interactionTerms, referenceTerms, originalGenes, newDiameter) {
	var diameter;
	if (newDiameter!=null) {
		diameter=newDiameter;
	}
	else {
		diameter=1600;
	}
	
	var margin = {top: 20, right: 120, bottom: 20, left: 120},
		width = diameter,
		height = diameter;
		
	var i = 0,
		duration = 350,
		root;
		
	var groupColors = d3.scale.category20();	
	
	var tree = d3.layout.tree()
		.size([360, diameter / 2 - 80])
		.separation(function(a, b) { return (a.parent == b.parent ? 1 : 10) / a.depth; });
	
	var diagonal = d3.svg.diagonal.radial()
		.projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
	
	var svg = d3.select("body").append("svg")
		.attr("width", width )
		.attr("height", height )
	  .append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
	
	// move the user to the center of the page
	var radius = diameter/2;
	var windowHeight = window.innerHeight;
	var windowWidth = window.innerWidth;
	var halfWindowHeight = windowHeight/2;
	var halfWindowWidth= windowWidth/2;
	window.scrollTo((radius-halfWindowWidth),(radius-halfWindowHeight));
	
	root = rootNode;
	root.x0 = height / 2;
	root.y0 = 0;
		
	root.children.forEach(collapse); // start with all children collapsed
	update(root);
				
	d3.select(self.frameElement).style("height", "800px");
	
	function update(source) {
	
	  // Compute the new tree layout.
	  var nodes = tree.nodes(root),
		  links = tree.links(nodes);
	  // Normalize for fixed-depth.
	  if (root.children.length>100) {
		  nodes.forEach(function(d) { 
		  if (d.depth>1) {
			  d.y = d.depth * 1.6 * nodes.length + d.depth * root.children.length; //the magic number here is just a modifier that i found worked well
		  }
		  else {
			  d.y = d.depth * 1.6 * root.children.length + d.depth * nodes.length * 0.5; //the magic number here is just a modifier that i found worked well
		  } });
	  }
	  else if (nodes.length>200) {
		  // so in this case, we have relatively few child nodes but have expanded some of them to yield lots of grandchild nodes
		  nodes.forEach(function(d) {
			  d.y = d.depth * 1.9 * nodes.length;
		  });
	  }
	  // exception for root nodes with only one child to fix that problem
	  else if (root.children.length===1) {
		  nodes.forEach(function(d) {
			  d.y = d.depth * nodes.length + 200;
		  });
	  }
	  else { 
		nodes.forEach(function(d) { 
			if (d.depth > 1) {
				d.y = d.depth * 200 + 200
			}
			else {
				d.y = d.depth * 200;
			}
		});
	  }
	 
	  // Update the nodes…
	  var node = svg.selectAll("g.node")
		  .data(nodes, function(d) { return d.id || (d.id = ++i); });
	
	  // Enter any new nodes at the parent's previous position.
	  var nodeEnter = node.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
		  .on("contextmenu", contextClick);
		  
	
	  nodeEnter.append("circle")
		  .attr("r", 1e-6)
		  .on("click", clickNode)
		  .style("fill", function(d) { 
			//return d._children ? "lightsteelblue" : "#fff"; 
			if ("_children" in d) {
				if (d._children==null) {
					return "#fff";
				}
				else if (d._children=="") {
					return "#fff";
				}
				else {
					return "lightsteelblue";
				}
			}
			else {
				return "#fff";
			}
		});
	
	  nodeEnter.append("text")
		  .attr("x", function(d) {return d.name.length;})
		  .attr("dy", ".35em")
		  .attr("text-anchor", "start")
		  .attr("wrapped","0")
		  .attr("groupID","2")
		  .text(function(d) { return d.name; })
		  .attr("transform", function(d) { return d.x < 180 ? "translate(5)" : "rotate(180)translate(-" + (this.getComputedTextLength()*1.2+10) + ")"; })
		  .on("click", clickLabel)
		  .style("fill-opacity", 1e-6)
		  .style("font-size","14px");
	
	  // Transition nodes to their new position.
	  var nodeUpdate = node.transition()
		  .duration(duration)
		  .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
	
	  nodeUpdate.select("circle")
		  .attr("r", function(d) {
			  if (d._children) {
				  if (d._children.length>0) {
					return 4.5+Math.log(d._children.length);
				  }
				  else {
					return 4.5;
				  }
			  }
			  else {
				  return 4.5;
			  }
			})
		  .style("fill", function(d) { 
			//return d._children ? "lightsteelblue" : "#fff"; 
			if ("_children" in d) {
				if (d._children==null) {
					return "#fff";
				}
				else if (d._children=="") {
					return "#fff";
				}
				else {
					return "lightsteelblue";
				}
			}
			else {
				return "#fff";
			}
		  });
	
	  
	  nodeUpdate.select("text")
		  .style("fill-opacity", 1)
		  .style("fill", function(d) {
			  if(isAnOriginalGene(d.name)) {
				  if (getGroupID(d.name)===0) {
					  return "steelblue";
				  }
				  else {
					  return "red";
				  }
			  }
			  else {
				  return "black";
			  }
		  })
		  .attr("transform", function(d) { return d.x < 180 ? "translate(5)" : "rotate(180)translate(-" + (this.getComputedTextLength()*1.2+10) + ")"; });
	  
	  
	  var rootNodeSelection = svg.select("g.node")
		  .data(nodes, function(d) { return d.id || (d.id = ++i); })
		  .transition().duration(duration);
		  
		  			  
	  // this next chunk of code formats the root node
	  rootNodeSelection.select("circle").attr("r",75).style("fill","steelblue").attr("transform","translate(30)");
	  // when a node gets placed as the root, its text gets wrapped, all subsequent times, skip the text wrapping
	  rootNodeSelection.select("text").call(function(d) {
		  if (d[0][0].attributes.wrapped.value==="1") {
			  rootNodeSelection.select("text")
				.style("fill-opacity","1")
				.attr("transform","rotate(-90)translate(0)")
				.attr("dy","2.5em")
				.attr("text-anchor", "middle")
				.style("fill","#000");
		  }
		  else {		  
			  rootNodeSelection.select("text")
				.style("fill-opacity","1")
				.attr("transform","rotate(-90)translate(0)")
				.attr("dy","2.5em")
				.attr("text-anchor", "middle")
				.style("fill","#000")
				.attr("wrapped","1")
				.call(wrap, 80);
		  }
	  });

	  var nodeExit = node.exit().transition()
		  .duration(duration)
		  .remove();
	
	  nodeExit.select("circle")
		  .attr("r", 1e-6);
	
	  nodeExit.select("text")
		  .style("fill-opacity", 1e-6);
		  
	  // Update the links…
	  var link = svg.selectAll("path.link")
		  .data(links, function(d) { return d.target.id; });
	
	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g")
		  .attr("class", "link")
		  .attr("d", function(d) {
			var o = {x: source.x0, y: source.y0};
			return diagonal({source: o, target: o});
		  });
	
	  // Transition links to their new position.
	  link.transition()
		  .duration(duration)
		  .attr("d", diagonal);
	
	  // Transition exiting nodes to the parent's new position.
	  link.exit().transition()
		  .duration(duration)
		  .attr("d", function(d) {
			var o = {x: source.x, y: source.y};
			return diagonal({source: o, target: o});
		  })
		  .remove();
	
	  // Stash the old positions for transition.
	  nodes.forEach(function(d) {
		d.x0 = d.x;
		d.y0 = d.y;
	  });
	  
	  // On node hover, examine the links to see if their
		// source or target properties match the hovered node.
		// right now, the nodes are recognizing themselves as targets of the links, but only the root recognizes itself as a source node
		nodeEnter.on('mouseover', function(d) {
		  link.style('stroke-width', function(l) {
			if (d === l.source || d === l.target)
			  return 4;
			else
			  return 2;
			});
		  link.style('stroke', function(l) {
			if (d === l.source || d === l.target) 
				return 'steelblue';
			else 
				return '#ccc';
			});
		});
		
		// Set the stroke width back to normal when mouse leaves the node.
		nodeEnter.on('mouseout', function() {
		  link.style('stroke-width', 2);
		  link.style('stroke', '#ccc');
		});
		
		function wrap(text, width) {
			text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/[_]+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
			  line.push(word);
			  tspan.text(line.join(" "));
			  if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
			  }
			}
		  });
		}
		
		function computeTextLength(theText) {
			var tspan=d3.selectAll("text").append("tspan").text(theText);
			var value=tspan.node().getComputedTextLength();
			tspan.remove();
			return value;
		}
		
		// this function ends the current viewer and launches an instance of singleNodeView with the selected node as the root
		function clickLabel() {
			// first grab this node
			var thisNodeName=d3.select(this).text();
			// initialize the final dataset
			var completedData={};
			// initialize a json object with this node as the root
			var tempData = { "name":thisNodeName , "children": [] };
			// next, grab each node that this node is connected with and add them to the json object as children
			d3.select(this).call(function(d) {
				//find the entry in the tree that has thisNodeName (search up to depth =1)
				//note that this current method only works if all term or gene names are unique (up to depth=1). 
					// If they are not, I will neet to groom this json object to remove duplicate entries (that have the same parent)
				if ("children" in nodes[0]) {
					if (nodes[0].children!=null) {
						for (var j=0;j<nodes[0].children.length;j++) {
							if (d.text()===nodes[0].children[j].name) {
								//create json objects out of this nodes' children and parent
								if ("children" in nodes[0].children[j]) {
									if (nodes[0].children[j].children!=null) {
										for (var k=0; k<nodes[0].children[j].children.length;k++) {
											var newChild = { "name":nodes[0].children[j].children[k].name , "children":[] };
											tempData.children.push(newChild);
										}
									}
								}
								if ("_children" in nodes[0].children[j]) {
									if (nodes[0].children[j]._children!=null) {
										for (var k=0; k<nodes[0].children[j]._children.length;k++) {
											var newChild = { "name":nodes[0].children[j]._children[k].name , "children":[] };
											tempData.children.push(newChild);
										}
									}
								}
								// now add the parent node as a child of this node so that the clicked node gets centered on the graph
								var parentNode = { "name":nodes[0].children[j].parent.name , "children": [] };
								tempData.children.push(parentNode);
							}
						}
					}
				}
				if ("_children" in nodes[0]) {
					if (nodes[0]._children!=null) {
						for (var j=0;j<nodes[0]._children.length;j++) {
							if (d.text() === nodes[0]._children[j].name) {
								//create json objects out of this nodes' children and parent
								// I am relatively certain that this next statement will always be false, but might as well cover all of my bases
								if ("children" in nodes[0]._children[j]) {
									if (nodes[0]._children[j].children!=null) {
										for (var k=0; k<nodes[0]._children[j].children.length;k++) {
											var newChild = { "name":nodes[0]._children[j].children[k].name , "children":[] };
											tempData.children.push(newChild);
										}
									}
								}
								if ("_children" in nodes[0]._children[j]) {
									if (nodes[0]._children[j]._children!=null) {
										for (var k=0; k<nodes[0]._children[j]._children.length;k++) {
											var newChild = { "name":nodes[0]._children[j]._children[k].name , "children":[] };
											tempData.children.push(newChild);
										}
									}
								}
								// now add the parent node as a child of this node so that the clicked node gets centered on the graph
								var parentNode = { "name":nodes[0]._children[j].parent.name , "children": [] };
								tempData.children.push(parentNode);
							}
						}
					}
				}
				// now determine whether the new root node is a gene or a term and pass the tempData object to the appropriate function to complete the dataset
				var classification="";
				for (var i=0;i<referenceTerms.length;i++) {
					if (referenceTerms[i][0]===tempData.name) {
						classification="gene";
					}
					if (referenceTerms[i][2]===tempData.name) {
						classification="term";
					}
				}
				if (classification==="gene") {
					completedData=fillOutDataGene(tempData,referenceTerms);
				}
				if (classification==="term") {
					completedData=fillOutDataTerm(tempData,referenceTerms);
				}
				return 
			});
			var totalPotentialNodes=completedData.children.length;
			for (var i=0; i<completedData.children.length;i++) {
				totalPotentialNodes=totalPotentialNodes + completedData.children[i].children.length;
			}
			// finally, delete the current SVG canvas and build a new one with our new root node
			// adjust the size of the new canvas if this new root node has a lot of children
			if (completedData.children.length>160) {
				var newDiameter = completedData.children.length*15; // here the magic number is just an optimizing value -- feel free to change it
				d3.selectAll("svg").remove().call(function() {singleNodeView(completedData, interactionTerms, referenceTerms, originalGenes, newDiameter);});
			}
			else if (totalPotentialNodes>200) {
				var newDiameter= totalPotentialNodes*9;
				d3.selectAll("svg").remove().call(function() {singleNodeView(completedData, interactionTerms, referenceTerms, originalGenes, newDiameter);});
			}
			else {
				d3.selectAll("svg").remove().call(function() {singleNodeView(completedData, interactionTerms, referenceTerms, originalGenes);});

			}
		}
		
	}
	
	// Toggle children on click.
	function clickNode(d) {
	  if (d.children) {
		d._children = d.children;
		d.children = null;
	  } else {
		d.children = d._children;
		d._children = null;
	  }
	  
	  update(d);
	}
	
	function contextClick() {
		var data=fillOutInteractionData(originalGenes,interactionTerms);
		d3.selectAll("svg").remove().call(function() {interactions(data, interactionTerms,referenceTerms,originalGenes);});
	}
	
	function isAnOriginalGene(name) {
		for (var i=0; i<originalGenes.length; i++) {
			if (name==originalGenes[i].name) {
				return true;
			}
		}
		return false;
	}
	
	function getGroupID(name) {
		for (var i=0; i<originalGenes.length; i++) {
			if (name==originalGenes[i].name) {
				return originalGenes[i].groupID;
			}
		}
		return -1;
	}
	
	
	
	// Collapse nodes
	function collapse(d) {
	  if (d.children) {
		  d._children = d.children;
		  d._children.forEach(collapse);
		  d.children = null;
		}
	}
}