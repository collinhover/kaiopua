(function(jigLib){
	
	/**
	* @author Paul Brunt
	*/
	
	var JImageTerrain=function(image, width, height, depth){
		this._img=new Image();
		this._img.src=image;
		var image=new Image();
		var that=this;
		image.onload=function(e){
			var canvas=document.createElement("canvas");
			var context = canvas.getContext('2d');
			canvas.width=this.width;
			canvas.height=this.height;
			context.drawImage(this, 0, 0);
			that._heightData=context.getImageData(0,0,this.width,this.height).data;
		};
		image.src=imageURL;
		this._height=height;
		this._width=width;
		this._depth=depth;
		this._minW=-width+width/2;
		this._maxW=width/2;
		this._minH=-height+height/2;
		this._maxH=height/2;

	};
	jigLib.extend(JImageTerrain,jigLib.ITerrain);
	JImageTerrain.prototype._img=null;
	JImageTerrain.prototype._width=null;
	JImageTerrain.prototype._height=null;
	JImageTerrain.prototype._depth=null;
	JImageTerrain.prototype._minW=null;
	JImageTerrain.prototype._minH=null;
	JImageTerrain.prototype._maxW=null;
	JImageTerrain.prototype._maxH=null;
	JImageTerrain.prototype._heightData=null;
	//Min of coordinate horizontally;
	JImageTerrain.prototype.get_minW=function(){
		return this._minW;
	};

	//Min of coordinate vertically;
	JImageTerrain.prototype.get_minH=function(){
		return this._minH;
	};

	//Max of coordinate horizontally;
	JImageTerrain.prototype.get_maxW=function(){
		return this._maxW;
	};

	//Max of coordinate vertically;
	JImageTerrain.prototype.get_maxH=function(){
		return this._maxH;
	};

	//The horizontal length of each segment;
	JImageTerrain.prototype.get_dw=function(){
		return this._width/this._img.width;
	};

	//The vertical length of each segment;
	JImageTerrain.prototype.get_dh=function(){
		return this._height/this._img.height;
	};

	//Number of segments horizontally.
	JImageTerrain.prototype.get_sw=function(){
		return this._img.width;
	};

	//Number of segments vertically
	JImageTerrain.prototype.get_sh=function(){
		return this._img.height;
	};

	//the heights of all vertices
	JImageTerrain.prototype.get_heights=function(i,j){
		if(this._heightData){
			return (this._heightData[(this._img.width*(i|0)+(j|0))*4])/255*this._depth;
		}
		else
		{
			//if image not loaded yet then return max depth so it can fall when image is finished
			return this._depth;
		}	
	};

	jigLib.JImageTerrain=JImageTerrain;
})(jigLib);