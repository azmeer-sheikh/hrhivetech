const express = require('express');
const net = require('net');
const dns = require('dns');

/**
 * SMTP Connection Test Endpoint
 * Add this to test SMTP connectivity from Railway
 */

const testSMTPConnection = async (host, port) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = net.createConnection({ host, port, timeout: 10000 });
    
    socket.on('connect', () => {
      const duration = Date.now() - startTime;
      socket.destroy();
      resolve({ 
        success: true, 
        message: `Connected to ${host}:${port}`,
        duration: `${duration}ms`,
        host,
        port
      });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ 
        success: false, 
        error: 'Connection timeout',
        message: `Timeout connecting to ${host}:${port} after 10 seconds`,
        host,
        port
      });
    });
    
    socket.on('error', (err) => {
      socket.destroy();
      resolve({ 
        success: false, 
        error: err.code || err.message,
        message: `Failed to connect to ${host}:${port}`,
        details: err.message,
        host,
        port
      });
    });
  });
};

const testDNS = async (host) => {
  return new Promise((resolve) => {
    dns.resolve4(host, (err, addresses) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true, addresses });
      }
    });
  });
};

module.exports = (app) => {
  // Test SMTP connectivity
  app.get('/api/test-smtp', async (req, res) => {
    try {
      console.log('🔍 Testing SMTP connectivity...');
      
      const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.EMAIL_PORT) || 587;
      
      // Test DNS resolution
      const dnsResult = await testDNS(host);
      
      // Test SMTP connection
      const smtpResult = await testSMTPConnection(host, port);
      
      // Test alternative ports
      const port465Result = await testSMTPConnection(host, 465);
      const port25Result = await testSMTPConnection(host, 25);
      
      const response = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        configuration: {
          EMAIL_HOST: host,
          EMAIL_PORT: port,
          EMAIL_USER: process.env.EMAIL_USER ? '✓ Set' : '✗ Not set'
        },
        tests: {
          dns: dnsResult,
          smtp: smtpResult,
          alternativePorts: {
            port465: port465Result,
            port25: port25Result
          }
        },
        recommendation: smtpResult.success 
          ? '✅ SMTP connection is working! Emails should send successfully.'
          : '❌ SMTP connection failed. Railway may be blocking this port. Consider using SendGrid or Mailgun.'
      };
      
      console.log('Test results:', JSON.stringify(response, null, 2));
      
      res.json(response);
    } catch (error) {
      console.error('SMTP test error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
};
