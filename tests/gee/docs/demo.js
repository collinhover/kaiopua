function demo(g) {

	var signs = [];
	var topSigns = [];
	
	g.ctx.font = '15px Croog-Bold, sans-serif';
	
	var line = function(ctx, x1, y1, x2, y2) {
		
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}
	
	g.draw = function() {
	
		g.ctx.clearRect(0, 0, g.width, g.height);
		
		g.ctx.shadowColor = '#fff';
		g.ctx.shadowBlur = 0;
		g.ctx.shadowOffsetY = 1;
		g.ctx.shadowOffsetX = 1;
		
		g.ctx.textAlign = 'left';
		g.ctx.fillStyle = '#666';
		
		if (false) {
			g.ctx.fillText('g.keyPressed: ' + g.keyPressed, 30, 40);
			g.ctx.fillText('g.mousePressed: ' + g.mousePressed, 30, 60);
			g.ctx.fillText('g.frameRate: ' + g.frameRate, 30, 80);
			g.ctx.fillText('g.frameTime: ' + g.frameTime, 30, 100);
			g.ctx.fillText('g.frameCount: ' + g.frameCount, 30, 120);
		}
		
		if (false) {
			
			var p = 6;
			var h2 = Math.round(g.height/2)+0.5;
			var w2 = Math.round(g.width/2)+0.5;
			
			g.ctx.fillStyle = '#bbb';		
			g.ctx.font = 'italic 12px Georgia, serif';
			g.ctx.textAlign = 'center';
			g.ctx.fillText('g.width: ' + g.width, g.width*3/4.0, h2+3);
			g.ctx.fillText('g.height: ' + g.height, w2, g.height*3.0/4+4);
			
			g.ctx.strokeStyle = '#ddd';
			
			g.ctx.shadowOffsetY = 0;
			g.ctx.shadowOffsetX = 0;
			
			line(g.ctx, p, h2, g.width*3/4-45, h2);
			line(g.ctx, g.width*3/4+45, h2, g.width-p, h2);
			
			line(g.ctx, w2, p, w2, g.height*3/4-15);
			line(g.ctx, w2, g.height*3/4+15, w2, g.height-p);
			
		}
		
		for (var i = 0; i < signs.length; i++) {
			signs[i].update();
		}
		for (var i = 0; i < signs.length; i++) {
			signs[i].draw(g.ctx);
		}
		for (var i = 0; i < topSigns.length; i++) {
			topSigns[i].update();
		}
		for (var i = 0; i < topSigns.length; i++) {
			topSigns[i].draw(g.ctx);
		}
	};
	
	
	g.mousedrag = function() {
		var s = new Sign(signs, 'g.mousedrag()', g.mouseX, g.mouseY, 1);
		s.boxColor = '#333';
		s.fontColor = '#fff';

	}
	g.mousemove = function() {
		var s = new Sign(signs, 'g.mousemove()', g.mouseX, g.mouseY, 1);
		
	}
	g.mouseup = function() {
		var s = new Sign(topSigns, 'g.mouseup()', g.mouseX, g.mouseY, 1.5);
		s.liftVel = 7+Math.random()*3;
		s.boxColor = '#e61d5f';
		s.fontColor = '#fff';
	}
	
	g.mousedown = function() {
		var s = new Sign(topSigns, 'g.mousedown()', g.mouseX, g.mouseY, 1.5);
		s.liftVel = 20+Math.random()*1;
		s.boxColor = '#00aeff';
		s.fontColor = '#fff';
	}
	
	g.keydown = function() {
		
		new Ball(topSigns, g.keyCode);

	}
	
	var Ball = function(arr, str) {
		
		var acc = 0.2;
		var radius = 60;
		var yvel = (-15 - Math.random()*18)*9.5;
		var xvel = (Math.random()*3 - 2)*6;
		var x = Math.random()*(g.width*3/4.0) + g.width/8.0;
		var y = g.height;
		var drag = 0.6;
		var ss = Math.random()*0.2 + 0.5;
		var r = 0;
		var age = 0;
		var deathAge = 45;
		var deathLength = 3 + parseInt(Math.random()*5);
		var rs = (Math.random()*0.01-0.005);
		this.update = function() { 	
			yvel += acc;
			yvel *= drag;
			xvel *= drag;
			x += xvel;
			y += yvel;
			r += rs;
			if (age > deathAge) {
				this.die();
				this.return;
			}
		}
		this.die = function(c) {
			arr.splice(arr.indexOf(this), 1);
		}
		this.draw = function(c) {
			c.fillStyle = '#0fa954';
			c.save();
			c.globalAlpha = 0.9;
			c.translate(x, y);
			if (age > deathAge - deathLength) {
				var s = age - (deathAge - deathLength);
				s = (deathLength-s)/deathLength;
				s = Math.sqrt(s);
				if (ss*s <= 0) {
					c.restore();
					return;
				}
				c.scale(ss*s, ss*s);
			} else { 
				if (ss <= 0) {
					c.restore();
					return;
				}
				c.scale(ss, ss);
			}
			c.rotate(r);
			c.shadowBlur = 0;		
			c.shadowColor = 'rgba(0,0,0,0)';
			c.shadowOffsetY = 0;
			c.shadowOffsetX = 0;
			c.beginPath()
			c.arc(0, 0, radius, 0, Math.PI*2, false);
			c.fill();
			c.fillStyle = '#fff';			
			c.font = '60px Croog-Bold, sans-serif';
			c.textAlign = 'center';
			c.globalAlpha = 1;
			c.fillText(str, 0, 20);
			c.restore();
			age++;
		}
		arr.push(this);
	}
	
	var Sign = function(arr, str, x, y, ss) {
		var ss = ss || 1;
		var spikeWidth = 8;
		var spikeHeight = 6;
		var boxWidth = 60;
		var boxHeight = 30;
		var arr = arr;
		this.boxColor = '#fff';
		this.fontColor = '#333';
		var r = Math.random()*Math.PI/4 - Math.PI/8;
		var age = 0;
		var deathAge = 45;
		this.liftVel = Math.random()*7 + 1;
		var drag = 0.5 + Math.random()*0.33;
		var lift = 0;
		var grav = 0.00;
		var oggrav = 0.02;
		var xv = g.mouseX - g.pmouseX;
		var yv = g.mouseY - g.pmouseY;
		xv *= 1.3;
		yv *= 1.3;
		var deathLength = 3 + parseInt(Math.random()*5);
		this.die = function() {
			arr.splice(arr.indexOf(this), 1);
		}
		this.update = function() {
		
			if (age > deathAge) {
				this.die();
				this.return;
			}
			
		}
		this.draw = function(c) {
			
			c.save();
			c.translate(Math.round(x-xv), Math.round(y-yv));
			
			xv *= drag;
			yv *= drag;
			
			
			c.rotate(r);

			lift -= this.liftVel
			this.liftVel *= drag;
			this.liftVel -= grav;
			
			
			c.translate(0, lift);
			c.scale(ss, ss);
			
			if (age > deathAge - deathLength) {
				var s = age - (deathAge - deathLength);
				s = (deathLength-s)/deathLength;
				s = Math.sqrt(s);
				c.scale(s, s);
			} else { 
				c.scale(1, 1);
			}
			
			g.ctx.fillStyle = this.boxColor;
			
			c.shadowBlur = 2;
			c.shadowOffsetY = 2;
			c.shadowOffsetY = 2;
			c.shadowColor = 'rgba(0,0,0,0.1)';
			c.beginPath();
			c.moveTo(0, 0);
			c.lineTo(- spikeWidth/2, -spikeHeight);
			c.lineTo(- boxWidth, -spikeHeight);
			c.lineTo(- boxWidth, -spikeHeight-boxHeight);
			c.lineTo(  boxWidth, -spikeHeight-boxHeight);
			c.lineTo(  boxWidth, -spikeHeight);
			c.lineTo(  spikeWidth/2, -spikeHeight);
			c.fill();
			
			c.font = '11px Croog-Bold, sans-serif';
			c.shadowColor = 'rgba(0,0,0,0)';
			c.shadowBlur = 0;
			c.fillStyle = this.fontColor;
			c.textAlign = 'center';
			c.fillText(str, 0, -spikeHeight-boxHeight/2+3);
			age++;
			c.restore();
		}
		
		arr.push(this);
		
	}
	
}