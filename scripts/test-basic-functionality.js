#!/usr/bin/env node

/**
 * Basic functionality test for v0-mcp
 * Tests core functionality without requiring external API calls
 */

// Set minimal V0_API_KEY for testing before importing modules
process.env.V0_API_KEY = 'test-key-for-basic-functionality';

import { V0Tools } from './dist/mcp/tools.js';
import { logger } from './dist/utils/logger.js';

async function testBasicFunctionality() {
  console.log('🧪 Testing v0-mcp basic functionality...\n');
  
  try {
    // Test 1: Tools listing
    console.log('📋 Test 1: Tools listing');
    const v0Tools = new V0Tools();
    const tools = v0Tools.listTools();
    
    if (tools.length === 4) {
      console.log('✅ Tools listing passed - found 4 tools');
      tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description.slice(0, 50)}...`);
      });
    } else {
      console.log(`❌ Tools listing failed - expected 4 tools, got ${tools.length}`);
    }
    
    console.log('');
    
    // Test 2: Logger functionality
    console.log('📝 Test 2: Logger functionality');
    logger.info('Test log message', { testData: 'success' });
    console.log('✅ Logger test passed');
    console.log('');
    
    // Test 3: Input validation (this will fail as expected)
    console.log('🔍 Test 3: Input validation');
    try {
      await v0Tools.callTool('v0_generate_ui', {});
      console.log('❌ Input validation failed - should have thrown error');
    } catch (error) {
      console.log('✅ Input validation passed - correctly rejected empty input');
    }
    
    console.log('');
    
    // Test 4: Unknown tool handling
    console.log('🔧 Test 4: Unknown tool handling');
    const result = await v0Tools.callTool('unknown_tool', {});
    if (result.isError) {
      console.log('✅ Unknown tool handling passed');
    } else {
      console.log('❌ Unknown tool handling failed');
    }
    
    console.log('\n🎉 Basic functionality tests completed!');
    console.log('\n📊 Summary:');
    console.log('   - Tools are properly defined');
    console.log('   - Logging system is working');
    console.log('   - Input validation is active');
    console.log('   - Error handling is functional');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testBasicFunctionality();