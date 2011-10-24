(function(jigLib){
	var Vector3DUtil=jigLib.Vector3DUtil;
	var RigidBody=jigLib.RigidBody;
	
	var CollisionSystemGridEntry=function(collisionBody) {
		this.collisionBody = collisionBody;
		this.previous = this.next = null;
	};
	
	CollisionSystemGridEntry.prototype.collisionBody=null;
        CollisionSystemGridEntry.prototype.previous=null;
        CollisionSystemGridEntry.prototype.next=null;
        CollisionSystemGridEntry.prototype.gridIndex=0;
                
	/*
	* Removes the entry by updating its neighbours. Also zaps the prev/next
	* pointers in the entry, to help debugging
	*/
	CollisionSystemGridEntry.removeGridEntry=function(entry){
		// link the previous to the next (may be 0)
		entry.previous.next = entry.next;
		// link the next (if it exists) to the previous.
		if (entry.next != null)
			entry.next.previous = entry.previous;
		// tidy up this entry
		entry.previous = entry.next = null;
		entry.gridIndex = -2;
	};
	
	/*
	* Inserts an entry after prev, updating all links
	* @param entry prev
	*/
	CollisionSystemGridEntry.insertGridEntryAfter=function(entry, prev){
		var next = prev.next;
		prev.next = entry;
		entry.previous = prev;
		entry.next = next;
		if (next != null)
			next.previous = entry;
		entry.gridIndex = prev.gridIndex;
	}
	
	jigLib.CollisionSystemGridEntry=CollisionSystemGridEntry;

})(jigLib);	