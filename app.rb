require "rubygems"
require "bundler/setup"
require "sinatra"
require "json"
require "open-uri"
require "cgi"

get "/" do
  File.read("public/index.html")
end

get "/proxy" do
  href = params[:href]
  content = open(href).read
  content.sub(/<html[^>]*>/, %[\\1<base href="#{CGI.escape_html(href)}">])
end

get "/proxy/:url" do
end

get "/target/factorial.js" do
  mustaches = {}
  content = Dir["**/*.{js,mustache}"].inject([]) do |memo, path|
    case path
    when /js$/
      memo << File.read(path)
    when /mustache$/
      mustaches[File.basename(path, ".mustache")] = File.read(path)
    end
    memo
  end.join("\n;\n")
  content = "window.mustaches = #{mustaches.to_json};\n#{content}"
end