function Overlay($parentFrame) {
  var that = this;
  this.$frameDocument = top[$parentFrame.attr("name")].document;
  this.$parent = $(this.$frameDocument.body);
  this.$overlay = $("<div></div>", this.$parent).addClass("overlay").addClass("f_ignore");
  this.$shader = $("<div></div>", this.$parent).addClass("f_ignore");
  this.$overlay.append(this.$shader);
  this.$parent.append(this.$overlay);
  this.$element = $();
  this.$close = $("<a>x</a>", this.$parent).addClass("close").addClass("f_ignore");
  this.$parent.append(this.$close);
  this.closable = true;
  
  this.$overlay.bind("mouseover.factorial", function(){
    that.$close.css({ opacity: 1 });
  });
  
  this.$overlay.bind("mouseout.factorial", function(){
    that.$close.css({ opacity: 0.1 });
  });
  
  this.$close.bind("mouseover.factorial", function(){
    that.$close.css({ opacity: 1 });
  });
  
  this.$close.bind("mouseout.factorial", function(){
    that.$close.css({ opacity: 0.1 });
  });
}

Overlay.prototype.updateElement = function($newElement) {
  if($newElement.size() == 1 && !$newElement.hasClass("f_ignore")) {
    this.$element = $newElement;
    this.$overlay.show();
    this.$overlay.css("left", $newElement.offset().left);
    this.$overlay.css("top", $newElement.offset().top);
    this.$overlay.width($newElement.outerWidth());
    this.$overlay.height($newElement.outerHeight());

    this.$close.css("left", $newElement.offset().left + $newElement.outerWidth());
    this.$close.css("top", $newElement.offset().top);
  } else {
    this.$element = $();
  }
  return this;
}

Overlay.prototype.activate = function() {
  var that = this;
  this.$overlay.addClass("active");
  this.$overlay.bind("mousemove.factorial", { that: that}, function(event){
    that.updateEvent(event);
  });
  this.unclosable();
  return this; 
}

Overlay.prototype.implied = function() {
  this.$overlay.addClass("implied");
  console.log("implied")
  return this;
}

Overlay.prototype.error = function() {
  this.$overlay.addClass("error");
  console.log("error")
  return this;
}

Overlay.prototype.unselectable = function() {
  this.$overlay.addClass("unselectable");
  console.log("unselectable");
  return this;
}

Overlay.prototype.warn = function() {
  this.$overlay.addClass("warn");
  return this; 
}


Overlay.prototype.deactivate = function() {
  this.$overlay.removeClass("active");
  this.$overlay.unbind("mousemove.factorial");
  if(this.closable) {
    this.$close.show();
  }
  return this;
}

Overlay.prototype.unclosable = function() {
  this.$close.hide();
  this.closable = false;
  return this;
}

Overlay.prototype.overlaid$Element = function() {
  return this.$element;
}

Overlay.prototype.updateEvent = function(event) {
  this.hide();
  var $newElement = $(this.$frameDocument.elementFromPoint(event.pageX, event.pageY));
  if(this.$parent.has($newElement[0]).size() == 0) {
    this.$element = $();
  } else if ($newElement.hasClass("f_ignore")) {
    // yup, ignoring.
  } else {
    this.updateElement($newElement);
  }
  return this;
}

Overlay.prototype.hide = function() {
  this.$overlay.hide();
  this.$close.hide();
  return this;
}

Overlay.prototype.click = function(context, cb) {
  this.$overlay.bind("click.factorial", {that: context}, cb);
  return this;
}

Overlay.prototype.trigger = function(event) {
  this.$overlay.trigger(event);
  return this;
}

Overlay.prototype.closeClick = function(context, cb) {
  this.$close.bind("click.factorial", {that: context}, cb);
  return this;
}

Overlay.prototype.show = function() {
  this.$overlay.show();
  if(this.closable) {
    this.$close.show();
  }
  return this;
}

Overlay.prototype.cleanUp = function() {
  this.$overlay.remove();
  this.$close.remove();
  return this;
}
