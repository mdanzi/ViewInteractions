// this function removes the terms that have more connections than your specified limit (expressed as a percentage of the total set)
function filterReferenceTerms(referenceTerms,limit) {
	var terms = referenceTerms
	var shrunkTerms=[];
	var thisTerm="";
	var thisTermCount=0;
	var lastTerm="";
	var termStartIndex=0;
	var termEndIndex=0;
	var threshold = Math.floor(limit*terms.length);
	for (var i=0;i<terms.length;i++) {
		thisTerm=terms[i][2];
		if (thisTerm===lastTerm) {
			thisTermCount=thisTermCount+1;
		}
		else {
			// we have moved on to a new term
			termEndIndex=i-1;
			if (thisTermCount<threshold) {
				for (var j=termStartIndex;j<=termEndIndex;j++) {
					shrunkTerms.push(terms[j]);
				}
			}
			//reset parameters for the new term
			thisTermCount=0;
			termStartIndex=i;
		}
		//update for start of next round
		lastTerm=thisTerm;
	}
	return shrunkTerms;
}