/**
 * Multi-Tier Model Escalation System
 * GPT-4o-mini → GPT-4o → GPT-4 → GPT-5 → Thinking Mode
 * İhtiyaç dahilinde otomatik eskalasyon
 */

const fs = require('fs');
const path = require('path');

class EscalationSystem {
    constructor() {
        this.currentTier = 1;
        this.maxTier = 5;
        this.escalationLog = [];
        
        // Model seviyeleri
        this.tiers = {
            1: { name: 'gpt-4o-mini', cost: 1, capability: 'basic', thinking: false },
            2: { name: 'gpt-4o', cost: 3, capability: 'standard', thinking: false },
            3: { name: 'gpt-4', cost: 5, capability: 'advanced', thinking: false },
            4: { name: 'gpt-5', cost: 10, capability: 'expert', thinking: false },
            5: { name: 'gpt-5-thinking', cost: 25, capability: 'genius', thinking: true }
        };
        
        // Eskalasyon kriterleri
        this.escalationCriteria = {
            errorCount: 3,        // 3 hata → eskalasyon
            complexityScore: 7,   // Karmaşıklık skoru > 7 → eskalasyon
            timeThreshold: 300,   // 5 dakika → eskalasyon
            failureRate: 0.3     // %30 başarısızlık → eskalasyon
        };
        
        this.stats = {
            totalRequests: 0,
            escalations: 0,
            thinkingModeUsage: 0,
            costSaved: 0
        };
        
        this.logFile = path.join(__dirname, '../logs/escalation-log.json');
    }

    /**
     * Ana eskalasyon kararı
     */
    shouldEscalate(context) {
        const {
            errorCount = 0,
            complexity = 0,
            elapsed = 0,
            successRate = 1.0,
            taskType = 'general',
            previousFailures = []
        } = context;

        const reasons = [];
        
        // Hata sayısı kontrolü
        if (errorCount >= this.escalationCriteria.errorCount) {
            reasons.push(`Error count: ${errorCount}`);
        }
        
        // Karmaşıklık kontrolü
        if (complexity >= this.escalationCriteria.complexityScore) {
            reasons.push(`High complexity: ${complexity}/10`);
        }
        
        // Zaman kontrolü
        if (elapsed >= this.escalationCriteria.timeThreshold) {
            reasons.push(`Time threshold exceeded: ${elapsed}s`);
        }
        
        // Başarı oranı kontrolü
        if (successRate < (1 - this.escalationCriteria.failureRate)) {
            reasons.push(`Low success rate: ${(successRate * 100).toFixed(1)}%`);
        }
        
        // Özel görev tipleri için direct eskalasyon
        const highPriorityTasks = ['security', 'database', 'production', 'critical'];
        if (highPriorityTasks.includes(taskType)) {
            reasons.push(`High priority task: ${taskType}`);
        }
        
        return {
            shouldEscalate: reasons.length > 0,
            reasons,
            suggestedTier: this.calculateSuggestedTier(context, reasons.length)
        };
    }

    /**
     * Önerilen tier hesaplama
     */
    calculateSuggestedTier(context, reasonCount) {
        const { complexity = 0, taskType = 'general', errorCount = 0 } = context;
        
        let suggestedTier = this.currentTier;
        
        // Hata sayısına göre
        if (errorCount >= 5) suggestedTier = Math.max(suggestedTier, 4); // GPT-5
        else if (errorCount >= 3) suggestedTier = Math.max(suggestedTier, 3); // GPT-4
        
        // Karmaşıklığa göre
        if (complexity >= 9) suggestedTier = Math.max(suggestedTier, 5); // Thinking mode
        else if (complexity >= 7) suggestedTier = Math.max(suggestedTier, 4); // GPT-5
        
        // Görev tipine göre
        const taskTierMap = {
            'security': 4,
            'database': 3,
            'production': 4,
            'critical': 5,
            'architecture': 4,
            'performance': 3
        };
        
        if (taskTierMap[taskType]) {
            suggestedTier = Math.max(suggestedTier, taskTierMap[taskType]);
        }
        
        return Math.min(suggestedTier, this.maxTier);
    }

    /**
     * Model eskalasyonu gerçekleştir
     */
    escalate(context) {
        const decision = this.shouldEscalate(context);
        
        if (!decision.shouldEscalate) {
            return {
                escalated: false,
                currentTier: this.currentTier,
                model: this.tiers[this.currentTier],
                reason: 'No escalation needed'
            };
        }
        
        const newTier = Math.min(decision.suggestedTier, this.maxTier);
        const previousTier = this.currentTier;
        this.currentTier = newTier;
        
        const escalationRecord = {
            timestamp: new Date().toISOString(),
            from: this.tiers[previousTier],
            to: this.tiers[newTier],
            reasons: decision.reasons,
            context: { ...context, sensitive: undefined } // Hassas bilgileri çıkar
        };
        
        this.escalationLog.push(escalationRecord);
        this.stats.escalations++;
        this.stats.totalRequests++;
        
        if (newTier === 5) {
            this.stats.thinkingModeUsage++;
        }
        
        // Cost savings hesaplama (düşük tier kullanabilseydi ne kadar tasarruf)
        const wouldBeHighCost = this.tiers[this.maxTier].cost;
        const actualCost = this.tiers[newTier].cost;
        this.stats.costSaved += (wouldBeHighCost - actualCost);
        
        this.saveLog();
        
        return {
            escalated: true,
            previousTier,
            currentTier: newTier,
            model: this.tiers[newTier],
            reasons: decision.reasons,
            record: escalationRecord
        };
    }

    /**
     * Thinking mode özel aktivasyonu
     */
    activateThinkingMode(reason = 'manual activation') {
        const previousTier = this.currentTier;
        this.currentTier = 5;
        
        const record = {
            timestamp: new Date().toISOString(),
            action: 'thinking_mode_activated',
            from: this.tiers[previousTier],
            to: this.tiers[5],
            reason,
            special: true
        };
        
        this.escalationLog.push(record);
        this.stats.thinkingModeUsage++;
        this.saveLog();
        
        return {
            activated: true,
            previousTier,
            currentTier: 5,
            model: this.tiers[5],
            record
        };
    }

    /**
     * Tier'i geri düşür (başarılı operasyon sonrası)
     */
    deescalate() {
        if (this.currentTier <= 1) return { deescalated: false };
        
        const previousTier = this.currentTier;
        this.currentTier = Math.max(1, this.currentTier - 1);
        
        const record = {
            timestamp: new Date().toISOString(),
            action: 'deescalation',
            from: this.tiers[previousTier],
            to: this.tiers[this.currentTier],
            reason: 'successful_operation'
        };
        
        this.escalationLog.push(record);
        this.saveLog();
        
        return {
            deescalated: true,
            previousTier,
            currentTier: this.currentTier,
            model: this.tiers[this.currentTier],
            record
        };
    }

    /**
     * Mevcut durumu analiz et
     */
    getStatus() {
        const currentModel = this.tiers[this.currentTier];
        const recentEscalations = this.escalationLog.slice(-5);
        
        return {
            currentTier: this.currentTier,
            currentModel,
            stats: { ...this.stats },
            recentActivity: recentEscalations,
            costEfficiency: this.calculateCostEfficiency(),
            recommendations: this.generateRecommendations()
        };
    }

    /**
     * Maliyet verimliliği hesapla
     */
    calculateCostEfficiency() {
        if (this.stats.totalRequests === 0) return null;
        
        const avgTierUsed = this.escalationLog.reduce((sum, log) => {
            return sum + (log.to ? this.getTierNumber(log.to.name) : this.currentTier);
        }, 0) / Math.max(this.stats.totalRequests, 1);
        
        return {
            avgTierUsed: avgTierUsed.toFixed(2),
            costSaved: this.stats.costSaved,
            efficiency: `${((this.stats.costSaved / (this.stats.totalRequests * this.tiers[this.maxTier].cost)) * 100).toFixed(1)}%`
        };
    }

    /**
     * Öneriler üret
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (this.stats.thinkingModeUsage / Math.max(this.stats.totalRequests, 1) > 0.3) {
            recommendations.push('High thinking mode usage detected - consider task complexity reduction');
        }
        
        if (this.stats.escalations / Math.max(this.stats.totalRequests, 1) > 0.5) {
            recommendations.push('Frequent escalations - review initial task routing');
        }
        
        if (this.currentTier >= 4) {
            recommendations.push('Currently using high-tier model - monitor for deescalation opportunities');
        }
        
        return recommendations;
    }

    /**
     * Tier numarasını model adından çıkar
     */
    getTierNumber(modelName) {
        for (let tier in this.tiers) {
            if (this.tiers[tier].name === modelName) {
                return parseInt(tier);
            }
        }
        return 1;
    }

    /**
     * Log kaydet
     */
    saveLog() {
        try {
            const logData = {
                tiers: this.tiers,
                currentTier: this.currentTier,
                stats: this.stats,
                escalationLog: this.escalationLog.slice(-100), // Son 100 kayıt
                lastUpdated: new Date().toISOString()
            };
            
            const logsDir = path.dirname(this.logFile);
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            
            fs.writeFileSync(this.logFile, JSON.stringify(logData, null, 2));
        } catch (error) {
            console.error('Failed to save escalation log:', error.message);
        }
    }

    /**
     * Log yükle
     */
    loadLog() {
        try {
            if (fs.existsSync(this.logFile)) {
                const data = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
                this.currentTier = data.currentTier || 1;
                this.stats = { ...this.stats, ...data.stats };
                this.escalationLog = data.escalationLog || [];
            }
        } catch (error) {
            console.error('Failed to load escalation log:', error.message);
        }
    }
}

module.exports = EscalationSystem;

// CLI kullanımı
if (require.main === module) {
    const escalation = new EscalationSystem();
    escalation.loadLog();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            console.log('🎯 Escalation System Status:');
            console.log(JSON.stringify(escalation.getStatus(), null, 2));
            break;
            
        case 'thinking':
            const result = escalation.activateThinkingMode('CLI activation');
            console.log('🧠 Thinking Mode Activated:', result);
            break;
            
        case 'deescalate':
            const deResult = escalation.deescalate();
            console.log('⬇️ Deescalation:', deResult);
            break;
            
        case 'test':
            // Test senaryosu
            const testContext = {
                errorCount: 4,
                complexity: 8,
                elapsed: 350,
                successRate: 0.6,
                taskType: 'security'
            };
            
            const testResult = escalation.escalate(testContext);
            console.log('🧪 Test Escalation:', testResult);
            break;
            
        default:
            console.log(`
🚀 GameBY Multi-Tier Escalation System

Commands:
  node escalation-system.js status     - Show current status
  node escalation-system.js thinking   - Activate thinking mode
  node escalation-system.js deescalate - Step down one tier
  node escalation-system.js test       - Run test scenario

Tiers:
  1. GPT-4o-mini  (Basic, Cost: 1x)
  2. GPT-4o       (Standard, Cost: 3x)
  3. GPT-4        (Advanced, Cost: 5x)
  4. GPT-5        (Expert, Cost: 10x)
  5. GPT-5 Think  (Genius, Cost: 25x)
            `);
    }
}
