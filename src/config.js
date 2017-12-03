const config = {
  author: "Sergey Mitchenko",
  title: "Naked Tree in a cold Winter",
  instructions: "Die Generierung basiert auf dem Lindenmayer-System. Dabei wird ein Startwort(Axiom) und Regeln festgelegt. " +
  "Die Regeln ersetzen dann einzelne Buchstaben vom aktuellen Wort mit einer in der Regel definierten Zeichenfolge. " +
  "Der generierte String wird anschließend gezeichnet (einstellbare Parameter: Farbe, Breite, Länge). " +
  "Die Anzahl der Generierungen kann im Menü unter dem Punkt 'Number' festgelegt werden (ich empfehle die Nummer nicht zu hoch zu setzen, da sonst es sehr lange dauern kann bis das LSystem gezeichnet wird). " +
  "Unter dem Punkt 'Rule' kann man vordefinierte Regeln ausprobieren und sich generieren lassen. " +
  "Man kann auch selber sich eine Regel erstellen/ausdenken, indem man 'Custom' im 'Rule' Menü auswählt, und dann im 'Rule Folder' sich Regeln definiert. " +
  "Ganz oben im Menü kann man den Renderer auswählen (SVG oder WebGL), wobei ich den WebGl Renderer empfehle, da er schneller ist (SVG ist drin, damit man eine SVG-Grafik generieren kann). " +
  "Zusätzlich kann man die Kamera kontrollieren, indem man ihre Höhe und Distanz einstellt. Zusätzlich gibt es die Option die Kamera um das Objekt rotieren zu lassen"
};

export default config;
