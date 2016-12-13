function GCodeParser(handlers) {
  this.handlers = handlers || {};
}

GCodeParser.prototype.parseLine = function(text, info) {
  text = text.replace(/;.*$/, '').trim();
  if (text) {
    var tokens = text.split(' ');
    if (tokens) {
      var cmd = tokens[0];
      var args = {
        'cmd': cmd
      };
      tokens.splice(1).forEach(function(token) {
        var key = token[0].toLowerCase();
        var value = parseFloat(token.substring(1));
        args[key] = value;
      });
      var handler = this.handlers[tokens[0]] || this.handlers['default'];
      if (handler) {
        return handler(args, info);
      }
    }
  }
};

GCodeParser.prototype.parse = function(gcode) {
  var lines = gcode.split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (this.parseLine(lines[i], i) === false) {
      break;
    }
  }
};

function createObjectFromGCode(gcode,ccolor) {

  var object = new THREE.Object3D();

  var geometry = new THREE.Geometry();

  var lastLine = {x:0, y:0, z:0, e:0, f:0, extruding:false};

  var parser = new GCodeParser({

    G1: function(args, line) {

      var newLine = {
        x: args.x !== undefined ? args.x : lastLine.x,
        y: args.y !== undefined ? args.y : lastLine.y,
        z: args.z !== undefined ? args.z : lastLine.z,
        e: args.e !== undefined ? args.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
      };

      newLine.extruding = (newLine.e - lastLine.e) > 0;
      var color = new THREE.Color(newLine.extruding ? ccolor : 0x0000FF);

      if (newLine.extruding) {
        geometry.vertices.push(
            new THREE.Vector3(lastLine.x, lastLine.y, lastLine.z));
        geometry.vertices.push(
            new THREE.Vector3(newLine.x, newLine.y, newLine.z));
        geometry.colors.push(color);
        geometry.colors.push(color);
      }

      lastLine = newLine;
    },

    G21: function(args) {},

    G90: function(args) {},

    G91: function(args) {},

    G92: function(args) {},

    M82: function(args) {},

    M84: function(args) {},

    'default': function(args, info) {
      console.error('Unknown command:', args.cmd, args, info);
    },
  });

  parser.parse(gcode);

  var lineMaterial = new THREE.LineBasicMaterial({
      transparent: false,
      vertexColors: THREE.VertexColors});
  object.add(new THREE.Line(geometry, lineMaterial, THREE.LinePieces));

  geometry.computeBoundingBox();
  var center = new THREE.Vector3()
      .addVectors(geometry.boundingBox.min, geometry.boundingBox.max)
      .divideScalar(2);
  var scale = 3;

  object.scale.multiplyScalar(scale);

  return object;
}


function createObjectFromGCode2(gcode,ccolor) {

  var object = new THREE.Object3D();

  var geometry = new THREE.Geometry();

  var lastLine = {x:0, y:0, z:0, e:0, f:0, extruding:false};

  var parser = new GCodeParser({

    G1: function(args, line) {

      var newLine = {
        x: args.x !== undefined ? args.x : lastLine.x,
        y: args.y !== undefined ? args.y : lastLine.y,
        z: args.z !== undefined ? args.z : lastLine.z,
        e: args.e !== undefined ? args.e : lastLine.e,
        f: args.f !== undefined ? args.f : lastLine.f,
      };

      newLine.extruding = (newLine.e - lastLine.e) > 0;
      var color = new THREE.Color(newLine.extruding ? ccolor : 0x0000FF);

      if (newLine.extruding) {
        geometry.vertices.push(
            new THREE.Vector3(lastLine.x, lastLine.y, lastLine.z));
        geometry.vertices.push(
            new THREE.Vector3(newLine.x, newLine.y, newLine.z));
        geometry.colors.push(color);
        geometry.colors.push(color);
      }

      lastLine = newLine;
    },

    G21: function(args) {},

    G90: function(args) {},

    G91: function(args) {},

    G92: function(args) {},

    M82: function(args) {},

    M84: function(args) {},

    'default': function(args, info) {
      console.error('Unknown command:', args.cmd, args, info);
    },
  });

  parser.parse(gcode);

  var lineMaterial = new THREE.LineBasicMaterial({
      opacity: .3,
      transparent: true,
      vertexColors: THREE.VertexColors});
  object.add(new THREE.Line(geometry, lineMaterial, THREE.LinePieces));

  geometry.computeBoundingBox();
  var center = new THREE.Vector3()
      .addVectors(geometry.boundingBox.min, geometry.boundingBox.max)
      .divideScalar(2);
  var scale = 3;
  object.scale.multiplyScalar(scale);

  return object;
}

function createScene(element) {

  var renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setSize(element.width(), element.height());
  element.append(renderer.domElement);
  renderer.clear();

  var scene = new THREE.Scene();

  var fov    = 30,
      aspect = element.width() / element.height(),
      near   = 1,
      far    = 10000,
      camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 800;
  camera.lookAt(scene.position);
  scene.add(camera);
  controls = new THREE.TrackballControls(camera);
  controls.noPan = true;
  controls.noZoom = true;
  controls.dynamicDampingFactor = 0.15;

  function render() {
    requestAnimationFrame(render);
    var rotSpeed = .002;
        x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

        camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
        camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);

    controls.update();
    renderer.render(scene, camera);
  }
  render();

  $(window).on('resize', function() {
    renderer.setSize(element.width(), element.height());
    camera.aspect = element.width() / element.height();
    camera.updateProjectionMatrix();
    controls.screen.width = window.innerWidth;
    controls.screen.height = window.innerHeight;
  });

  return scene;
}

function error(msg) {
  alert(msg);
}

function loadFile(path, callback /* function(contents) */) {
  $.get(path, null, callback, 'text')
    .error(function() { error() });
}

var scene = null;
var object = null;

function openGCodeFromPath(path, ccolor) {
  loadFile(path, function(gcode) {
    object = createObjectFromGCode(gcode, ccolor);
    scene.add(object);
  });
}

function openGCodeFromPath2(path, ccolor) {
  loadFile(path, function(gcode) {
    object = createObjectFromGCode2(gcode, ccolor);
    scene.add(object);
  });
}

$(function() {

  if (Modernizr.webgl && Modernizr.mq('only all and (min-width: 740px)')) {
    scene = createScene($('#renderArea'));
    openGCodeFromPath2('gcode/shell.gcode', 0xD4D4D4);
    openGCodeFromPath('gcode/base.gcode', 0xD4D4D4);
    openGCodeFromPath('gcode/fill.gcode', 0x06BCFF);
    openGCodeFromPath('gcode/fill2.gcode', 0xFF7D4A);
  } else {
    console.log('No WebGL');
    $('#renderArea').html('<img src="images/fallback.png" class="rwd-img-v">');
  }

});

