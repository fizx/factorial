#!/usr/bin/env ruby

abort "Usage: #{$0} DIR TARGET" if ARGV.length < 2

require "rubygems"
require "bundler/setup"
require "eventmachine"
require "logger"
require "fileutils"
require "json"

LOG = Logger.new(STDOUT)
GLOB = File.expand_path(ARGV[0]) + "/**/*.{js,mustache}"
TARGET = File.expand_path(ARGV[1])
WATCHES = []

module Handler
  def file_modified
    LOG.info "#{path} modified"
    reload
  end

  def file_moved
    LOG.info "#{path} moved"
    reload
  end

  def file_deleted
    LOG.info "#{path} deleted"
    reload
  end

  def unbind
    LOG.info "#{path} monitoring ceased"
  end
  
  def reload
    WATCHES.each(&:stop_watching)
    WATCHES.clear
    files = Dir[GLOB] - [TARGET]
    mustaches = {}
    content = files.inject([]) do |memo, path|
      WATCHES << EM.watch_file(path, Handler)
      
      case path
      when /js$/
        memo << File.read(path)
      when /mustache$/
        mustaches[File.basename(path, ".mustache")] = File.read(path)
      end
      memo
    end.join("\n;\n")
    
    content = "window.mustaches = #{mustaches.to_json};\n#{content}"
    
    File.open(TARGET, "w") {|f| f.puts(content)}
    LOG.info "reloaded #{TARGET} from:"
    files.map do |file|
      LOG.info "\t#{file}"
    end
  end
  
  extend self
end

EM.kqueue = true if EM.kqueue?

EM.run {
  Handler.reload
  EM.add_periodic_timer(60) { Handler.reload }
  LOG.info "running"
}