function interactions(input,interactionTerms,referenceTerms,originalGenes) {
	console.log(input);
	var dataset = input;
	var nodes=dataset.nodes;
	var w=2000;
	var h=2000;
	if (nodes.length>500) {
		w=4*nodes.length;
		h=4*nodes.length;
	}
	var size = 100;

	//Initialize a default force layout, using the nodes and edges in dataset
	var force = d3.layout.force()
						 .gravity(0.8)
						 .size([w, h]);
						 
	var maxEdgeCount = 0;
	for (var i=0;i<nodes.length;i++) {
		if (nodes[i].class==="targetNode") {
			if (nodes[i].edgeCount>maxEdgeCount) {
				maxEdgeCount=nodes[i].edgeCount;
			}
		}
	}
	
	// determine how many foci we need and evenly distribute them throughout the force graph
	var numberOfGroups=0;
	for (var i=0;i<originalGenes.length;i++) {
		if (originalGenes[i].groupID>numberOfGroups) {
			numberOfGroups=originalGenes[i].groupID;
		}
	}
	numberOfGroups=numberOfGroups+1;
	
	var foci=createFoci(numberOfGroups,w,h);
	


	// if maxEdgeCount<6, then there may be errors here. I could implement a different color scale for that case or just turn it off.
	console.log(maxEdgeCount);
	var colors = d3.scale.linear()
		.domain([1,maxEdgeCount])
		.range(["#ffffff","#000000"]);
		
	var groupColors = d3.scale.category20();
 	
	//Create SVG element
	var svg = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h);
				
	var windowHeight = window.innerHeight;
	var windowWidth = window.innerWidth;
	var halfWidth = w/2;
	var halfHeight = h/2;
	var halfWindowHeight = windowHeight/2;
	var halfWindowWidth= windowWidth/2;
	window.scrollTo((halfWidth-halfWindowWidth),(halfHeight-halfWindowHeight));
	
	
	force
		.nodes(nodes)
		.links(dataset.edges)
		.charge([-1000])
		.start();
	
	var rectangle = d3.superformula()
	   .type("longRectangle")
	   .size(3000)
	   .segments(360);
	   
	var circle = d3.superformula()
		.type("circle")
		.size(150)
		.segments(360);
	
	//Create edges as lines
	var edges = svg.selectAll("line")
		.data(dataset.edges)
		.enter()
		.append("line")
		.style("stroke", "#ccc")
		.style("stroke-width", 2);
	
	var nodeGroup = svg.selectAll("g")
		  .data(nodes)
		  .enter()
		  .append("g")
		  .on("contextmenu", contextClickNode)
		  .on("click", clickNode);
		  
	nodeGroup
		  .append("path")
		  .attr("class", function(d) {return d.class;})
		  .attr("d", function(d) { 
			if(d.shape=="rectangle")
				{return rectangle(d)}
			else if (d.shape=="circle")
				{return circle(d)}
		  });
	
	// label the nodes: source nodes get the text written on them directly, target nodes only show their label on hover
	nodeGroup
		  .append("svg:title")						  				  
		  .text(function(d) {
				return d.name;
			});
	var sourceNodes = nodeGroup.filter(function(d,i) {return d.class == 'sourceNode'});
	
	sourceNodes.append("text")
		  .text(function(d) {
			  return d.name;
		  })
		  .attr("text-anchor", "middle")
		  .attr("x", function(d, i) {
				return 0;  //doesn't need to be shifted because we used text-anchor middle
		  })
		  .attr("y", function(d) {
				return 5;  //this needs to be half of the size of font-size specified below
		  })
		  .attr("font-family", "sans-serif")
		  .attr("font-size", "10px")
		  .attr("fill", "black");
	
	//Adjust rectangular source nodes
	sourceNodes.selectAll("path")
		.style("stroke","steelblue")
		.attr("stroke-width","3px")
		.attr("groupID",function(d) { return d.groupID;})
		.style("fill",function(d) { return groupColors(d.groupID+2);})
		.call(force.drag);
	
	//Adjust circular target nodes
	var targetNodes = nodeGroup.selectAll("[class=targetNode]")
		.style("fill", function(d) {return colors(d.edgeCount);})
		.style("stroke", "steelblue")
		.attr("stroke-width","2px")
		.call(force.drag);
		
	
	
	
		
	
	
	//Every time the simulation "ticks", this will be called
	force.on("tick", function(e) {

		if (numberOfGroups>1) {
			// this block is to implement the multiple foci
			var k=1*e.alpha;
			sourceNodes.each(function(o,i) {
				o.y += (foci[o.groupID].y-o.y)*k;
				o.x += (foci[o.groupID].x-o.x)*k;
			});
		}
		
		// this block is to implement the collide function so that all the nodes don't cover each other up
		var q = d3.geom.quadtree(nodes),
			i = 0,
			n = nodes.length;
		while (++i < n) {
			q.visit(collide(nodes[i]));
		}

		//Update positions of all edges
		edges.attr("x1", function(d) { return d.source.x; })
			 .attr("y1", function(d) { return d.source.y; })
			 .attr("x2", function(d) { return d.target.x; })
			 .attr("y2", function(d) { return d.target.y; });
		
		//Update positions of all nodes and their labels		
		nodeGroup.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"; });

	});
	
	
	function collide(node) {
		var r = node.radius + 16,
		  nx1 = node.x - r,
		  nx2 = node.x + r,
		  ny1 = node.y - r,
		  ny2 = node.y + r;
		return function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== node)) {
		  var x = node.x - quad.point.x,
			  y = node.y - quad.point.y,
			  l = Math.sqrt(x * x + y * y),
			  r = node.radius + quad.point.radius;
		  if (l < r) {
			l = (l - r) / l * .5;
			node.x -= x *= l;
			node.y -= y *= l;
			quad.point.x += x;
			quad.point.y += y;
		  }
		}
		return x1 > nx2
			|| x2 < nx1
			|| y1 > ny2
			|| y2 < ny1;
		};
	}
	
	// On node hover, examine the links to see if their
	// source or target properties match the hovered node.
	nodeGroup.on('mouseover', function(d) {
	  edges.style('stroke-width', function(l) {
		if (d === l.source || d === l.target)
		  return 4;
		else
		  return 2;
		});
	  edges.style('stroke', function(l) {
		if (d === l.source || d === l.target) 
			return 'steelblue';
		else 
			return '#ccc';
		});
	});
	
	// Set the stroke width back to normal when mouse leaves the node.
	nodeGroup.on('mouseout', function() {
	  edges.style('stroke-width', 2);
	  edges.style('stroke', '#ccc');
	});
	
	
	// this function ends the current viewer and launches an instance of singleNodeView with the selected node as the root
	function clickNode() {
		// first grab this node
		var thisNode=d3.select(this).select("title").text();
		// initialize a json object with this node as the root
		var tempData = { "name":thisNode , "children": [] };
		// next, grab each node that this node is connected with and add them to the json object as children
		
		// now pass the tempData object to the fillOutData function which will add in missing children and grandchildren that were not present in the 
			// force-directed graph view
		var completedData={};
		completedData=fillOutDataGene(tempData,referenceTerms);
		
		var totalPotentialNodes=completedData.children.length;
		for (var i=0; i<completedData.children.length;i++) {
			totalPotentialNodes=totalPotentialNodes + completedData.children[i].children.length;
		}
		// finally, delete the svg and pass the json object to the single node view
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
	
	function contextClickNode() {
		console.log("right click registered");
		d3.selectAll("svg").remove().call(function() {bubbles(originalGenes, interactionTerms, referenceTerms);});
	}
}
		
		

	
	
		
		
		
		
		
		