#!/usr/bin/env node

/**
 * Claude Code Setup Verification Script
 * Helps users verify their v0-mcp configuration for Claude Code
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function checkJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    return { valid: true, content: json };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function getConfigPaths() {
  const homeDir = os.homedir();
  const platform = os.platform();
  
  if (platform === 'win32') {
    return [
      path.join(homeDir, '.claude.json'),
      path.join(process.env.APPDATA || '', 'claude', 'mcp_settings.json'), // Legacy path
      path.join(process.cwd(), 'claude_mcp_config.json') // Legacy project config
    ];
  } else {
    return [
      path.join(homeDir, '.claude.json'),
      path.join(homeDir, '.config', 'claude', 'mcp_settings.json'), // Legacy path
      path.join(process.cwd(), 'claude_mcp_config.json') // Legacy project config
    ];
  }
}

function verifySetup() {
  console.log('🔍 Verifying v0-mcp setup for Claude Code...\n');

  // Check if build exists
  const distPath = path.join(process.cwd(), 'dist', 'main.js');
  console.log('📦 Build Check:');
  if (checkFileExists(distPath)) {
    console.log('   ✅ dist/main.js exists');
  } else {
    console.log('   ❌ dist/main.js not found - run `npm run build`');
    return false;
  }
  
  // Check configuration files
  const configPaths = getConfigPaths();
  console.log('\n📝 Configuration Check:');
  
  let configFound = false;
  
  for (const configPath of configPaths) {
    let configType = 'Project';
    if (configPath.includes('.claude.json')) {
      configType = 'Global (.claude.json)';
    } else if (configPath.includes('mcp_settings.json')) {
      configType = 'Legacy Global';
    }
    console.log(`\n   ${configType} config: ${configPath}`);
    
    if (checkFileExists(configPath)) {
      console.log('   ✅ File exists');
      
      const jsonCheck = checkJsonFile(configPath);
      if (jsonCheck.valid) {
        console.log('   ✅ Valid JSON format');
        
        // Check for v0-mcp server configuration
        if (jsonCheck.content.mcpServers && jsonCheck.content.mcpServers['v0-mcp']) {
          console.log('   ✅ v0-mcp server configured');
          
          const serverConfig = jsonCheck.content.mcpServers['v0-mcp'];
          
          // Check command
          if (serverConfig.command === 'node') {
            console.log('   ✅ Node.js command configured');
          } else {
            console.log(`   ⚠️  Unexpected command: ${serverConfig.command}`);
          }
          
          // Check args
          if (serverConfig.args && serverConfig.args.length > 0) {
            console.log('   ✅ Arguments configured');
            const mainJsPath = serverConfig.args[0];
            
            // Check if path exists (for relative paths, check from current directory)
            let resolvedPath = mainJsPath;
            if (!path.isAbsolute(mainJsPath)) {
              resolvedPath = path.resolve(mainJsPath);
            }
            
            if (checkFileExists(resolvedPath)) {
              console.log('   ✅ main.js path is valid');
            } else {
              console.log(`   ❌ main.js path not found: ${resolvedPath}`);
            }
          } else {
            console.log('   ❌ No arguments configured');
          }
          
          // Check environment variables
          if (serverConfig.env && serverConfig.env.V0_API_KEY) {
            const apiKey = serverConfig.env.V0_API_KEY;
            if (apiKey.length > 10) {
              console.log('   ✅ V0_API_KEY is configured');
            } else {
              console.log('   ❌ V0_API_KEY appears to be a placeholder');
            }
          } else {
            console.log('   ❌ V0_API_KEY not configured');
          }
          
          configFound = true;
        } else {
          console.log('   ❌ v0-mcp server not found in configuration');
        }
      } else {
        console.log(`   ❌ Invalid JSON: ${jsonCheck.error}`);
      }
    } else {
      console.log('   ⭕ File not found');
    }
  }
  
  console.log('\n🎯 Summary:');
  if (configFound) {
    console.log('✅ v0-mcp configuration found and appears valid');
    console.log('\n📋 Next steps:');
    console.log('1. Restart Claude Code completely');
    console.log('2. Start a new conversation');
    console.log('3. Test with: "Use v0_setup_check to verify the connection"');
  } else {
    console.log('❌ No valid v0-mcp configuration found');
    console.log('\n📋 Next steps:');
    console.log('1. Create a configuration file at one of these locations:');
    configPaths.forEach(p => console.log(`   - ${p}`));
    console.log('2. See CLAUDE_CODE_SETUP.md for detailed instructions');
  }
  
  return configFound;
}

// Run verification
verifySetup();