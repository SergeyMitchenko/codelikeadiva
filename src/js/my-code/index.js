import SVG from 'svg.js';
import Victor from 'victor';
import * as THREE from 'three';
import dat from 'dat.gui/build/dat.gui.js';

var currentTransform = new THREE.Matrix4();

var scene = new THREE.Scene();

var Parser = require('expr-eval').Parser;
var parser= new Parser();

class Artwork {

    constructor() {

    }

    init() {
        let width = document.getElementById('artwork-wrapper').getBoundingClientRect().width - 2;
        let height = document.getElementById('artwork-wrapper').getBoundingClientRect().height - 2;

        // initialization of camera
        var camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 10000);
        camera.position.set(0,0,0);
        camera.lookAt(new THREE.Vector3(0,0,0));
        let id;
        let angleCamera = 0;

        /**
         * Camera animation functions
         * animate: rotates the camera around (0,height,0)
         * controlCamera: rotates the camera or just renders on picture
         */
        function animate() {
            id = requestAnimationFrame( animate );
            renderer.render( scene, camera );
            camera.position.set(guiModifier["cameraDistance"] * Math.cos( angleCamera ), guiModifier["cameraHeight"], guiModifier["cameraDistance"] * Math.sin( angleCamera ));
            angleCamera += 0.01;
            camera.lookAt(new THREE.Vector3(0,guiModifier["cameraHeight"],0));
        }
        function controlCamera(){
            if(guiModifier["rotateCamera"]){
                cancelAnimationFrame(id);
                animate();
            }
            else {
                cancelAnimationFrame(id);
                camera.position.set(guiModifier["cameraDistance"] * Math.cos( angleCamera ), guiModifier["cameraHeight"], guiModifier["cameraDistance"] * Math.sin( angleCamera ));
                camera.lookAt(new THREE.Vector3(0,guiModifier["cameraHeight"],0));
                renderer.render(scene, camera);
            }
        }

        //initialization of the renderer
        var renderer = new THREE.WebGLRenderer({ alpha: true });
        //var renderer = new SVGRenderer();
        //renderer.setClearColor(0xffffff);
        //renderer.setQuality('high');
        renderer.setSize(width,height);
        document.getElementById("artwork-wrapper").appendChild(renderer.domElement);

        /**
         * rule dictionary for all examples
         * Rule consists of:
         * rule: {Array} array of Rule objects
         * start: {String} start string of the LSystem (Axiom)
         * angle: {float}
         * number: {int} recommended number of generations
         * draw: {String} which symbols are drawn by the interpreter
         * params: {Dictinary} starting parameters
         */
        let ruleDict = {
            "2DTree" : {rule : [new Rule("F", null,[["FF-[-F+F+F]+[+F-F-F]"]],[[1]])] , start : "F", angle : 22.5, number : 3, draw:"F"},
            "Quadratic_Koch_Island" : {rule: [new Rule("F", null,[["F-F+F+FF-F-F+F"]],[[1]])], start : "F-F-F-F", angle: 90, number : 2, draw:"F"},
            "Dense_Koch_Curve": {rule: [new Rule("F", null,[["F-FF--F-F"]],[[1]])], start : "F-F-F-F", angle:90, number: 3, draw:"F"},
            "3DTest" : { rule:[
                new Rule(
                    "A",
                    null,
                    [["B-F+CFC+F-D&F^D-F+&&CFC+F+B//"]],
                    [[1]]
                ),
                new Rule(
                    "B",
                    null,
                    [["A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//"]],
                    [[1]]
                ),
                new Rule(
                    "C",
                    null,
                    [["|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//"]],
                    [[1]]
                ),
                new Rule(
                    "D",
                    null,
                    [["|CFB-F+B|FA&F^A&&FB-F+B|FC//"]],
                    [[1]]
                )
            ] , start : "A", angle:90, number: 3, draw: "F"},
            "DragonCurve" : { rule: [new Rule("L",null,[["L+RF+"]],[[1]]), new Rule("R",null,[["-FL-R"]],[[1]])], start: "FL", angle:90, number:10, draw:"F"},
            "TernaryTree" : { rule: [
                new Rule(
                    "A",
                    null,
                    [["!(vr)F(50)[&(a)F(50)A]/(da)[&(a)F(50)A]/(db)[&(a)F(50)A]"]],
                    [[1]]
                ),
                new Rule(
                    "F(l)",
                    null,
                    [["F(l*lr)"]],
                    [[1]]
                ),
                new Rule(
                    "!(w)",
                    null,
                    [["!(w*vr)"]],
                    [[1]]
                ),
            ], start: "!(1)F(200)/(45)A", number:6, draw:"F", params:{"da":137.5, "db":137.5, "a":18.95, "lr":1.109, "vr":1.732}},
            "RoseLeaf" : { rule: [
                new Rule(
                    "A(t,d)",
                    [function (_ref) {
                        return _ref["d"] === 0;
                    }, function (_ref) {
                        return _ref["d"] === 1;
                    }],
                    [[".G(LA,RA).[+B(t)H(LC,RC,t).}][+B(t){.]A(t+1,d)"],[".G(LA,RA).[-B(t)H(LC,RC,t).}][-B(t){.]A(t+1,d)"]],
                    [[1],[1]]
                ),
                new Rule(
                    "B(t)",
                    [function (_ref) {
                        return _ref["t"] > 0;
                    }],
                    [["G(LB,RB)B(t-1)"]],
                    [[1]]
                ),
                new Rule(
                    "G(s,r)",
                    null,
                    [["G(s*r,r)"]],
                    [[1]]
                ),
                new Rule(
                    "H(s,r,t)",
                    [function (_ref) {
                        return _ref["t"] > 1;
                    }],
                    [["H(s*r,r,t-1)"]],
                    [[1]]
                )
            ], start: "[{A(0,0).}][{A(0,1).}]", number:25, angle: 60, params:{"LA":5, "RA":1.15, "LB":1.3, "RB":1.25, "LC":3, "RC":1.19}},
            "Leaf" : { rule: [
                new Rule(
                    "A",
                    null,
                    [["[+A{.].C.}"]],
                    [[1]]
                ),
                new Rule(
                    "B",
                    null,
                    [["[-B{.].C.}"]],
                    [[1]]
                ),
                new Rule(
                    "C",
                    null,
                    [["GC"]],
                    [[1]]
                )
            ], start: "[A][B]", number:20, angle:10}
        };

        /**
         * generates and draws the given rule of the dictionary
         * @method startLSystem
         * @param {String} name - name of the rule
         * @param {String} color - string of a color hex (example: "#ff00ff")
         * @param {int} n - number of generations
         * @param {float} w - width of drawn lines
         * @param {float} l - length of drawn lines
         * @param {float} r - rotation angle of LSystem
         */
        function startLSystem(name, color, n, w, l, r){
            let lsys = new LSystem(ruleDict[name].start, ruleDict[name].rule, ruleDict[name].params);
            let turtle = new LSystemDrawer();

            console.log(lsys.getSentence());

            for(let i = 0; i<((n === undefined || n === null) ? ruleDict[name].number : n); i++){
                lsys.generate();
                console.log(lsys.getSentence());
            }

            turtle.setToDo(lsys.getSentence());
            turtle.setWidth(((w === undefined || w === null) ? 3 : w));
            turtle.setLength(((l === undefined || l === null) ? 20 : l));
            turtle.setRotation(((r === undefined || r === null) ? ruleDict[name].angle : r));
            turtle.setDrawSymbols(ruleDict[name].draw);
            turtle.setColor(color);
            turtle.render();
        }

        //TODO Menu
        //TODO Branching (wind)
        //TODO $
        //TODO Leafes
        //TODO Bracnh width
        //TODO SVG Renderer
        //TODO Comments and Explanation

        let guiModifier = {
            cameraHeight: 0,
            cameraDistance: 1000,
            rotateCamera: true,
            color: "#ff0066",
            width: 3,
            length: 20,
            number: 2,
            rule: "TernaryTree",
            redraw: function redraw() {
                while(scene.children.length > 0){
                    scene.remove(scene.children[0]);
                }
                currentTransform.identity();
                startLSystem(guiModifier["rule"], guiModifier["color"],guiModifier["number"], guiModifier["width"], guiModifier["length"], null);
                controlCamera();
            }
        };
        let modifierFunctions= { };
        let gui = new dat.GUI({width: 300});
        let cameraFolder = gui.addFolder('Camera Controller');
        modifierFunctions["cameraHeight"] = cameraFolder.add(guiModifier, "cameraHeight").name("Camera Height");
        modifierFunctions["cameraDistance"] = cameraFolder.add(guiModifier, "cameraDistance").name("Camera Distance").min(0);
        modifierFunctions["rotateCamera"] = cameraFolder.add(guiModifier, "rotateCamera").name("Rotate Camera");
        cameraFolder.open();
        let artworkFolder = gui.addFolder('Artwork Options');
        artworkFolder.add(guiModifier, 'redraw').name('Redraw');
        modifierFunctions['color'] = artworkFolder.addColor(guiModifier, 'color').name('Color');
        modifierFunctions["width"] = artworkFolder.add(guiModifier, "width").name("Width").min(1);
        modifierFunctions["length"] = artworkFolder.add(guiModifier, "length").name("Length").min(1);
        modifierFunctions["number"] = artworkFolder.add(guiModifier, "number").name("Number").min(0).step(1).listen();
        modifierFunctions["rule"] = artworkFolder.add(guiModifier, "rule", Object.keys(ruleDict)).name("Rule");
        artworkFolder.open();

        function update () {
            requestAnimationFrame ( update );
            for (let i in artworkFolder.__controllers) {
                artworkFolder.__controllers[i].updateDisplay();
            }
        }
        function loop (modifier) {
            modifierFunctions[modifier].onChange(function (value) {
                guiModifier[modifier] = value;
                if(modifier.localeCompare("rotateCamera")===0 || modifier.localeCompare("cameraHeight")===0 || modifier.localeCompare("cameraDistance")===0)
                    controlCamera();
                else if (modifier.localeCompare("rule")===0){
                    guiModifier["number"] = ruleDict[guiModifier["rule"]]["number"];
                    while(scene.children.length > 0){
                        scene.remove(scene.children[0]);
                    }
                    currentTransform.identity();
                    startLSystem(guiModifier["rule"], guiModifier["color"],guiModifier["number"], guiModifier["width"], guiModifier["length"], null);
                    controlCamera();
                }
            });
        }
        for (let modifier in modifierFunctions) {
            loop(modifier);
        }

        update();
        startLSystem(guiModifier["rule"], guiModifier["color"]);
        controlCamera();
    }
}

export default Artwork;

/**
 * Class Rule for the L-System
 * Rule is a production and consists of an predecessor and successors
 * Optional it is possible to define conditions and probabilities
 */
class Rule{
    /**
     * constructor of the class Rule
     * @param {String} pre - predecessor String
     * @param {function[]} cond - conditions for different successors
     * @param {String[][]} suc - successors (suc[conditionNumber][probabilityNumber]) - if null then condition always true
     * @param {String[][]} prob - probabilities (prob[conditionNumber][probabilityNumber])
     */
    constructor(pre, cond, suc, prob){
        this.predecessor = pre;
        if(cond === null)
            this.condition = [function (_ref) {
                return true;
            }];
        else
            this.condition = cond;
        this.successor = suc;
        this.probabilty = prob;
    }
}

class LSystem{
    constructor(begin, rules, params){
        this.ruleset = rules;
        this.current = begin;
        this.parameter = (params === undefined || params === null) ? {} : params;
        if(!(Object.keys(this.parameter).length === 0 &&  this.parameter.constructor === Object)){
            for(let i=0; i<this.ruleset.length; i++){
                for(let j=0; j<this.ruleset[i].successor.length; j++){
                    for(let k=0; k<this.ruleset[i].successor[j].length; k++){
                        for(let key in this.parameter){
                            if (this.parameter.hasOwnProperty(key)) {
                                this.ruleset[i].successor[j][k] = this.ruleset[i].successor[j][k].replace(new RegExp(key.toString(), "g"), this.parameter[key]);
                            }
                        }
                    }
                }
            }
        }
        this.generation = 0;
    }

    getSentence(){
        return this.current;
    }

    getGeneration(){
        return this.generation;
    }

    generate(){
        let next = new StringBuffer();
        let params = this.current.match(/\(([+-]?\d+(\.\d+)?)(,[+-]?\d+(\.\d+)?)*\)/g);
        let paramsCounter = 0;

        let random = 0;
        let number = 0;

        for(let i=0; i<this.current.length; i++){
            let c = this.current.charAt(i);
            let replace = new StringBuffer();
            replace.append("" + c);

            ruleLabel:
            for (let r of this.ruleset){
                if(r.predecessor.charAt(0) === c){
                    if(this.current.charAt(i+1) === "("){
                        let split = r.predecessor.split(/[(),]/g).filter(function(string){return string !== "";});
                        let dict = {};
                        let paramsSplit = params[paramsCounter].split(/[(),]/g).filter(function(string){return string !== "";});

                        for(let k=1; k<split.length; k++){
                            dict[split[k]] = parseFloat(paramsSplit[k-1]);
                        }

                        for(let k=0; k<r.condition.length; k++){
                            if(r.condition[k](dict)){
                                replace.clear();
                                random = Math.random();
                                number = 0;
                                for(let j=0; j<r.probabilty[k].length; j++){
                                    number += r.probabilty[k][j];
                                    if(random<=number){
                                        let sucSplit = r.successor[k][j].split(/[()]/g).filter(function(string){return string !== "";});
                                        for(let m =0; m<sucSplit.length; m++){
                                            if(m%2===0)
                                                replace.append(sucSplit[m]);
                                            else {
                                                replace.append("(");
                                                let exprSplit = sucSplit[m].split(/[,]/g).filter(function(string){return string !== "";});
                                                for(let l=0; l<exprSplit.length; l++){
                                                    replace.append(parser.parse(exprSplit[l]).evaluate(dict));
                                                    if(l<exprSplit.length-1)
                                                        replace.append(",");
                                                }
                                                replace.append(")");
                                            }
                                        }

                                        while(this.current.charAt(i) !== ")"){
                                            i++;
                                        }
                                        break ruleLabel;
                                    }
                                }
                            }
                        }
                    }
                    else{
                        random = Math.random();
                        number = 0;
                        for(let j=0; j<r.probabilty[0].length; j++){
                            number += r.probabilty[0][j];
                            if(random<=number){
                                replace.clear();
                                replace.append(r.successor[0][j]);
                                break ruleLabel;
                            }
                        }
                    }
                }
            }
            if(this.current.charAt(i) === ")")
                paramsCounter++;
            next.append(replace.toString());
        }
        this.current = next.toString();
        this.generation++;
    }
}

class LSystemDrawer{

    constructor(){
    }

    setLength(l){
        this.length = l;
    }

    setRotation(r){
        this.rotation = r;
    }

    setWidth(w){
        this.width = w;
    }

    setToDo(sentence){
        this.current = sentence;
    }

    setDrawSymbols(draw){
        this.draw = draw;
    }

    setColor(color){
        this.color = color;
    }

    render(){
        let tempVertex;
        let transformStack = [];
        let widthStack = [];
        let lengthStack = [];
        let polygonStack = [];
        let vertices = [];

        for (let i = 0; i<this.current.length; i++){
            let c = this.current.charAt(i);

            let params = [];
            if(this.current.charAt(i+1) === "("){
                i = i+2;
                let number = new StringBuffer();
                while(true){
                    if(this.current.charAt(i) === ","){
                        params.push(parseFloat(number.toString()));
                        number.clear();
                    }
                    else if (this.current.charAt(i)===")"){
                        params.push(parseFloat(number.toString()));
                        number.clear();
                        break;
                    }
                    else{
                        number.append(this.current.charAt(i));
                    }
                    i++;
                }
            }

            if((this.draw === null || this.draw === undefined) ? /[A-Z]/.test(c) : this.draw.includes(c)){
                if(params.length >= 1){
                    this.setLength(params[0]);
                    if(params.length >= 2)
                        this.setWidth(params[1])
                }
                let material = new THREE.MeshBasicMaterial({color: this.color}); //'#050'
                let geometry = new THREE.CylinderGeometry(this.width/2,this.width/2,this.length,20);
                let branch = new THREE.Mesh(geometry, material);
                branch.applyMatrix( new THREE.Matrix4().makeTranslation( 0, this.length/2, 0 ) );
                branch.applyMatrix(currentTransform);

                currentTransform.multiply(new THREE.Matrix4().makeTranslation(0,this.length,0));
                scene.add(branch);
            } else if (c === 'f') {
                currentTransform.multiply(new THREE.Matrix4().makeTranslation(0,this.length,0));
            } else if (c === '!') {
                this.setWidth(params[0]);
            } else if (/[\+\-\/\\\&\^|]/.test(c)) {
                if(params.length >= 1){
                    this.setRotation(params[0]);
                }
                if(c === '+')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 180) * this.rotation));
                else if (c === '-')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 180) * -this.rotation));
                else if (c === '&')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationX((Math.PI / 180) * this.rotation));
                else if (c === '^')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationX((Math.PI / 180) * -this.rotation));
                else if (c === '\\')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationY((Math.PI / 180) * this.rotation));
                else if (c === '/')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationY((Math.PI / 180) * -this.rotation));
                else if (c === '|')
                    currentTransform.multiply(new THREE.Matrix4().makeRotationZ((Math.PI / 180) * 180));
            } else if (c === '$') {

            } else if (c === '[') {
                transformStack.push(new THREE.Matrix4().copy(currentTransform));
                widthStack.push(this.width);
                lengthStack.push(this.length);
            } else if (c === ']') {
                currentTransform = transformStack.pop();
                this.width = widthStack.pop();
                this.length = lengthStack.pop();
            } else if (c === '.') {
                vertices.push(new THREE.Vector4().applyMatrix4(currentTransform));

                /*
                var geo = new THREE.SphereGeometry( 1, 32, 32 );
                var mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
                var sphere = new THREE.Mesh( geo, mat );
                sphere.applyMatrix(currentTransform);
                scene.add( sphere );
                */

            } else if (c === '{') {
                polygonStack.push(vertices.slice(0));
                vertices = [];
            } else if (c === '}') {

                let g = new THREE.Geometry();
                let m = new THREE.MeshBasicMaterial( { color : 0x00aa00 } );
                m.side = THREE.DoubleSide;

                for(let j = 0; j<vertices.length; j++){
                    g.vertices.push(new THREE.Vector3( vertices[j].getComponent(0), vertices[j].getComponent(1), vertices[j].getComponent(2)))
                }

                if(g.vertices.length === 2){
                    g.vertices.push(new THREE.Vector3( tempVertex.getComponent(0), tempVertex.getComponent(1), tempVertex.getComponent(2)));
                    g.faces.push( new THREE.Face3( 0, 1, 2));
                } else if (g.vertices.length === 3) {
                    g.faces.push( new THREE.Face3( 0, 1, 2));
                } else if (g.vertices.length === 4) {
                    tempVertex = vertices[2];
                    g.faces.push( new THREE.Face3( 0, 1, 3), new THREE.Face3( 1, 2, 3));
                }

                scene.add( new THREE.Mesh( g, m ) );
                vertices = polygonStack.pop();
            }
        }
    }
}

function StringBuffer() {
    this.buffer = new Array;
}

StringBuffer.prototype = {
    append: function (s) {
        this.buffer.push(s);
    },

    toString: function () {
        return this.buffer.join("");
    },

    clear: function () {
        this.buffer.length = 0;
    }
};