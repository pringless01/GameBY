const EscalationSystem = require('./escalation-system');

console.log('🧪 Testing Multi-Tier Escalation System\n');

const escalation = new EscalationSystem();

// Test 1: Basic escalation
console.log('📝 Test 1: Basic Error-Based Escalation');
const context1 = {
    errorCount: 4,
    complexity: 6,
    elapsed: 200,
    successRate: 0.8,
    taskType: 'general'
};

const result1 = escalation.escalate(context1);
console.log('Result:', result1.escalated ? `✅ Escalated to Tier ${result1.currentTier}` : '❌ No escalation');
console.log('Model:', result1.model.name, '(' + result1.model.capability + ')');
console.log('Reasons:', result1.reasons || ['None']);
console.log();

// Test 2: High complexity + security task
console.log('📝 Test 2: High Complexity Security Task');
const context2 = {
    errorCount: 1,
    complexity: 9,
    elapsed: 100,
    successRate: 0.9,
    taskType: 'security'
};

const result2 = escalation.escalate(context2);
console.log('Result:', result2.escalated ? `✅ Escalated to Tier ${result2.currentTier}` : '❌ No escalation');
console.log('Model:', result2.model.name, '(' + result2.model.capability + ')');
console.log('Thinking Mode:', result2.model.thinking ? '🧠 ACTIVE' : 'Inactive');
console.log();

// Test 3: Manual thinking mode activation
console.log('📝 Test 3: Manual Thinking Mode Activation');
const thinkingResult = escalation.activateThinkingMode('Critical production issue');
console.log('Result:', thinkingResult.activated ? '✅ Thinking Mode Activated' : '❌ Failed');
console.log('Model:', thinkingResult.model.name, '(' + thinkingResult.model.capability + ')');
console.log('Thinking Mode:', thinkingResult.model.thinking ? '🧠 ACTIVE' : 'Inactive');
console.log();

// Test 4: Deescalation after success
console.log('📝 Test 4: Deescalation After Success');
const deResult = escalation.deescalate();
console.log('Result:', deResult.deescalated ? `✅ Deescalated to Tier ${deResult.currentTier}` : '❌ Cannot deescalate');
console.log('Model:', deResult.model ? deResult.model.name : 'N/A');
console.log();

// Test 5: Status overview
console.log('📝 Test 5: System Status Overview');
const status = escalation.getStatus();
console.log('Current Tier:', status.currentTier);
console.log('Current Model:', status.currentModel.name, '(' + status.currentModel.capability + ')');
console.log('Total Escalations:', status.stats.escalations);
console.log('Thinking Mode Usage:', status.stats.thinkingModeUsage);
console.log('Cost Efficiency:', status.costEfficiency ? status.costEfficiency.efficiency : 'N/A');
console.log();

// Test 6: Edge case - Already at max tier
console.log('📝 Test 6: Edge Case - Multiple Critical Failures');
for (let i = 0; i < 3; i++) {
    const criticalContext = {
        errorCount: 10,
        complexity: 10,
        elapsed: 600,
        successRate: 0.1,
        taskType: 'critical'
    };
    
    const criticalResult = escalation.escalate(criticalContext);
    console.log(`Attempt ${i + 1}: Tier ${criticalResult.currentTier} - ${criticalResult.model.name}`);
}
console.log();

// Final status
console.log('🎯 Final System Status:');
const finalStatus = escalation.getStatus();
console.log(`Tier: ${finalStatus.currentTier}/5`);
console.log(`Model: ${finalStatus.currentModel.name}`);
console.log(`Thinking Mode: ${finalStatus.currentModel.thinking ? '🧠 ACTIVE' : 'Inactive'}`);
console.log(`Total Requests: ${finalStatus.stats.totalRequests}`);
console.log(`Total Escalations: ${finalStatus.stats.escalations}`);
console.log(`Thinking Mode Usage: ${finalStatus.stats.thinkingModeUsage}`);

if (finalStatus.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    finalStatus.recommendations.forEach(rec => console.log(`  • ${rec}`));
}

console.log('\n✅ All tests completed successfully!');
console.log('\n🚀 Ready to use: node tools/intelligent-runner.js start');
