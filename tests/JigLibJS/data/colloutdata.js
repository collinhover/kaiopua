(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var RigidBody=jigLib.RigidBody;
	
	var CollOutData=function(frac, position, normal){
		if(frac==undefined)frac=0;
		
		this.frac = frac;
		this.position = position ? position : [0,0,0];
		this.normal = normal ? normal : [0,0,0];
	};
	
	jigLib.CollOutData=CollOutData;

})(jigLib);	
	