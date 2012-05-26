function Flyout($elem, x, $page){
  var that = this;
  this.owner = null;
  this.$elem = $elem;
  this.$page = $page
  this.isCoveringPage = false;
  this.x = x;
  this.enabled = false;
  this.$content = $("<div></div>").addClass("content");
  this.$dot = $("<div></div>").addClass("dot").click(function(){
    return false;
  }).draggable({
    axis: "x",
    start: function(event, ui) {
      Factorial.modal(true);
      that.$elem.width(that.$dot.position().left + that.$dot.width());
      that._update(true);
    },
    drag: function(event, ui) {
      that.$elem.width(that.$dot.position().left + that.$dot.width());
      that._update(true);
    },
    stop: function(event, ui) {
      that.$elem.width(that.$dot.position().left + that.$dot.width());
      that._update(true);
      Factorial.modal(false);
    }
  });
  this.$x = $("<a>x</a>").addClass("close").attr("href", "#").click(function(){
    that.disable();
    return false;
  });
  this.$elem.append(this.$dot);
  this.$elem.append(this.$content);
  this.$elem.append(this.$x);
}

Flyout.prototype.isEnabled = function() {
  return this.enabled;
}

Flyout.prototype.setIsCoveringPage = function(value) {
  this.isCoveringPage = value;
}

Flyout.prototype.setContent = function(html) {
  this.$content.html(html);
}

Flyout.prototype.get$Content = function() {
  return this.$content;
}

Flyout.prototype.enable = function(width, owner) {
  if(this.owner != owner) {
    this.disable();
  }
  this.owner = owner;
  this.enabled = true;
  if (width) {
    this.$elem.width(width);
  }
  this._update();
}

Flyout.prototype.disable = function() {
  if(this.owner) {
    this.owner.onFlyoutClose(this);
  }
  this.enabled = false;
  this._update();
}

Flyout.prototype._update = function() {
  var _x = this.enabled ? this.x : -9999;
  var _pageX = this.enabled ? this.x + this.$elem.width() : this.x;
  if(this.isCoveringPage) {
    this.$page.css("left", _pageX);
  } else {
    this.$page.css("left", this.x);
  }
  this.$content.width(this.$elem.width() - this.$dot.width());
  this.$dot.css("left", this.$elem.width() - this.$dot.width());
  this.$elem.css("left", _x);
  this.$x.css("left", this.$elem.width() - this.$dot.width());
}