
    /*
      TODO:
      - Add info message for Firefox users
      - Add error message when browser tries to load two instances of app
      - Suppress 'component not ready' error on Firefox
      - Fix scaling issue on Opera
      - Use minified pjs source & re-test
      - Flip screenshot created horizontally
    */
    var requestScreenShot = false;
    var controls;

    // Real dimensions of the video element. Can't go too high
    // since the performance would suffer.
    var WIDTH = 200;
    var HEIGHT = 200;

    var getEl = function(id){
      return document.getElementById(id);
    }

    var createEl = function(id){
      return document.createElement(id);
    }

    //
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia || 
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);

    var onError = function(err){
      alert("There was a problem accessing your webcam :(");
      console.log('Error:' + err);
    };
    
    var Controls = function() {
      this.Screenshot = function(){
        requestScreenShot = true;
      }
      this.pixelSize = 2;
      this.Greyscale = false;
      this.Nintendo = false;
      this.Atari2600 = false;
      this.None = false;
    };

    var screenShot = function(screeShotCanvas){
      if (screeShotCanvas.toBlob) {
          screeShotCanvas.toBlob(
              function (blob) {
                  saveAs(blob, "BitCam.png");
              },
              'image/png'
          );
      }
    }


    var canvas = createEl('canvas');
    canvas.id = 'videoCanvas'
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    var ctx = canvas.getContext('2d');
    var video = createEl('video');    
    var currPalette;

    navigator.getUserMedia({video:true, audio:false}, function(stream){
      // Moz uses a different property for source
      if(navigator.mozGetUserMedia){
        console.log('using mozSrcObject');
        video.mozSrcObject = stream;
      }
      else{
        console.log('using createObjectURL');
        video.src = window.URL.createObjectURL(stream);  
      }

      // TODO: change to use requestAnim
      video.play();
      window.setInterval(render, 33.3);
    }, onError);

    //
    window.onload = function(){
      controls = new Controls();
      var gui = new dat.GUI();
      gui.add(controls, 'pixelSize').name('Pixel Size').min(1).max(10).step(1);
      gui.add(controls, 'Screenshot');

      controlPalettes = gui.addFolder('Palettes');

      controlPalettesRadios = [];
      controlPalettesRadios.push(controlPalettes.add(controls, 'None'));
      controlPalettesRadios.push(controlPalettes.add(controls, 'Greyscale'));
      controlPalettesRadios.push(controlPalettes.add(controls, 'Nintendo'));
      controlPalettesRadios.push(controlPalettes.add(controls, 'Atari2600'));
      controlPalettesRadios[0].setValue(true);

      //
      var changedPalette = function(){
        for(var i = 0; i < controlPalettesRadios.length; i++){
          if(controlPalettesRadios[i] !== this){
            // oh dear....
            controlPalettesRadios[i].onChange(function(){});
            controlPalettesRadios[i].setValue(false);
            controlPalettesRadios[i].onChange(changedPalette);
          }
          else{
            currPalette = i;
          }
        }
      };

      // 
      for(var i = 0; i < controlPalettesRadios.length; i++){
        controlPalettesRadios[i].onChange(changedPalette);
      }
    };

    /*
    */
    function render(){
      // TODO: fix "component not ready issue on Firefox"
      ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);
    }
    
