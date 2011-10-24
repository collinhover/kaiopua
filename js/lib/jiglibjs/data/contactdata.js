(function(jigLib){
	/**
	 * @author katopz
	 * 
	 * @name ContactData
	 * @class ContactData stores information about a contact between 2 objects
	 * @property {BodyPair} pair
	 * @property {CachedImpulse} impulse
	 * @constructor
	 **/
	var ContactData=function(){};
	ContactData.prototype.pair=null;
	ContactData.prototype.impulse=null;
	
	jigLib.ContactData=ContactData;
})(jigLib);

