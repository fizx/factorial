function Grid($iframe, x, y, $root) {
  $root = $($root[0]);
  var that = this;
  this.$iframe = $iframe;
  this.$frameDocument = top[$iframe.attr("name")].document;
  this.x = x;
  this.y = y;
  this.draw();
  this._walk();
  this._overlays = [];
  // new Overlay(this.$iframe).unselectable().warn().updateElement($($root[0])).closeClick(function(){});
  this.rootTop = $root.position().top;
  this.rootLeft = $root.position().left;
}

Grid.prototype.renderErrors = function() {
  this.clearErrors();
  this._walk();
}

Grid.prototype.clearErrors = function() {
  $.each(this._overlays, function() {
    this.cleanUp();
  });
  this._overlays = [];
}

Grid.prototype._walk = function(){
  var that = this;
  this.$iframe.contents().find(".row").not(".f_ignore").each(function(){
    var $element = $(this);
    if($element.css("display") == 'block') {
      that._examine($element);
    }
  });  
}

Grid.prototype._examine = function($element){
  var pos = $element.position();
  if ($element.outerWidth() % this.x != 0 || $element.outerHeight() % this.y != 0) {
    // console.log("size fail" + $element.attr("id"));
    this._warnOrError($element, $());
  } else if(
      (pos.left - this.rootLeft) % this.x != 0 || 
      (pos.top - this.rootTop) % this.y != 0) {
    // console.log("pos fail" + $element.attr("id"));
    if ($element.css("position") == ""       || 
        $element.css("position") == "static" ||
        $element.css("float")    == "left"   ||
        $element.css("float")    == "right"  ) {
      var prev = $element.prev();
      if (prev.size() == 0) {
        prev = $element.parent();
      }
      this._warnOrError($element, prev);
    } else if ($element.css("position") == "absolute" || 
               $element.css("position") == "relative" ||
               $element.css("position") == "fixed"    ) {
      this._warnOrError($element, $element.offsetParent());
    } else {
      console.log("WTF");
    }
  }
}

Grid.prototype._warnOrError = function($element, $previous) {
  if($previous.data("grid-wrong")) {
    console.log("warn " + $element.attr("id") + ", " + $previous.attr("id"));
    this.warn($element);
  } else {
    console.log("err  " + $element.attr("id") + ", " + $previous.attr("id"));
    this.error($element);
  }
}


Grid.prototype.draw = function() {
  this.$grid = $("<div></div>").addClass("grid").addClass("f_ignore");
  this.$grid.css("height", $(this.$frameDocument).height() + "px");

  var p = new PNGlib(this.x,this. y, 256);
  p.color(0,0,0,0);
  for(var i = 0; i < this.x; i++) {
    p.buffer[p.index(i, this.y-1)] = p.color(0,0,0);
  }
  for(var i = 0; i < this.y; i++) {
    p.buffer[p.index(this.x-1, i)] = p.color(0,0,0);
  }  
  this.$iframe.contents().find("body").append(this.$grid);
  this.$grid.css("background-image", "url(\"data:image/png;base64," + p.getBase64() +"\")");
}

Grid.prototype.warn = function($element) {
  $element.data("grid-warn", true);
  $element.data("grid-wrong", true);
  new Overlay(this.$iframe).unclosable().unselectable().warn().updateElement($element);
}

Grid.prototype.error = function($element) {
  $element.data("grid-error", true);
  $element.data("grid-wrong", true);
  new Overlay(this.$iframe).unclosable().unselectable().error().updateElement($element);
}















