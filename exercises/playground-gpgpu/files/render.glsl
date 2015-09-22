precision mediump float;

uniform sampler2D state[3];        //State buffer
uniform vec2 screenSize;          //Size of screen buffer
uniform vec2 mousePosition;       //Position of mouse
uniform bool mouseDown[3];        //Test if mouse left, right, middle is down
uniform float time;               //Time since start
uniform vec3 rainbowColor1;
uniform vec3 rainbowColor2;

void main() {

  float x = gl_FragCoord.x - float(screenSize.x)/2.0;
  float y = gl_FragCoord.y - float(screenSize.y)/2.0;
  float radius = x*x + y*y;
  if (mod(radius/((time+300000.0)/50.0),5.0) < 2.0) {
    gl_FragColor = vec4(rainbowColor1.x, rainbowColor1.y, rainbowColor1.z, 1.0);
  } else {
    gl_FragColor = vec4(rainbowColor2.x, rainbowColor2.y, rainbowColor2.z, 1.0);
  }
}