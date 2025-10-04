const cron = require('node-cron');
const JobsScraper = require('./jobs-scraper');
const fs = require('fs').promises;
const path = require('path');

class JobsScheduler {
  constructor() {
    this.scraper = new JobsScraper();
    this.isRunning = false;
    this.lastRun = null;
    this.scheduleLog = [];
    this.batchSize = 20; // Process 20 cities at a time (reduced for Craigslist)
    this.currentBatch = 0;
    this.totalBatches = 0;
    this.logFile = path.join(__dirname, 'data', 'jobs-scheduler.log');
  }

  // Initialize the scheduler
  async initialize() {
    try {
      await this.loadCities();
      this.totalBatches = Math.ceil(this.scraper.cities.length / this.batchSize);
      console.log(`📅 Jobs Scheduler initialized: ${this.scraper.cities.length} cities, ${this.totalBatches} batches`);
      
      // Load last run info
      await this.loadLastRun();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize jobs scheduler:', error);
      return false;
    }
  }

  // Load cities data
  async loadCities() {
    try {
      await this.scraper.loadCities();
    } catch (error) {
      throw new Error(`Failed to load cities: ${error.message}`);
    }
  }

  // Load last run information
  async loadLastRun() {
    try {
      const lastRunFile = path.join(__dirname, 'data', 'jobs-last-run.json');
      const data = await fs.readFile(lastRunFile, 'utf8');
      const lastRunData = JSON.parse(data);
      
      this.lastRun = lastRunData.lastRun;
      this.currentBatch = lastRunData.currentBatch || 0;
      
      console.log(`📊 Last run: ${this.lastRun}, Current batch: ${this.currentBatch}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading last run data:', error);
      }
      // If file doesn't exist, start from beginning
      this.currentBatch = 0;
    }
  }

  // Save last run information
  async saveLastRun() {
    try {
      const lastRunFile = path.join(__dirname, 'data', 'jobs-last-run.json');
      const data = {
        lastRun: new Date().toISOString(),
        currentBatch: this.currentBatch,
        totalBatches: this.totalBatches
      };
      
      await fs.writeFile(lastRunFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving last run data:', error);
    }
  }

  // Log scheduler activity
  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}`;
    
    console.log(logEntry);
    
    // Add to in-memory log
    this.scheduleLog.push({
      timestamp,
      level,
      message
    });
    
    // Keep only last 1000 log entries
    if (this.scheduleLog.length > 1000) {
      this.scheduleLog = this.scheduleLog.slice(-1000);
    }
    
    // Write to file
    try {
      await fs.appendFile(this.logFile, logEntry + '\n');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  // Run a single batch of job scraping
  async runBatch() {
    if (this.isRunning) {
      await this.log('Skipping batch - already running', 'WARN');
      return { success: false, message: 'Already running' };
    }

    try {
      this.isRunning = true;
      const startTime = new Date();
      
      await this.log(`Starting batch ${this.currentBatch + 1}/${this.totalBatches}`);
      
      const startIndex = this.currentBatch * this.batchSize;
      const result = await this.scraper.run(this.batchSize, startIndex);
      
      const duration = new Date() - startTime;
      
      if (result.success) {
        this.currentBatch++;
        
        // If we've completed all batches, reset to 0 for next cycle
        if (this.currentBatch >= this.totalBatches) {
          this.currentBatch = 0;
          await this.log(`Completed full cycle! Processed ${this.scraper.cities.length} cities`, 'SUCCESS');
        } else {
          await this.log(`Completed batch ${this.currentBatch}/${this.totalBatches} in ${duration}ms`);
        }
        
        await this.saveLastRun();
        
        return {
          success: true,
          batch: this.currentBatch,
          totalBatches: this.totalBatches,
          duration,
          stats: result.stats
        };
      } else {
        await this.log(`Batch failed: ${result.error}`, 'ERROR');
        return { success: false, error: result.error };
      }
      
    } catch (error) {
      await this.log(`Batch error: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    } finally {
      this.isRunning = false;
    }
  }

  // Start scheduled scraping
  startScheduler() {
    // Run every 30 minutes
    const task = cron.schedule('*/30 * * * *', async () => {
      await this.log('Scheduled job scraping triggered');
      await this.runBatch();
    }, {
      scheduled: false
    });

    // Run every 2 hours (more frequent for testing)
    const frequentTask = cron.schedule('0 */2 * * *', async () => {
      await this.log('Frequent job scraping triggered');
      await this.runBatch();
    }, {
      scheduled: false
    });

    // Start the tasks
    task.start();
    frequentTask.start();
    
    this.cronTask = task;
    this.frequentTask = frequentTask;
    
    console.log('🕐 Jobs scheduler started - running every 30 minutes and every 2 hours');
    
    return { task, frequentTask };
  }

  // Stop the scheduler
  stopScheduler() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }
    
    if (this.frequentTask) {
      this.frequentTask.stop();
      this.frequentTask = null;
    }
    
    console.log('🛑 Jobs scheduler stopped');
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      currentBatch: this.currentBatch,
      totalBatches: this.totalBatches,
      progress: this.totalBatches > 0 ? ((this.currentBatch / this.totalBatches) * 100).toFixed(1) + '%' : '0%',
      isScheduled: !!(this.cronTask && this.frequentTask),
      recentLogs: this.scheduleLog.slice(-10) // Last 10 log entries
    };
  }

  // Manual trigger for immediate execution
  async triggerNow() {
    await this.log('Manual trigger requested', 'INFO');
    return await this.runBatch();
  }

  // Reset scheduler (start from beginning)
  async reset() {
    this.currentBatch = 0;
    this.lastRun = null;
    await this.saveLastRun();
    await this.log('Scheduler reset - starting from batch 0', 'INFO');
    
    return {
      success: true,
      message: 'Scheduler reset successfully'
    };
  }

  // Get detailed statistics
  async getStats() {
    try {
      const scraperStats = await this.scraper.getStats();
      const schedulerStatus = this.getStatus();
      
      return {
        ...schedulerStatus,
        scraper: scraperStats,
        nextScheduledRun: this.cronTask ? 'Every 30 minutes' : 'Not scheduled'
      };
    } catch (error) {
      return {
        error: error.message,
        ...this.getStatus()
      };
    }
  }
}

module.exports = JobsScheduler;

// CLI execution for testing
if (require.main === module) {
  const scheduler = new JobsScheduler();
  
  const command = process.argv[2];
  
  async function runCommand() {
    await scheduler.initialize();
    
    switch (command) {
      case 'start':
        scheduler.startScheduler();
        console.log('✅ Scheduler started');
        break;
        
      case 'run':
        const result = await scheduler.runBatch();
        console.log('Batch result:', result);
        break;
        
      case 'status':
        const status = scheduler.getStatus();
        console.log('Scheduler status:', JSON.stringify(status, null, 2));
        break;
        
      case 'reset':
        const resetResult = await scheduler.reset();
        console.log('Reset result:', resetResult);
        break;
        
      case 'stats':
        const stats = await scheduler.getStats();
        console.log('Detailed stats:', JSON.stringify(stats, null, 2));
        break;
        
      default:
        console.log('Available commands: start, run, status, reset, stats');
    }
  }
  
  runCommand()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Command failed:', error);
      process.exit(1);
    });
}
