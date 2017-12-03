const config = {
  author: "Sergey Mitchenko",
  title: "Naked Tree in a cold Winter",
  instructions: "The generation is based on the Lindenmayer-System. For the system a start string (Axiom) and rules are defined. " +
  "The rules replace single letters of the current string with a string, which is defined in the production of the rule. " +
  "The generated string then will be passed on to a interpreter and drawn/rendered (adjustable parameter: color, width, length). " +
  "The number of generations can be set in the menu on the right side (I recommend you to not set the number to high, because the render process can be very long). " +
  "In the dropdown menu 'Rule' you can choose and generate predefined rules. " +
  "You can also create own rules by selecting 'Custom' and defining rules in the 'Rule Folder'. " +
  "On the top of the menu you can select the renderer (SVG oder WebGL). I recommend you to use the WebGl Renderer, because he is much faster (SVGRenderer is included, because the Task was to generate a SVG-Graphic). " +
  "Additionally you can control the camera by setting the distance and height and optionally activate the rotation option."
};

export default config;
