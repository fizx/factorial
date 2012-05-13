function Factorial() {};

Factorial.prototype.add = function(widget) {
  
}

function Spring($node) {
  var overlay = $("<div></div>").attr("class", "overlay").css("position", "absolute");
  var button = $("<div>&#x25BE;</div>").attr("class", "button").css("position", "absolute");
  var arrow = $("<div>lorem ipsum foo bar baz bonk</div>").attr("class", "arrow_box")
  overlay.offset($node.position());
  overlay.width($node.width());
  overlay.height($node.height());
  button.append(arrow);
  overlay.append(button);
  $node.append(overlay);
};