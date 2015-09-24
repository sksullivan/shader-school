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
    if (mod(radius/30000.0,5.0) < 2.0) {
        gl_FragColor = vec4(0.93, 0.80, 0.80, 1.0);
    } else {
        gl_FragColor = vec4(0.41, 0.56, 0.80, 1.0);
    }
}
