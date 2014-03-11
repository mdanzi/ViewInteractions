function pathway(input,referenceTerms,w,h) {
	var dataset = input;
	var size = 100;

	//Initialize a default force layout, using the nodes and edges in dataset
	var force = d3.layout.force()
						 .gravity(0.8)
						 .size([w, h]);
						 

	var colors = d3.scale.category10();

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
		.nodes(dataset.nodes)
		.links(dataset.edges)
		.charge([-1000])
		.start();
	
	var rectangle = d3.superformula()
	   .type("longRectangle")
	   .size(3000)
	   .segments(360);
	   
	var circle = d3.superformula()
		.type("circle")
		.size(100)
		.segments(360);
	
	//Create edges as lines
	var edges = svg.selectAll("line")
		.data(dataset.edges)
		.enter()
		.append("line")
		.style("stroke", "#ccc")
		.style("stroke-width", 2);
	
	var nodeGroup = svg.selectAll("g")
		  .data(dataset.nodes)
		  .enter()
		  .append("g")
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
	var sourceNodes = nodeGroup.selectAll("[class=sourceNode]")
		.style("fill", "lightblue")
		.style("stroke","steelblue")
		.attr("stroke-width","3px")
		.call(force.drag);
	
	//Adjust circular target nodes
	var targetNodes = nodeGroup.selectAll("[class=targetNode]")
		.style("fill", "white")
		.style("stroke", "steelblue")
		.attr("stroke-width","2px")
		.call(force.drag);
		
	
	
	
		
	
	
	//Every time the simulation "ticks", this will be called
	force.on("tick", function() {

		//Update positions of all edges
		edges.attr("x1", function(d) { return d.source.x; })
			 .attr("y1", function(d) { return d.source.y; })
			 .attr("x2", function(d) { return d.target.x; })
			 .attr("y2", function(d) { return d.target.y; });
		
		//Update positions of all nodes and their labels		
		nodeGroup.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")"; });

	});
	
	
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
		d3.select(this).select("title").call(function(d) {
			edges.each(function(l) {
				if (d.text()===l.source.name) {
					var newChild = {"name":l.target.name , "children":[]};
					return tempData.children.push(newChild);
				}
				else if (d.text()===l.target.name) {
					var newChild = {"name":l.source.name , "children":[]};
					return tempData.children.push(newChild);							
				}
			});
		});
		// now pss the tempData object to the fillOutData function which will add in missing children and grandchildren that were not present in the 
			// force-directed graph view
		var completedData={};
		if (d3.select(this).select("path").attr("class")==="sourceNode") {
			completedData=fillOutDataGene(tempData,referenceTerms);
		}
		if (d3.select(this).select("path").attr("class")==="targetNode") {
			completedData=fillOutDataTerm(tempData,referenceTerms);
		}
		// finally, delete the svg and pass the json object to the single node view
		if (completedData.children.length>160) {
			var newDiameter = completedData.children.length*10; // here the magic number is just an optimizing value -- feel free to change it
			d3.selectAll("svg").remove().call(function() {singleNodeView(completedData, referenceTerms, newDiameter);});
		}
		else {
			d3.selectAll("svg").remove().call(function() {singleNodeView(completedData, referenceTerms);});
		}
	}
}
		
		
		
		
		
		
		
		
		
		
		