function Grid($iframe, x, y) {
  var that = this;
  this.$iframe = $iframe;
  this.$frameDocument = top[$iframe.attr("name")].document;
  this.x = x;
  this.y = y;
  console.log($(this.$frameDocument).height());
  this.$grid = $("<div>f</div>").addClass("grid").addClass("f_ignore");
  this.$grid.css("height", $(this.$frameDocument).height() + "px");

  var p = new PNGlib(x, y, 256);
  p.color(0,0,0,0);
  for(var i = 0; i < x; i++) {
    p.buffer[p.index(i, y-1)] = p.color(0,0,0);
  }
  for(var i = 0; i < y; i++) {
    p.buffer[p.index(x-1, i)] = p.color(0,0,0);
  }
  this.$grid.css("background-image", "url(\"data:image/png;base64," + p.getBase64() +"\")");
  this.$iframe.contents().find("body").append(this.$grid);
  this.$iframe.contents().find("*").not(".f_ignore").each(function(){
    var $element = $(this);
    if($element.css("display") == 'block') {
      var pos = $element.position();
      console.log("hi");
      if(pos.left % x != 0 || 
         pos.top % y != 0 || 
         $element.outerWidth() % x != 0 ||
         $element.outerHeight() % y != 0
         ){
         new Overlay(that.$iframe).unclosable().error().updateElement($element).closeClick(this, function(event){
           // that.toggleStaticOverlay($element);
           // that.updateImpliedSelector();
         });
      }
    }
  });
}
