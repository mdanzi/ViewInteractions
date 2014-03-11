function createFoci(numberOfGroups,w,h) {	
	var foci=[];
	if (numberOfGroups===1) {
		foci=[{x:(w/2),y:(h/2)}];
	}
	else if (numberOfGroups===2) {
		foci=[{x:(w/4),y:(h/2)},{x:((3*w)/4),y:((h)/2)}];
	}
	else if (numberOfGroups===3) {
		foci=[{x:(w/4),y:((2*h)/3)},{x:(w/2),y:(h/3)},{x:((3*w)/4),y:((2*h)/3)}];
	}
	else if (numberOfGroups===4) {
		foci=[{x:(w/4),y:(h/4)},{x:((3*w)/4),y:(h/4)},{x:(w/4),y:((3*h)/4)},{x:((3*w)/4),y:((3*h)/4)}];
	}
	else if (numberOfGroups>4) {
		var radius=w/4;
		for (var i=0;i<numberOfGroups;i++) {
			var thisX=(w/2)+(radius*Math.cos(i*(2*Math.PI/numberOfGroups)));
			var thisY=(h/2)+(radius*Math.sin(i*(2*Math.PI/numberOfGroups)));
			foci.push({x:thisX,y:thisY});
		}
	}
	return foci;
}