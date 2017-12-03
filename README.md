# codelikeadiva

I implemented a Lindenmayer system to generate different fractal patterns, especially trees.

The L-System is defined by an initiator and a generator. The initiator is a simple string and the generator is a production.
Each defined predecessor letter of the production in the initiator (or already produced generation string) gets replaced with the successor letter (or string).

The generated string will passed on to the interpreter, which draws the corresponding structure. 

Interpreter operations (letters):
+ uppercase letter [A-Z]: draw and move forward
+ f:  move forward
+ +: turn left around Z axis
+ -: turn right around Z axis
+ &: pitch down around X axis
+ ^: pitch up around X axis
+ \: roll left around Y axis
+ /: roll right around Y axis
+ |: turn completely around around Z axis
+ \[: push current state onto a pushdown stack
+ \]: pop a state from the stack 
+ .: append new vertex to current polygon
+ {: start new polygon by pushing current polygon on a stack
+ }: draw current polygon and pop polygon from the stack

Additional Features:
+ Stochastic
+ Parametric

![alt text](https://github.com/Atomkeks/codelikeadiva/blob/develop/my-artwork/Favorite_Picture.png)
![alt text](https://github.com/Atomkeks/codelikeadiva/blob/develop/my-artwork/little_extra.png)

#### Library notes
In the folder customLib is a custom three.js Library, because the current version of three.js does not support the SVGRenderer.

In the custom three.js Library the SVGRenderer as well as the class Projector, which is needed by the SVGRenderer.