const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const EscalationSystem = require('./escalation-system');

class IntelligentAgentRunner {
    constructor() {
        this.escalation = new EscalationSystem();
        this.escalation.loadLog();
        
        this.running = false;
        this.currentTask = null;
        this.taskStartTime = null;
        this.taskErrors = [];
        this.successHistory = [];
        
        this.config = {
            maxCycles: process.env.MAX_CYCLES || 100,
            pauseBetweenCycles: 5000,
            taskTimeout: 10 * 60 * 1000, // 10 dakika
            autoEscalation: true,
            thinkingModeThreshold: 5 // 5 başarısız deneme sonrası thinking mode
        };
        
        this.logFile = path.join(__dirname, '../logs/intelligent-runner.log');
    }

    /**
     * Görev karmaşıklığını analiz et
     */
    analyzeTaskComplexity(task) {
        const complexityFactors = {
            keywords: {
                'security': 3,
                'database': 2,
                'migration': 2,
                'production': 3,
                'critical': 3,
                'refactor': 2,
                'architecture': 3,
                'performance': 2,
                'test': 1,
                'bug': 1
            },
            patterns: {
                'multi-step': 2,
                'integration': 2,
                'cross-module': 2,
                'concurrent': 3,
                'distributed': 3
            }
        };
        
        let complexity = 1; // Base complexity
        
        const taskText = task.toLowerCase();
        
        // Keyword bazlı analiz
        for (const [keyword, score] of Object.entries(complexityFactors.keywords)) {
            if (taskText.includes(keyword)) {
                complexity += score;
            }
        }
        
        // Pattern bazlı analiz
        for (const [pattern, score] of Object.entries(complexityFactors.patterns)) {
            if (taskText.includes(pattern)) {
                complexity += score;
            }
        }
        
        // Dosya sayısı ve uzunluk bazlı
        if (taskText.length > 500) complexity += 1;
        if (taskText.split('\n').length > 20) complexity += 1;
        
        return Math.min(complexity, 10); // Max 10
    }

    /**
     * Model seçimi ve eskalasyon
     */
    selectModel(task, context = {}) {
        const complexity = this.analyzeTaskComplexity(task);
        const errorCount = this.taskErrors.length;
        const elapsed = this.taskStartTime ? Date.now() - this.taskStartTime : 0;
        const successRate = this.calculateRecentSuccessRate();
        
        const escalationContext = {
            errorCount,
            complexity,
            elapsed: elapsed / 1000, // saniye
            successRate,
            taskType: this.detectTaskType(task),
            previousFailures: this.taskErrors.slice(-5)
        };
        
        const result = this.escalation.escalate(escalationContext);
        
        this.log({
            action: 'model_selection',
            task: task.substring(0, 100) + '...',
            complexity,
            errorCount,
            elapsed,
            successRate,
            escalation: result,
            timestamp: new Date().toISOString()
        });
        
        return result;
    }

    /**
     * Görev tipini algıla
     */
    detectTaskType(task) {
        const taskText = task.toLowerCase();
        
        if (taskText.includes('security') || taskText.includes('auth') || taskText.includes('jwt')) return 'security';
        if (taskText.includes('database') || taskText.includes('sql') || taskText.includes('migration')) return 'database';
        if (taskText.includes('production') || taskText.includes('deploy')) return 'production';
        if (taskText.includes('critical') || taskText.includes('urgent')) return 'critical';
        if (taskText.includes('performance') || taskText.includes('optimization')) return 'performance';
        if (taskText.includes('architecture') || taskText.includes('design')) return 'architecture';
        if (taskText.includes('test')) return 'test';
        
        return 'general';
    }

    /**
     * Son başarı oranını hesapla
     */
    calculateRecentSuccessRate() {
        const recentHistory = this.successHistory.slice(-10); // Son 10 görev
        if (recentHistory.length === 0) return 1.0;
        
        const successCount = recentHistory.filter(success => success).length;
        return successCount / recentHistory.length;
    }

    /**
     * Thinking mode aktivasyonu
     */
    shouldActivateThinkingMode() {
        const recentFailures = this.taskErrors.slice(-this.config.thinkingModeThreshold);
        const consecutiveFailures = recentFailures.length >= this.config.thinkingModeThreshold;
        
        const currentComplexity = this.currentTask ? this.analyzeTaskComplexity(this.currentTask) : 0;
        const highComplexity = currentComplexity >= 8;
        
        const lowSuccessRate = this.calculateRecentSuccessRate() < 0.3;
        
        return consecutiveFailures || (highComplexity && lowSuccessRate);
    }

    /**
     * Görev çalıştır
     */
    async executeTask(task, model) {
        this.currentTask = task;
        this.taskStartTime = Date.now();
        
        const command = this.buildCommand(task, model);
        
        this.log({
            action: 'task_start',
            task: task.substring(0, 200),
            model: model.model,
            tier: model.currentTier,
            thinking: model.model.thinking,
            timestamp: new Date().toISOString()
        });
        
        return new Promise((resolve, reject) => {
            const process = spawn('node', command.args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: path.join(__dirname, '..')
            });
            
            let output = '';
            let error = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            process.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            const timeout = setTimeout(() => {
                process.kill();
                reject(new Error('Task timeout'));
            }, this.config.taskTimeout);
            
            process.on('close', (code) => {
                clearTimeout(timeout);
                
                const duration = Date.now() - this.taskStartTime;
                const success = code === 0;
                
                this.successHistory.push(success);
                
                if (!success) {
                    this.taskErrors.push({
                        task: task.substring(0, 100),
                        error: error,
                        code,
                        timestamp: new Date().toISOString()
                    });
                }
                
                this.log({
                    action: 'task_complete',
                    success,
                    duration,
                    code,
                    output: output.substring(0, 500),
                    error: error.substring(0, 200),
                    timestamp: new Date().toISOString()
                });
                
                // Başarılı görev sonrası deescalation
                if (success && this.escalation.currentTier > 1) {
                    const deResult = this.escalation.deescalate();
                    this.log({
                        action: 'auto_deescalation',
                        result: deResult,
                        timestamp: new Date().toISOString()
                    });
                }
                
                resolve({
                    success,
                    output,
                    error,
                    duration,
                    code
                });
            });
            
            // Thinking mode ise özel prompt
            if (model.model.thinking) {
                const thinkingPrompt = this.buildThinkingPrompt(task);
                process.stdin.write(thinkingPrompt);
            } else {
                process.stdin.write(task);
            }
            
            process.stdin.end();
        });
    }

    /**
     * Thinking mode için özel prompt
     */
    buildThinkingPrompt(task) {
        return `
🧠 THINKING MODE ACTIVATED 🧠

You are now in advanced thinking mode. Please approach this task with deep analysis:

TASK: ${task}

Please think through this systematically:
1. Break down the problem into components
2. Consider multiple approaches 
3. Anticipate potential issues
4. Plan the implementation steps
5. Consider edge cases and error handling

Take your time to reason through this thoroughly before proceeding.

---
${task}
        `;
    }

    /**
     * Komut oluştur
     */
    buildCommand(task, model) {
        // Temel codex-runner komutu
        const args = ['codex-runner.js'];
        
        // Model parametresi
        if (model.model.name) {
            args.push('--model', model.model.name);
        }
        
        // Thinking mode parametresi
        if (model.model.thinking) {
            args.push('--thinking');
        }
        
        // Görev dosyası oluştur
        const taskFile = path.join(__dirname, '../temp/current-task.md');
        this.ensureDir(path.dirname(taskFile));
        fs.writeFileSync(taskFile, task);
        args.push('--task', taskFile);
        
        return { args };
    }

    /**
     * Ana çalışma döngüsü
     */
    async start() {
        this.running = true;
        this.log({ action: 'runner_start', timestamp: new Date().toISOString() });
        
        let cycleCount = 0;
        
        while (this.running && cycleCount < this.config.maxCycles) {
            cycleCount++;
            
            try {
                // Thinking mode kontrolü
                if (this.shouldActivateThinkingMode()) {
                    const thinkingResult = this.escalation.activateThinkingMode('Auto-activation due to failures');
                    this.log({
                        action: 'thinking_mode_auto_activated',
                        result: thinkingResult,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Görev al (bu kısmı gerçek görev sistemine bağlayın)
                const task = await this.getNextTask();
                if (!task) {
                    this.log({ action: 'no_task_available', cycle: cycleCount });
                    break;
                }
                
                // Model seç
                const modelSelection = this.selectModel(task);
                
                // Görevi çalıştır
                const result = await this.executeTask(task, modelSelection);
                
                // Sonuçları değerlendir
                this.evaluateResult(result, task, modelSelection);
                
                // Döngü arası mola
                if (this.running) {
                    await this.sleep(this.config.pauseBetweenCycles);
                }
                
            } catch (error) {
                this.log({
                    action: 'cycle_error',
                    cycle: cycleCount,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
                this.taskErrors.push({
                    cycle: cycleCount,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        this.stop();
    }

    /**
     * Sonucu değerlendir
     */
    evaluateResult(result, task, modelSelection) {
        const evaluation = {
            cycle: this.successHistory.length,
            success: result.success,
            duration: result.duration,
            model: modelSelection.model.name,
            tier: modelSelection.currentTier,
            thinking: modelSelection.model.thinking,
            escalated: modelSelection.escalated,
            timestamp: new Date().toISOString()
        };
        
        this.log({
            action: 'result_evaluation',
            evaluation,
            escalationStatus: this.escalation.getStatus()
        });
    }

    /**
     * Sonraki görevi al (placeholder)
     */
    async getNextTask() {
        // Bu kısmı gerçek görev sisteminize göre uyarlayın
        const sampleTasks = [
            'Run comprehensive test suite and verify all components',
            'Check database integrity and run migrations if needed',
            'Analyze code quality and suggest improvements',
            'Review security configuration and update if necessary',
            'Generate performance report and optimize bottlenecks'
        ];
        
        const randomTask = sampleTasks[Math.floor(Math.random() * sampleTasks.length)];
        return randomTask;
    }

    /**
     * Runner'ı durdur
     */
    stop() {
        this.running = false;
        
        const finalStatus = this.escalation.getStatus();
        
        this.log({
            action: 'runner_stop',
            finalStatus,
            totalTasks: this.successHistory.length,
            successRate: this.calculateRecentSuccessRate(),
            totalErrors: this.taskErrors.length,
            timestamp: new Date().toISOString()
        });
        
        console.log('\n🏁 Intelligent Agent Runner Stopped');
        console.log('Final Status:', JSON.stringify(finalStatus, null, 2));
    }

    /**
     * Yardımcı fonksiyonlar
     */
    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    log(data) {
        const logEntry = JSON.stringify(data) + '\n';
        
        this.ensureDir(path.dirname(this.logFile));
        fs.appendFileSync(this.logFile, logEntry);
        
        console.log(`[${new Date().toISOString()}] ${data.action}:`, data);
    }
}

// CLI kullanımı
if (require.main === module) {
    const runner = new IntelligentAgentRunner();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            runner.start();
            break;
            
        case 'status':
            console.log('🎯 Current Escalation Status:');
            console.log(JSON.stringify(runner.escalation.getStatus(), null, 2));
            break;
            
        case 'thinking':
            const result = runner.escalation.activateThinkingMode('Manual CLI activation');
            console.log('🧠 Thinking Mode Activated:', result);
            break;
            
        default:
            console.log(`
🚀 Intelligent Agent Runner with Multi-Tier Escalation

Commands:
  node intelligent-runner.js start      - Start the intelligent agent
  node intelligent-runner.js status     - Show current status
  node intelligent-runner.js thinking   - Activate thinking mode

Features:
  ✅ Multi-tier model escalation (GPT-4o-mini → GPT-5 + Thinking)
  ✅ Automatic complexity analysis
  ✅ Failure-based escalation
  ✅ Success-based deescalation  
  ✅ Thinking mode auto-activation
  ✅ Cost optimization
  ✅ Comprehensive logging

Escalation Triggers:
  • Error count ≥ 3
  • Task complexity ≥ 7/10
  • Duration > 5 minutes
  • Success rate < 70%
  • High-priority task types
            `);
    }
}

module.exports = IntelligentAgentRunner;
