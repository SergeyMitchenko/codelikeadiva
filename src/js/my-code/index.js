import * as THREE from '../../../customLib/three.module';
import dat from 'dat.gui/build/dat.gui';

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

        //#region Initialization of camera and camera functions
        let camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 10000);
        camera.position.set(0,0,0);
        camera.lookAt(new THREE.Vector3(0,0,0));
        let id;
        let angleCamera = (Math.PI / 180) * 90;

        /**
         * Camera animation functions
         * animate: rotates the camera around (0,height,0)
         * controlCamera: start to rotate the camera or just renders on picture
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
        //#endregion

        //#region Initialization of the renderer
        let renderer = new THREE.SVGRenderer();
        renderer.setClearColor(0xffffff);
        renderer.setQuality('high');
        renderer.setSize(width,height);
        let artwork_wrapper = document.getElementById("artwork-wrapper");
        artwork_wrapper.appendChild(renderer.domElement);
        //#endregion

        //#region LSystem stuff
        /**
         * rule dictionary for all examples
         * Rule consists of:
         * rule: {Array} - array of Rule objects
         * start: {String} - start string of the LSystem (Axiom)
         * angle: {float}
         * number: {int} - recommended number of generations
         * draw: {String} - which symbols are drawn by the interpreter
         * params: {Dictionary} - starting parameters
         * bool: {Dictionary} - options for the interpreter/drawer
         */
        var ruleDict = {
            "2D_Tree" : {rule : [new Rule("F", null,[["FF-[-F+F+F]+[+F-F-F]"]],[[1]])] , start : "F", angle : 22.5, number : 4, draw:"F"},
            "Quadratic_Koch_Island" : {rule: [new Rule("F", null,[["F-F+F+FF-F-F+F"]],[[1]])], start : "F-F-F-F", angle: 90, number : 3, draw:"F"},
            "Dense_Koch_Curve": {rule: [new Rule("F", null,[["F-FF--F-F"]],[[1]])], start : "F-F-F-F", angle:90, number: 4, draw:"F"},
            "3D_Test" : { rule:[
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
            "Dragon_Curve" : { rule: [new Rule("L",null,[["L+RF+"]],[[1]]), new Rule("R",null,[["-FL-R"]],[[1]])], start: "FL", angle:90, number:12, draw:"F"},
            "Ternary_Tree" : { rule: [
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
            ], start: "!(1)F(200)/(45)A", number:8, draw:"F", params:{"da":137.5, "db":137.5, "a":18.95, "lr":1.109, "vr":1.732, "e":0.14, "tropism": new THREE.Vector3(0,-1,0)}, bool: {"secondary": false, "tropism":true}},
            "Rose_Leaf" : { rule: [
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
            ], start: "[{A(0,0).}][{A(0,1).}]", number:20, angle: 60, params:{"LA":5.0, "RA":1.15, "LB":1.3, "RB":1.25, "LC":3.0, "RC":1.19}},
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
            ], start: "[A][B]", number:20, angle:10},
            "Custom": {}
        };

        /**
         * generates and draws the given rule of the dictionary
         * @function startLSystem
         * @param {String} name - name of the rule
         * @param {String} color - string of a color hex (example: "#ff00ff")
         * @param {int} n - number of generations
         * @param {float} w - width of drawn lines
         * @param {float} l - length of drawn lines
         */
        function startLSystem(name, color, n, w, l){
            let lsys = new LSystem(ruleDict[name].start, ruleDict[name].rule, ruleDict[name].params);
            //console.log(lsys.getSentence());
            for(let i = 0; i<((n === undefined) ? ruleDict[name].number : n); i++){
                lsys.generate();
                //console.log(lsys.getSentence());
            }

            if(name.localeCompare("Rose_Leaf")===0 || name.localeCompare("Leaf")===0){
                color = "#030";
            }

            let turtle = new LSystemDrawer(lsys.getSentence(), color, ((l === undefined) ? 20 : l), ((w === undefined) ? 3 : w), ruleDict[name].angle, ruleDict[name].draw);

            if(ruleDict[name].bool !== undefined && ruleDict[name].bool["tropism"])
                turtle.setTropism(ruleDict[name].bool["tropism"], ruleDict[name].params["tropism"], ruleDict[name].params["e"]);
            if(ruleDict[name].bool !== undefined && ruleDict[name].bool["secondary"]) {
                let lsys_leaf = new LSystem(ruleDict["Rose_Leaf"].start, ruleDict["Rose_Leaf"].rule, ruleDict["Rose_Leaf"].params);
                for(let i = 0; i<ruleDict["Rose_Leaf"].number; i++){
                    lsys_leaf.generate();
                }
                turtle.setSecondaryString(lsys_leaf.getSentence());
            }

            let temp = turtle.render();
            if(name.localeCompare("2D_Tree") === 0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(0,-550,0));
                guiModifier["cameraDistance"] = 800;
            } else if(name.localeCompare("Quadratic_Koch_Island")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(-500,-640,0));
                guiModifier["cameraDistance"] = 1400;
            } else if(name.localeCompare("Dense_Koch_Curve")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(-100,350,0));
                guiModifier["cameraDistance"] = 700;
            } else if(name.localeCompare("3D_Test")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(0,-50,0));
                guiModifier["cameraDistance"] = 400;
            }else if(name.localeCompare("Dragon_Curve")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(0,500,0));
                guiModifier["cameraDistance"] = 1400;
            } else if(name.localeCompare("Ternary_Tree")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(0,-800,0));
                guiModifier["cameraDistance"] = 1400;
            } else if(name.localeCompare("Rose_Leaf")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(0,-250,0));
                guiModifier["cameraDistance"] = 400;
            } else if(name.localeCompare("Leaf")===0){
                temp.applyMatrix(new THREE.Matrix4().makeTranslation(0,-150,0));
                guiModifier["cameraDistance"] = 500;
            }
            scene.add(temp);
        }

        //#endregion

        //#region Initialization of Option Menu (GUI)
        let guiModifier = {
            renderer : "SVG",
            cameraHeight: 0,
            cameraDistance: 1000,
            rotateCamera: false,
            color: "#8B4513",
            width: 6,
            length: 20,
            number: ruleDict["Ternary_Tree"].number,
            rule: "Ternary_Tree",
            redraw: function redraw(bool) {
                // bool = undefined if Redraw Button is clicked
                // bool = true if rule in the drop down menu is changed

                //clears the scene and transformation matrix
                while(scene.children.length > 0){
                    scene.remove(scene.children[0]);
                }
                currentTransform.identity();
                //if the custom rule is selected
                if(guiModifier["rule"].localeCompare("Custom") === 0) {
                    if(bool === undefined){
                        //draw custom rule, but only if all necessary parameters are defined
                        if(guiModifier["customRule_angle"] !== 0 && guiModifier["customRule_start"].localeCompare("") !== 0 && customRules.length > 0){
                            for(let i = 0; i<customRules.length; i++){
                                customRules[i].successor = [[customRules[i].successorHelper]];
                            }
                            let drawTemp;
                            if(guiModifier["customRule_draw"].localeCompare("none") === 0)
                                drawTemp = "";
                            else if (guiModifier["customRule_draw"].localeCompare("") === 0 || guiModifier["customRule_draw"].localeCompare("all") === 0 )
                                drawTemp = undefined;
                            else
                                drawTemp = guiModifier["customRule_draw"];
                            ruleDict["Custom"] = { rule: customRules, start: guiModifier["customRule_start"], angle: guiModifier["customRule_angle"], number:guiModifier["number"], draw:drawTemp};
                            startLSystem("Custom", guiModifier["color"],guiModifier["number"], guiModifier["width"], guiModifier["length"]);
                        }
                        else
                            alert("Not all parameters of the custom rule are defined!");
                    } else {
                        guiModifier["number"] = 0;
                    }
                }
                // draw selected rule which isn't the custom rule
                else {
                    if(bool !== undefined)
                        guiModifier["number"] = ruleDict[guiModifier["rule"]]["number"];
                    startLSystem(guiModifier["rule"], guiModifier["color"],guiModifier["number"], guiModifier["width"], guiModifier["length"]);
                }
                controlCamera();
            },
            addRule: function addRule() {
                // adds new custom rule which the user can define
                newRulesFolder.push(ruleFolder.addFolder("Rule " + ruleNumber));
                customRules.push(new Rule("", null, [[""]], [[1]]));
                modifierFunctions["customRule_"+ruleNumber+"_pre"] = newRulesFolder[ruleNumber-1].add(customRules[ruleNumber-1], 'predecessor').name("Predecessor");
                modifierFunctions["customRule_"+ruleNumber+"_suc"] = newRulesFolder[ruleNumber-1].add(customRules[ruleNumber-1], 'successorHelper').name("Successor");
                ruleNumber++;
            },
            customRule_angle: 0,
            customRule_draw: "",
            customRule_start: ""
        };

        let modifierFunctions= { };
        let gui = new dat.GUI({width: 350});
        modifierFunctions["renderer"] = gui.add(guiModifier, "renderer", ["SVG", "WebGL"]).name("Renderer");
        let cameraFolder = gui.addFolder('Camera Controller');
        modifierFunctions["cameraHeight"] = cameraFolder.add(guiModifier, "cameraHeight").name("Camera Height");
        modifierFunctions["cameraDistance"] = cameraFolder.add(guiModifier, "cameraDistance").name("Camera Distance").min(0);
        modifierFunctions["rotateCamera"] = cameraFolder.add(guiModifier, "rotateCamera").name("Rotate Camera");
        cameraFolder.open();
        let artworkFolder = gui.addFolder('Artwork Options');
        let treeOptionActive = true;
        artworkFolder.add(guiModifier, 'redraw').name('Redraw');
        modifierFunctions['color'] = artworkFolder.addColor(guiModifier, 'color').name('Color');
        modifierFunctions["width"] = artworkFolder.add(guiModifier, "width").name("Width").min(1);
        modifierFunctions["length"] = artworkFolder.add(guiModifier, "length").name("Length").min(1);
        modifierFunctions["number"] = artworkFolder.add(guiModifier, "number").name("Number").min(0).step(1);
        modifierFunctions["rule"] = artworkFolder.add(guiModifier, "rule", Object.keys(ruleDict)).name("Rule");
        modifierFunctions["tree_leaf_bool"] = artworkFolder.add(ruleDict["Ternary_Tree"].bool, "secondary").name("Tree with Leafs");
        modifierFunctions["tree_tropism_rule"] = artworkFolder.add(ruleDict["Ternary_Tree"].bool, "tropism").name("Tree with Tropism");
        artworkFolder.open();
        let ruleFolder = gui.addFolder("Rule Folder");
        let newRulesFolder = [];
        let customRules = [];
        let ruleNumber = 1;
        modifierFunctions["customRule_start"] = ruleFolder.add(guiModifier, "customRule_start").name("Axiom");
        modifierFunctions["customRule_angle"] = ruleFolder.add(guiModifier, "customRule_angle").name("Angle");
        modifierFunctions["customRule_draw"] = ruleFolder.add(guiModifier, "customRule_draw").name("Symbols");
        ruleFolder.add(guiModifier, 'addRule').name("Add new Rule");

        /**
         * @function update
         * @description updates the values in the menu if they are changed
         */
        function update () {
            requestAnimationFrame ( update );
            for (let i in artworkFolder.__controllers) {
                artworkFolder.__controllers[i].updateDisplay();
            }
            for (let i in cameraFolder.__controllers) {
                cameraFolder.__controllers[i].updateDisplay();
            }
        }

        /**
         * @function loop
         * @description defines the OnChange listener for the different menu options
         * @param modifier
         */
        function loop (modifier) {
            modifierFunctions[modifier].onChange(function (value) {
                guiModifier[modifier] = value;
                // change the renderer (SVG or WebGL)
                if(modifier.localeCompare("renderer")===0){
                    if(guiModifier["renderer"].localeCompare("WebGL") === 0){
                        renderer = new THREE.WebGLRenderer({ alpha: true });
                    } else if(guiModifier["renderer"].localeCompare("SVG") === 0){
                        renderer = new THREE.SVGRenderer();
                        renderer.setClearColor(0xffffff);
                        renderer.setQuality('high');
                    }
                    artwork_wrapper.removeChild(artwork_wrapper.childNodes[0]);
                    artwork_wrapper.appendChild(renderer.domElement);
                    renderer.setSize(width,height);
                    controlCamera();
                // updates the camera position
                } else if(modifier.localeCompare("rotateCamera")===0 || modifier.localeCompare("cameraHeight")===0 || modifier.localeCompare("cameraDistance")===0) {
                    controlCamera();
                // draws a rule if a new one is selected
                } else if (modifier.localeCompare("rule")===0){
                    guiModifier.redraw(true);
                    // enables additional options for Trees
                    if (guiModifier["rule"].localeCompare("Ternary_Tree") === 0){
                        modifierFunctions["tree_leaf_bool"] = artworkFolder.add(ruleDict["Ternary_Tree"].bool, "secondary").name("Tree with Leafs");
                        modifierFunctions["tree_tropism_rule"] = artworkFolder.add(ruleDict["Ternary_Tree"].bool, "tropism").name("Tree with Tropism");
                        treeOptionActive = true;
                    }
                    else {
                        if(treeOptionActive){
                            ruleDict["Ternary_Tree"].bool["secondary"] = false;
                            artworkFolder.remove(modifierFunctions["tree_leaf_bool"]);
                            artworkFolder.remove(modifierFunctions["tree_tropism_rule"]);
                            treeOptionActive = false;
                        }
                    }
                } else if(modifier.localeCompare("tree_leaf_bool")===0) {
                    if(ruleDict["Ternary_Tree"].bool["secondary"])
                        guiModifier["number"] = 4;
                    else
                        guiModifier["number"] = ruleDict["Ternary_Tree"].number;
                }
            });
        }
        for (let modifier in modifierFunctions) {
            loop(modifier);
        }
        //#endregion

        update();
        startLSystem(guiModifier["rule"], guiModifier["color"]);
        controlCamera();
    }
}

export default Artwork;

/**
 * @class Rule - for the L-System
 * @description Rule is a production and consists of an predecessor and successors
 * @description Optional it is possible to define conditions and probabilities
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
        this.successorHelper = "";
    }
}

/**
 * @class LSystem - for the Lindenmayer-System
 * @description generates next String according to the given L-System Rules
 */
class LSystem{
    /**
     * constructor of the class LSystem
     * @param {String} begin - Axiom of the L-System
     * @param {Rule[]} rules - Array of Rules
     * @param {Object.<string, float>} params - starting parameters
     * @description if params is defines, then every string of params gets replaced with the float number in all successors of the rules
     */
    constructor(begin, rules, params){
        this.ruleset = rules;
        this.current = begin;
        this.parameter = (params === undefined) ? {} : params;
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
    }

    /**
     * @function getSentence
     * @returns {String}
     */
    getSentence(){
        return this.current;
    }

    /**
     * @function generate
     * @description apply the rules on the current string
     */
    generate(){
        let next = new StringBuffer();
        let params = this.current.match(/\(([+-]?\d+(\.\d+)?)(,[+-]?\d+(\.\d+)?)*\)/g);
        let paramsCounter = 0;

        let random = 0;
        let number = 0;

        // iterates through the current string
        for(let i=0; i<this.current.length; i++){
            let c = this.current.charAt(i);
            let replace = new StringBuffer();
            replace.append("" + c);

            // iterates through all given rules
            ruleLabel:
            for (let r of this.ruleset){
                if(r.predecessor.charAt(0) === c){
                    // checks if the current symbol is parametric
                    if(this.current.charAt(i+1) === "("){
                        // get the necessary parameters
                        let split = r.predecessor.split(/[(),]/g).filter(function(string){return string !== "";});
                        let dict = {};
                        let paramsSplit = params[paramsCounter].split(/[(),]/g).filter(function(string){return string !== "";});

                        for(let k=1; k<split.length; k++){
                            dict[split[k]] = parseFloat(paramsSplit[k-1]);
                        }

                        // iterate through the conditions
                        for(let k=0; k<r.condition.length; k++){
                            if(r.condition[k](dict)){
                                replace.clear();
                                random = Math.random();
                                number = 0;
                                // iterate through the probabilities
                                for(let j=0; j<r.probabilty[k].length; j++){
                                    number += r.probabilty[k][j];
                                    if(random<=number){
                                        // replacement process
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
                        // if the symbol is not parametric only check for probabilities
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
    }
}

/**
 * @class LSystemDrawer - the interpreter of the Lindenmayer-System string
 * @description renders a given string
 */
class LSystemDrawer{

    /**
     * @description constructor of LSystemDrawer
     * @param sentence {String}
     * @param color {String}
     * @param length {float}
     * @param width {float}
     * @param angle {float}
     * @param draw {String}
     */
    constructor(sentence, color, length, width, angle, draw){
        this.current = sentence;
        this.color = color;
        this.length = length;
        this.width = width;
        this.rotation = angle;
        this.draw = draw;
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

    // optional
    setTropism(b, v, e){
        this.tropismBool = b;
        this.tropism = v;
        this.e = e;
    }

    // optional
    setSecondaryString(s){
        this.secondaryString = s;
    }

    /**
     * @function render
     * @description draws/renders a given string with given parameters as length, rotation angle, width, draw symbols, color, optional tropism and optional a secondary string
     * @returns {Group}
     */
    //TODO Leafs on the tree are too expensive in runtime(improve render technology)
    render(){
        let group = new THREE.Group();

        let leaf;
        if(this.secondaryString !== undefined){
            let turtle = new LSystemDrawer(this.secondaryString, "#030", 20, 3, 60);
            leaf = turtle.render();
        }

        let lSystemCoordinateSystem = [new THREE.Vector4(0,0,0,1), new THREE.Vector4(1,0,0,1), new THREE.Vector4(0,1,0,1), new THREE.Vector4(0,0,1,1)];

        // variables/stacks for the drawer
        let transformStack = [];
        let widthStack = [];
        let lengthStack = [];

        // variables for the leafs
        let tempVertex;
        let polygonStack = [];
        let vertices = [];

        // loop through string that is drawn/rendered
        for (let i = 0; i<this.current.length; i++){
            let c = this.current.charAt(i);

            // get optional parameters
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

            // draw process
            // upper case letters -> draw a line/cylinder
            if((this.draw === undefined) ? /[A-Z]/.test(c) : this.draw.includes(c)){
                if(params.length >= 1){
                    this.setLength(params[0]);
                    if(params.length >= 2)
                        this.setWidth(params[1])
                }
                //TODO optional fix branch width bug (smooth transitions between segments)
                let material = new THREE.MeshBasicMaterial({color: this.color}); //'#050'
                let geometry = new THREE.CylinderBufferGeometry(this.width/2,this.width/2,this.length,5,1,false);
                let branch = new THREE.Mesh(geometry, material);
                branch.applyMatrix( new THREE.Matrix4().makeTranslation( 0, this.length/2, 0 ) );
                branch.applyMatrix(currentTransform);
                group.add(branch);

                //TODO Tropism doesn't work properly for a wind vector (works only with gravity vector (0,-1,0))
                // optional tropism
                if(this.tropismBool) {
                    for (let j = 0; j < lSystemCoordinateSystem.length; j++)
                        lSystemCoordinateSystem[j].applyMatrix4(currentTransform);

                    let head_vector = new THREE.Vector4().subVectors(lSystemCoordinateSystem[2], lSystemCoordinateSystem[0]).multiplyScalar(this.length);
                    let temp = new THREE.Vector3().crossVectors(new THREE.Vector3(head_vector.getComponent(0), head_vector.getComponent(1), head_vector.getComponent(2)), this.tropism);
                    let alpha = temp.length() * this.e;
                    let tropismRotationMatrix = new THREE.Matrix4().makeRotationAxis(temp.normalize(), (Math.PI / 180) * alpha);

                    let tempMatrix = new THREE.Matrix4().multiplyMatrices(currentTransform, tropismRotationMatrix);
                    lSystemCoordinateSystem = [new THREE.Vector4(0, 0, 0, 1), new THREE.Vector4(1, 0, 0, 1), new THREE.Vector4(0, 1, 0, 1), new THREE.Vector4(0, 0, 1, 1)];
                    for (let j = 0; j < lSystemCoordinateSystem.length; j++)
                        lSystemCoordinateSystem[j].applyMatrix4(tempMatrix);
                    let head_vector_rotated = new THREE.Vector4().subVectors(lSystemCoordinateSystem[2], lSystemCoordinateSystem[0]).multiplyScalar(this.length);
                    if (this.tropism.angleTo(new THREE.Vector3(head_vector.getComponent(0), head_vector.getComponent(1), head_vector.getComponent(2))) < this.tropism.angleTo(new THREE.Vector3(head_vector_rotated.getComponent(0), head_vector_rotated.getComponent(1), head_vector_rotated.getComponent(2))))
                        tropismRotationMatrix = new THREE.Matrix4().makeRotationAxis(temp.normalize(), (Math.PI / 180) * -alpha);

                    lSystemCoordinateSystem = [new THREE.Vector4(0, 0, 0, 1), new THREE.Vector4(1, 0, 0, 1), new THREE.Vector4(0, 1, 0, 1), new THREE.Vector4(0, 0, 1, 1)];
                    currentTransform.multiply(new THREE.Matrix4().makeTranslation(0,this.length,0));
                    currentTransform.multiply(tropismRotationMatrix);
                }
                else
                    currentTransform.multiply(new THREE.Matrix4().makeTranslation(0,this.length,0));
            // letter A will draw the secondary string (used for leafs)
            }else if (c==='A' && this.secondaryString!==undefined){
                transformStack.push(new THREE.Matrix4().copy(currentTransform));
                currentTransform.multiply(new THREE.Matrix4().makeScale(0.15,0.15,0.15));
                let tempGroup = leaf.clone();
                tempGroup.applyMatrix(currentTransform);
                group.add(tempGroup);
                currentTransform = transformStack.pop();
            // lower case letter f will move forward a step without drawing a line/cylinder
            }else if (c === 'f') {
                currentTransform.multiply(new THREE.Matrix4().makeTranslation(0,this.length,0));
            // ! changes the width of the line/cylinder
            } else if (c === '!') {
                this.setWidth(params[0]);
            // rotation operators +,-,&,^,\,/ and |
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
                //TODO optional rotate L vector from Drawer to a horizontal position
            // [ pushes the transformation matrix, width and length onto a stack
            } else if (c === '[') {
                transformStack.push(new THREE.Matrix4().copy(currentTransform));
                widthStack.push(this.width);
                lengthStack.push(this.length);
            // [ pops the transformation matrix, width and length from the stack
            } else if (c === ']') {
                currentTransform = transformStack.pop();
                this.width = widthStack.pop();
                this.length = lengthStack.pop();
            // operators for leafs
            // . pushes a new vertex onto into an array
            } else if (c === '.') {
                vertices.push(new THREE.Vector4().applyMatrix4(currentTransform));

                /*
                var geo = new THREE.SphereGeometry( 1, 32, 32 );
                var mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
                var sphere = new THREE.Mesh( geo, mat );
                sphere.applyMatrix(currentTransform);
                scene.add( sphere );
                */

            // { pushes the current vertices array onto a stack and creates a new array
            } else if (c === '{') {
                polygonStack.push(vertices.slice(0));
                vertices = [];
            // } draws a polygon with the current vertices in the array and pops the old vertices from the stack
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

                group.add( new THREE.Mesh( g, m ) );
                vertices = polygonStack.pop();
            }
        }
        return group;
    }
}

/**
 * @class StringBuffer
 * @constructor
 * @description to improve the run time
 */
function StringBuffer() {
    this.buffer = new Array;
}

/**
 * @description basic functions for the StringBuffer
 * @type {{append: StringBuffer.append, toString: StringBuffer.toString, clear: StringBuffer.clear}}
 */
StringBuffer.prototype = {
    /**
     * @description appends a String to the buffer
     * @param {String} s
     */
    append: function (s) {
        this.buffer.push(s);
    },

    /**
     * @description returns the joined String from the buffer
     * @returns {String}
     */
    toString: function () {
        return this.buffer.join("");
    },

    /**
     * @description clears the buffer
     */
    clear: function () {
        this.buffer.length = 0;
    }
};