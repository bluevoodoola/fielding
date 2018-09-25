/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

// prints "hi" in the browser's dev tools console
console.log('hi');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var WING_SIZE = 7;
var NUM_HUBS = 6;
var TIME_INTERVAL = 500;
var field_count = 0;

var two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

class Portal {
  constructor(x, y, faction) {
    this.x = x;
    this.y = y;
    this.radius = 6;
    this.opacity = 1.0;
    this.faction = faction ? faction : 'RES';
    if ( this.faction == 'RES' ) {
      this.fill = 'mediumblue';
    }
    else if ( this.faction == 'ENL' ) {
      this.fill = 'green';
    }
    else {
      this.fill = 'grey';
    }
  }
  
	Anchor() {
  	return new Two.Anchor(this.x, this.y);
  }  
  
  Dot() {
    if ( this.faction == 'RES' ) {
      this.fill = 'mediumblue';
    }
    else if ( this.faction == 'ENL' ) {
      this.fill = 'green';
    }
    else {
      this.fill = 'grey';
    }
    var dot = two.makeCircle(this.x, this.y, this.radius);
    dot.opacity = this.opacity;
    dot.fill = this.fill;
    return dot;
  }
}

class Link {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }
  
	Line() {
    var line = two.makePath([this.p1.Anchor(), this.p2.Anchor()], true);
    this.linewidth = 5;
    this.opacity = 0.1;

  	return line;
  }  
}

class Field {
	constructor(p1, p2, p3, fill) {
  	this.anchors = [p1, p2, p3];
    this.linewidth = 3;
    this.opacity = 0.1;
    if ( fill ) {
      this.fill = fill;
    }
    else {
      this.fill = 'blue';
    }
  }
  
  Triangle() {
  	var triangle = two.makePath([this.anchors[0].Anchor(), this.anchors[1].Anchor(), this.anchors[2].Anchor()], false);
    triangle.linewidth = this.linewidth;
    triangle.fill = this.fill;
    triangle.opacity = this.opacity;
    
    var grp = two.makeGroup(triangle);
    grp.translation.set(two.width / 2, two.height / 2);
    return grp;
  }
}

class Frame {
  constructor(obj, caption) {
    this.caption = caption ? caption : 'NO CAPTION' ;
    this.objects = new Array();
    if (obj instanceof Frame) {
      for ( var lp = 0 ; lp < obj.objects.length ; lp++ ) {
        this.add(obj.objects[lp]);
      }
    }
    else if (obj) {
      this.add(obj);
    }
  }
  
  add(obj) {
    if (obj) {
      obj.visible = false;
      this.objects.push(obj);
    }
    return this;
  }
  
  show() {
    if ( this.caption ) {
      var grp = two.makeGroup(new Two.Text(this.caption, 100, 50));
      grp.translation.set(two.width / 2, two.height / 2);
      this.add(grp);
    }
    for ( var lp = 0 ; lp < this.objects.length ; lp++ ) {
      this.objects[lp].visible = true;
    }
    return this;
  }
  
  hide() {
    for ( var lp = 0 ; lp < this.objects.length ; lp++ ) {
      this.objects[lp].visible = false;
    }
    return this;
  }
  
  extend(obj, caption) {
    return (new Frame(this, caption)).add(obj);
  }
}

function makeAxes() {
  var x_min = { x: -200 };
  var x_max = { x: 200 };
  var y_min = { y: -200 };
  var y_max = { y: 200 };
  var x_axis = two.makePath([new Two.Anchor(x_min.x, x_min.y), new Two.Anchor(x_max.x, x_max.y)], true);
  var y_axis = two.makePath([new Two.Anchor(y_min.x, y_min.y), new Two.Anchor(y_max.x, y_max.y)], true);
  x_axis.stroke = "red";
  y_axis.stroke = "red";
  x_axis.linewidth = 2;
  y_axis.linewidth = 2;
  var axes = two.makeGroup(x_axis, y_axis);
  axes.translation.set(two.width / 2, two.height / 2);
  return axes;
}

function makePortals() {
  var dots = new Array();
  dots.push(anchor1.Dot());

  for (var lp = 0; lp < wings.length ; lp++) {
    dots.push(wings[lp].Dot());
  }
  var grp = two.makeGroup(dots);
  grp.translation.set(two.width / 2, two.height / 2);
  
  return grp;
}

function makeHubs(currentPortal) {
  var dots = new Array();
  for (var lp = 0; lp < hubs.length ; lp++) {
    if ( lp == currentPortal ) {
      hubs[lp].faction = 'RES';
    }
    else if ( lp == currentPortal - 1 ) {
      hubs[lp].faction = 'ENL';
    }
    dots.push(hubs[lp].Dot());
  }
  var grp = two.makeGroup(dots);
  grp.translation.set(two.width / 2, two.height / 2);
  
  return grp;
}

var anchor1 = new Portal(-70, 0);
var wings = new Array(WING_SIZE);
for (var lp = 0; lp < WING_SIZE ; lp++) {
  wings[lp] = new Portal(0, -400 + lp * 50);
}
var hubs = new Array();
for ( var jLp = 0; jLp < 2 ; jLp++ ) {
  for (var lp = 0; lp < NUM_HUBS / 2 ; lp++) {
    hubs.push(new Portal(100 + lp * 20 + jLp * 10, 10 + jLp * 20));
  }
}

// makeAxes();

var Frames = new Array();
Frames.last = function() { return this[this.length - 1]; }
Frames.extend = function(obj, caption) { this.push(this.last().extend(obj, caption)); }

var frmPortals = new Frame(makePortals(), 'SET UP WINGS')
Frames.push(frmPortals);
for ( var lp = WING_SIZE - 1 ; lp > 0 ; lp-- ) {
  field_count++;
  Frames.extend(new Field(anchor1, wings[lp], wings[lp - 1]).Triangle(), 'FIELD COUNT:' + field_count);
}

var setup = Frames.last(); // Save the field setup

for ( var jLp = 0 ; jLp < NUM_HUBS ; jLp++ ) {
  Frames.push(setup.extend(makeHubs(jLp), 'BUILD HUB'));
  for ( var lp = 0 ; lp < WING_SIZE ; lp++ ) {
    var frmHighlight = new Frame(Frames.last());
    frmHighlight.add(new Field(anchor1, wings[lp], hubs[jLp], 'red').Triangle());
    field_count++;
    if ( lp > 0 ) {
      frmHighlight.add(new Field(wings[lp - 1], wings[lp], hubs[jLp], 'red').Triangle());
      field_count++;
    }
    var frm = new Frame(Frames.last());
    frm.add(new Field(anchor1, wings[lp], hubs[jLp]).Triangle());
    if ( lp > 0 ) {
      frm.add(new Field(wings[lp - 1], wings[lp], hubs[jLp]).Triangle());
    }
    frmHighlight.caption = 'FIELD COUNT:' + field_count;
    frm.caption = 'FIELD COUNT:' + field_count;
    Frames.push(frmHighlight);
    Frames.push(frm);
  }
  Frames.push(setup.extend(makeHubs(jLp + 1), 'JARVIS HUB'));
}

Frames.push(setup);

for ( var jLp = 0 ; jLp < NUM_HUBS ; jLp++ ) {
  for ( var lp = 0 ; lp < WING_SIZE ; lp++ ) {
    if ( lp == 0 ) {
      Frames.push(setup.extend(makeHubs(jLp)));
    }
    var frmHighlight = new Frame(Frames.last());
    frmHighlight.add(new Field(hubs[jLp], wings[WING_SIZE - lp - 1], anchor1, 'red').Triangle());
    var frm = new Frame(Frames.last());
    frm.add(new Field(hubs[jLp], wings[WING_SIZE - lp - 1], anchor1).Triangle());
    field_count++;
    frmHighlight.caption = 'FIELD COUNT:' + field_count;
    frm.caption = 'FIELD COUNT:' + field_count;
    Frames.push(frmHighlight);
    Frames.push(frm);
  }
}

async function demo() {
  two.update();
  await sleep(TIME_INTERVAL);
  for (var lp = 0 ; lp < Frames.length ; lp++) {
    Frames[lp].show();
    two.update();
    await sleep(TIME_INTERVAL);
    Frames[lp].hide();
    two.update();
  }
  Frames.last().show();
  two.update();
}

demo();
