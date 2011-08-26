(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var RigidBody=jigLib.RigidBody;
	
	var CollOutBodyData=function(frac, position, normal, rigidBody){
		if(frac==undefined) frac=0;
		this.Super(frac, position, normal);
		this.rigidBody = rigidBody;
	};
	jigLib.extend(CollOutBodyData,jigLib.CollOutData);
	
	jigLib.CollOutBodyData=CollOutBodyData;

})(jigLib);	
	