function Factorial(){}

window.factorial = Factorial;

/**
 * Global settings, editable via settings pane.  Also has callbacks for when
 */
Factorial.settingsData = [
  new Setting("push-html",
              "Flyout menu appears next to the page, rather than above it",
              true,
              function(settings, value){
                settings.flyout.setIsCoveringPage(value);
              })
];

Factorial.main = function(src, $iframe) {
  var that = this;
  this.$iframe = $iframe
  $iframe.attr("src", src);
  $iframe.load(function(){
    that.$page = $("#page");
    that.$iframe = $iframe;
    that.flyout = new Flyout($("#flyout"), 80, that.$page);
    that.settings = new Settings($("#settings"), that.flyout, that.settingsData);
    that.inspect = new Inspector($("#inspect"), that.$iframe, that.flyout);
    that.grid = new Grid(that.$iframe, 20, 20);
    Util.appendStyles(that.$iframe, "css/inner.css")
  })
}

/**
 * Covers up the main workspace with a semi-transparent div
 */
Factorial.modal = function(enable) {
  if (enable) {
    $("#modal").show();
  } else {
    $("#modal").hide();
  }
}