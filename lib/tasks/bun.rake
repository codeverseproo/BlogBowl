namespace :javascript do
  task :install_bun do
    bun_path = File.expand_path('~/.bun/bin/bun')
    unless File.exist?(bun_path)
      puts "Installing bun..."
      system('curl -fsSL https://bun.sh/install | bash') || raise("Failed to install bun")
    end
    ENV['PATH'] = "#{File.dirname(bun_path)}:#{ENV['PATH']}"
  end
end

if Rake::Task.task_defined?('javascript:install')
  Rake::Task['javascript:install'].enhance ['javascript:install_bun']
end

