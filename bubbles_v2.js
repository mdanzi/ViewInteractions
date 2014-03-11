function bubbles(data, interactionTerms, referenceTerms) {		
	var w = 2400,
		h = 2000;
		threshold=2;
	var originalGenes=data;
	var binnedData=bins(data,referenceTerms);
	var filteredBinnedData=filterBinnedData(binnedData,threshold);
	
			
	var nodes = filteredBinnedData.map(function(d) { return {radius: d.value*20, name: d.termName, weight: d.value*10}; }),
		color = d3.scale.category10();

	var force = d3.layout.force()
		.gravity(0.1)
		.charge(function(d, i) { return i ? 0 : -2000; })
		.nodes(nodes)
		.size([w, h]);
	
	var root = nodes[0];
	root.radius = 0;
	root.fixed = true;
	
			
	var svg = d3.select("#body").append("svg:svg")
		.attr("width", w)
		.attr("height", h);
		
	var windowHeight = window.innerHeight;
	var windowWidth = window.innerWidth;
	var halfWidth = w/2;
	var halfHeight = h/2;
	var halfWindowHeight = windowHeight/2;
	var halfWindowWidth= windowWidth/2;
	window.scrollTo((halfWidth-halfWindowWidth),(halfHeight-halfWindowHeight));
	
	
	var gNodes = svg.selectAll("g")
	.data(nodes.slice(1))
	.enter()
	.append("g")
	.attr("class","node")
	.call(force.drag);
	
	
	gNodes.append("circle")
		.attr("r", function(d) { return d.radius; })
		.style("fill", function(d, i) { return color(i); })
		.style("stroke", function(d,i) { return color(i); });
		
	gNodes.append("title")
		.text(function(d) { return d.name; });
		
	gNodes.append("text")
		.style("font-size","14px")
		.text(function(d) {
			if (d.radius>=(computeTextLength(d.name)/4)) {
				return d.name;
			}
			else {
				return null;
			};
		})
		//.style("fill-opacity","1")
		.attr("dy","0.5em")
		.attr("text-anchor", "start");
		
	var textNodes = gNodes.selectAll("text")
		.filter(function(d) {
			return d.radius>=(computeTextLength(d.name)/4);
		})
		.call(wrap,60);				
			
	force.start();
	
	force.on("tick", function(e) {
	  var q = d3.geom.quadtree(nodes),
		  i = 0,
		  n = nodes.length;
	
	  while (++i < n) {
		q.visit(collide(nodes[i]));
	  }

	  svg.selectAll("circle")
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; });
		  
	  svg.selectAll("text")
		  .attr("x", function(d) { return d.x-(2*d.radius/3); })
		  .attr("y", function(d) { return d.y-(d.radius/2); });
			
	});
	
	gNodes.on("contextmenu", function(d) {
		var thisBubbleName=d3.select(this).select("title").text();
		var tempData = { "name":thisBubbleName , "children": [] };
		var completedData=fillOutDataTerm(tempData,referenceTerms);
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
	});
	
	function wrap(text, width) {
		text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/[_,-]+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.1, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em"),
			prevLineWidth=0,
			halfPrevLineWidth=0;
		console.log("text total length = " + text.node().getComputedTextLength());
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  console.log("line width = " + tspan.node().getComputedTextLength());
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			prevLineWidth=tspan.node().getComputedTextLength();
			line = [word];
			console.log("prevLineWidth = " + prevLineWidth);
			tspan = text.append("tspan").attr("x", x).attr("dx",0-prevLineWidth).attr("y", y).attr("dy", lineHeight  + dy + "em").text(word);
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
		
		// Returns a list of terms associated with our genes and how many times each term was connected to one of our genes
		function bins(data, referenceTerms) {
		  var output = [];
		  output.push({termName: root, value: 0});
		  for (var i=0; i<data.length; i++) {
			  for (var j=0; j<referenceTerms.length; j++) {
				  if (data[i].name===referenceTerms[j][0]) {
					  // now that we have found a term belonging to one of our datapoints, see if we have already encountered it
					  var alreadySeen=0;
					  for (var k=0; k<output.length; k++) {
						  if (referenceTerms[j][2]===output[k].termName) {
							  output[k].value = output[k].value+1;
							  alreadySeen=1;
						  }
					  }
					  if (alreadySeen==0) {
						  output.push({termName: referenceTerms[j][2], value: 1});
					  }
				  }
			  }
		  }
		  return output;
		}
		
		
		function filterBinnedData(binnedData, threshold) {
			var filteredBinnedData=[binnedData[0]];
			for (var i=1; i<binnedData.length; i++) {
				if (binnedData[i].value>threshold) {
					filteredBinnedData.push(binnedData[i]);
				}
			}
			return filteredBinnedData;
		}
		
		d3.select(self.frameElement).style("height", w + "px");
		
}