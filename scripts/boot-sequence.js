#!/usr/bin/env node

/**
 * Little Harvest - Complete Boot Sequence
 * 
 * This script handles the complete startup sequence for:
 * - Database initialization and migration
 * - Development server startup
 * - Production server startup
 * - Health checks and monitoring
 * - Service dependencies
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  DATABASE_TYPE: process.env.DATABASE_TYPE || 'sqlite',
  
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Services
  SERVICES: {
    database: true,
    server: true,
    monitoring: true,
    healthCheck: true
  },
  
  // Timeouts
  TIMEOUTS: {
    database: 30000,    // 30 seconds
    server: 60000,     // 60 seconds
    healthCheck: 10000 // 10 seconds
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class BootSequence {
  constructor() {
    this.processes = new Map();
    this.startTime = Date.now();
    this.isShuttingDown = false;
  }

  log(message, color = 'reset') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
  }

  logStep(step, message) {
    this.log(`🚀 ${step}: ${message}`, 'cyan');
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async checkFileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async checkPortAvailable(port) {
    try {
      const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
      return !stdout.includes(`:${port}`);
    } catch {
      return true; // Assume available if check fails
    }
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async initializeDatabase() {
    this.logStep('DATABASE', 'Initializing database...');

    try {
      // Check if Prisma schema exists
      const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
      if (!(await this.checkFileExists(schemaPath))) {
        throw new Error('Prisma schema not found');
      }

      // Generate Prisma client
      this.log('📦 Generating Prisma client...', 'blue');
      await this.runCommand('npx', ['prisma', 'generate']);

      // Push database schema
      this.log('🗄️  Pushing database schema...', 'blue');
      await this.runCommand('npx', ['prisma', 'db', 'push'], {
        env: { ...process.env, DATABASE_URL: CONFIG.DATABASE_URL }
      });

      // Seed database if in development
      if (CONFIG.NODE_ENV === 'development') {
        this.log('🌱 Seeding database...', 'blue');
        try {
          await this.runCommand('npm', ['run', 'db:seed']);
        } catch (error) {
          this.logWarning('Database seeding failed (this is optional)');
        }
      }

      this.logSuccess('Database initialized successfully');
      return true;
    } catch (error) {
      this.logError(`Database initialization failed: ${error.message}`);
      return false;
    }
  }

  async startDevelopmentServer() {
    this.logStep('SERVER', 'Starting development server...');

    try {
      // Check if port is available
      if (!(await this.checkPortAvailable(CONFIG.PORT))) {
        throw new Error(`Port ${CONFIG.PORT} is already in use`);
      }

      // Start Next.js development server
      const serverProcess = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: CONFIG.PORT }
      });

      this.processes.set('server', serverProcess);

      // Monitor server output
      serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready')) {
          this.logSuccess(`Development server started on port ${CONFIG.PORT}`);
        }
        if (output.includes('Local:')) {
          this.log(`🌐 Server URL: http://localhost:${CONFIG.PORT}`, 'green');
        }
      });

      serverProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Error') || output.includes('error')) {
          this.logError(`Server error: ${output}`);
        }
      });

      serverProcess.on('close', (code) => {
        if (!this.isShuttingDown) {
          this.logError(`Server process exited with code ${code}`);
        }
      });

      // Wait for server to be ready
      await this.sleep(5000);
      return true;
    } catch (error) {
      this.logError(`Failed to start development server: ${error.message}`);
      return false;
    }
  }

  async startProductionServer() {
    this.logStep('SERVER', 'Starting production server...');

    try {
      // Build the application first
      this.log('🔨 Building application...', 'blue');
      await this.runCommand('npm', ['run', 'build']);

      // Start production server
      const serverProcess = spawn('npm', ['run', 'start'], {
        stdio: 'pipe',
        shell: true,
        env: { ...process.env, PORT: CONFIG.PORT }
      });

      this.processes.set('server', serverProcess);

      serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready')) {
          this.logSuccess(`Production server started on port ${CONFIG.PORT}`);
        }
      });

      await this.sleep(3000);
      return true;
    } catch (error) {
      this.logError(`Failed to start production server: ${error.message}`);
      return false;
    }
  }

  async performHealthCheck() {
    this.logStep('HEALTH', 'Performing health check...');

    try {
      const healthUrl = `http://localhost:${CONFIG.PORT}/api/health`;
      
      // Simple health check using curl or fetch
      const response = await fetch(healthUrl);
      
      if (response.ok) {
        this.logSuccess('Health check passed');
        return true;
      } else {
        this.logWarning(`Health check returned status: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.logWarning(`Health check failed: ${error.message}`);
      return false;
    }
  }

  async startMonitoring() {
    this.logStep('MONITORING', 'Starting monitoring services...');

    try {
      // Start Prisma Studio if in development
      if (CONFIG.NODE_ENV === 'development') {
        const studioProcess = spawn('npx', ['prisma', 'studio'], {
          stdio: 'pipe',
          shell: true,
          detached: true
        });

        this.processes.set('studio', studioProcess);
        this.logSuccess('Prisma Studio started');
      }

      // Log system information
      this.log('📊 System Information:', 'blue');
      this.log(`   Environment: ${CONFIG.NODE_ENV}`, 'blue');
      this.log(`   Database: ${CONFIG.DATABASE_TYPE}`, 'blue');
      this.log(`   Port: ${CONFIG.PORT}`, 'blue');
      this.log(`   Process ID: ${process.pid}`, 'blue');

      return true;
    } catch (error) {
      this.logError(`Monitoring setup failed: ${error.message}`);
      return false;
    }
  }

  async gracefulShutdown() {
    this.logStep('SHUTDOWN', 'Initiating graceful shutdown...');
    this.isShuttingDown = true;

    // Shutdown all processes
    for (const [name, process] of this.processes) {
      this.log(`🛑 Stopping ${name}...`, 'yellow');
      process.kill('SIGTERM');
    }

    // Wait for processes to close
    await this.sleep(2000);

    // Force kill if still running
    for (const [name, process] of this.processes) {
      if (!process.killed) {
        this.log(`🔨 Force killing ${name}...`, 'red');
        process.kill('SIGKILL');
      }
    }

    this.logSuccess('All services stopped');
    process.exit(0);
  }

  async run() {
    this.log('🚀 Little Harvest Boot Sequence Starting...', 'bright');
    this.log(`⏰ Started at: ${new Date().toISOString()}`, 'blue');

    // Setup graceful shutdown
    process.on('SIGINT', () => this.gracefulShutdown());
    process.on('SIGTERM', () => this.gracefulShutdown());

    const results = {
      database: false,
      server: false,
      monitoring: false,
      healthCheck: false
    };

    try {
      // Step 1: Initialize Database
      if (CONFIG.SERVICES.database) {
        results.database = await this.initializeDatabase();
        if (!results.database) {
          throw new Error('Database initialization failed');
        }
      }

      // Step 2: Start Server
      if (CONFIG.SERVICES.server) {
        if (CONFIG.NODE_ENV === 'development') {
          results.server = await this.startDevelopmentServer();
        } else {
          results.server = await this.startProductionServer();
        }
        
        if (!results.server) {
          throw new Error('Server startup failed');
        }
      }

      // Step 3: Start Monitoring
      if (CONFIG.SERVICES.monitoring) {
        results.monitoring = await this.startMonitoring();
      }

      // Step 4: Health Check
      if (CONFIG.SERVICES.healthCheck) {
        await this.sleep(5000); // Wait for server to be ready
        results.healthCheck = await this.performHealthCheck();
      }

      // Summary
      const duration = Date.now() - this.startTime;
      this.log('🎉 Boot Sequence Complete!', 'bright');
      this.log(`⏱️  Total time: ${duration}ms`, 'blue');
      
      this.log('\n📋 Service Status:', 'bright');
      Object.entries(results).forEach(([service, status]) => {
        const statusText = status ? '✅ Running' : '❌ Failed';
        const color = status ? 'green' : 'red';
        this.log(`   ${service}: ${statusText}`, color);
      });

      if (CONFIG.NODE_ENV === 'development') {
        this.log('\n🌐 Access URLs:', 'bright');
        this.log(`   Application: http://localhost:${CONFIG.PORT}`, 'green');
        this.log(`   Prisma Studio: http://localhost:5555`, 'green');
        this.log(`   Admin Dashboard: http://localhost:${CONFIG.PORT}/admin`, 'green');
      }

      this.log('\n💡 Press Ctrl+C to stop all services', 'yellow');

    } catch (error) {
      this.logError(`Boot sequence failed: ${error.message}`);
      await this.gracefulShutdown();
    }
  }
}

// Main execution
if (require.main === module) {
  const bootSequence = new BootSequence();
  bootSequence.run().catch(console.error);
}

module.exports = BootSequence;
