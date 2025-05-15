# Telemetry Reporter (JavaScript)

This module implements a telemetry reporting system for monitoring and collecting various metrics and events.

## Implementation

```javascript
// telemetry-reporter.js

class TelemetryReporter {

constructor(options = {}) {

this.options = {

enabled: true,

reportInterval: 60000, // 1 minute

flushInterval: 300000, // 5 minutes

maxBufferSize: 50, // Maximum number of events to buffer

useBeacon: true, // Use Navigator.sendBeacon for non-blocking sends

endpoint: \'/api/telemetry\',

\...options

};

this.buffer = \[\];

this.metrics = {

bandwidth: {

sent: 0,

received: 0,

limit: 40 \* 1024, // 40KB/s

throttled: false

},

latency: {

p50: 0,

p95: 0,

p99: 0,

samples: \[\]

},

tasks: {

total: 0,

success: 0,

failed: 0,

cloudBurst: 0

},

resourceUsage: {

ram: 0,

cpu: 0,

ssd: 0

}

};

this.reportIntervalId = null;

this.flushIntervalId = null;

this.isReporting = false;

// Initialize if auto-start

if (this.options.enabled) {

this.start();

}

}

start() {

if (this.reportIntervalId) return;

// Start periodic reporting

this.reportIntervalId = setInterval(() =\> {

this.\_reportMetrics();

}, this.options.reportInterval);

// Start periodic flushing

this.flushIntervalId = setInterval(() =\> {

this.\_flush();

}, this.options.flushInterval);

this.isReporting = true;

// Setup unload handler to flush before page close

if (typeof window !== \'undefined\' && this.options.useBeacon) {

window.addEventListener(\'unload\', () =\> {

this.\_flushWithBeacon();

});

}

console.log(\'Telemetry reporting started\');

}

stop() {

if (this.reportIntervalId) {

clearInterval(this.reportIntervalId);

this.reportIntervalId = null;

}

if (this.flushIntervalId) {

clearInterval(this.flushIntervalId);

this.flushIntervalId = null;

}

this.isReporting = false;

console.log(\'Telemetry reporting stopped\');

}

// Update bandwidth metrics

updateBandwidth(sent, received, throttled = false) {

this.metrics.bandwidth.sent += sent;

this.metrics.bandwidth.received += received;

this.metrics.bandwidth.throttled = throttled;

}

// Record request latency

recordLatency(latencyMs) {

this.metrics.latency.samples.push(latencyMs);

// Keep sample size reasonable

if (this.metrics.latency.samples.length \> 100) {

this.metrics.latency.samples.shift();

}

// Update percentiles

if (this.metrics.latency.samples.length \> 0) {

const sorted = \[\...this.metrics.latency.samples\].sort((a, b) =\> a - b);

const len = sorted.length;

this.metrics.latency.p50 = sorted\[Math.floor(len \* 0.5)\];

this.metrics.latency.p95 = sorted\[Math.floor(len \* 0.95)\];

this.metrics.latency.p99 = sorted\[Math.floor(len \* 0.99)\];

}

}

// Record task outcome

recordTask(success, cloudBurst = false) {

this.metrics.tasks.total++;

if (success) {

this.metrics.tasks.success++;

} else {

this.metrics.tasks.failed++;

}

if (cloudBurst) {

this.metrics.tasks.cloudBurst++;

}

}

// Update resource usage

updateResourceUsage(ram, cpu, ssd) {

this.metrics.resourceUsage.ram = ram;

this.metrics.resourceUsage.cpu = cpu;

this.metrics.resourceUsage.ssd = ssd;

}

// Record a custom event

recordEvent(category, action, label = null, value = null) {

const event = {

timestamp: Date.now(),

category,

action,

label,

value

};

this.buffer.push(event);

// Flush if buffer is full

if (this.buffer.length \>= this.options.maxBufferSize) {

this.\_flush();

}

}

// Record an error event

recordError(source, message, stack = null) {

this.recordEvent(\'error\', source, message, stack);

}

// Private: Report collected metrics

async \_reportMetrics() {

if (!this.isReporting) return;

// Clone current metrics

const report = {

timestamp: Date.now(),

metrics: JSON.parse(JSON.stringify(this.metrics)),

version: typeof window !== \'undefined\' ? window.VERSION : \'unknown\'

};

// Reset counters

this.metrics.bandwidth.sent = 0;

this.metrics.bandwidth.received = 0;

this.metrics.tasks.total = 0;

this.metrics.tasks.success = 0;

this.metrics.tasks.failed = 0;

this.metrics.tasks.cloudBurst = 0;

try {

// Use minimal payload size

const payload = JSON.stringify(report);

// Use sendBeacon if available for non-blocking send

if (typeof navigator !== \'undefined\' && navigator.sendBeacon && this.options.useBeacon) {

navigator.sendBeacon(this.options.endpoint, payload);

} else {

// Fallback to fetch

await fetch(this.options.endpoint, {

method: \'POST\',

headers: {

\'Content-Type\': \'application/json\'

},

body: payload,

keepalive: true

});

}

} catch (err) {

console.warn(\'Failed to report metrics:\', err);

}

}

// Private: Flush event buffer

async \_flush() {

if (!this.isReporting \|\| this.buffer.length === 0) return;

const events = \[\...this.buffer\];

this.buffer = \[\];

try {

const payload = JSON.stringify({

timestamp: Date.now(),

events,

version: typeof window !== \'undefined\' ? window.VERSION : \'unknown\'

});

await fetch(this.options.endpoint + \'/events\', {

method: \'POST\',

headers: {

\'Content-Type\': \'application/json\'

},

body: payload,

keepalive: true

});

} catch (err) {

console.warn(\'Failed to flush events:\', err);

// Put events back in buffer (at the beginning)

this.buffer = \[\...events, \...this.buffer\];

// Ensure buffer doesn\'t grow too large

if (this.buffer.length \> this.options.maxBufferSize \* 2) {

this.buffer = this.buffer.slice(-this.options.maxBufferSize);

}

}

}

// Private: Flush with sendBeacon (for page unload)

\_flushWithBeacon() {

if (!this.isReporting \|\| this.buffer.length === 0) return;

if (typeof navigator === \'undefined\' \|\| !navigator.sendBeacon) return;

const events = \[\...this.buffer\];

this.buffer = \[\];

const payload = JSON.stringify({

timestamp: Date.now(),

events,

version: typeof window !== \'undefined\' ? window.VERSION : \'unknown\',

unload: true

});

navigator.sendBeacon(this.options.endpoint + \'/events\', payload);

}

// Get current metrics snapshot

getMetrics() {

return JSON.parse(JSON.stringify(this.metrics));

}

}

// Create and export singleton instance
const telemetry = new TelemetryReporter();
export default telemetry;
```

## Features

- Automatic metric collection and reporting
- Event buffering with configurable size limits
- Graceful handling of page unload with sendBeacon
- Configurable reporting and flush intervals
- Bandwidth monitoring
- Latency tracking with percentiles (p50, p95, p99)
- Task success/failure tracking
- Resource usage monitoring (RAM, CPU, SSD)
- Custom event recording
- Error event tracking

## Usage

```javascript
// Import the singleton instance
import telemetry from './telemetry-reporter';

// Configure options (optional)
telemetry.options = {
  endpoint: '/custom/endpoint',
  reportInterval: 30000,  // 30 seconds
  maxBufferSize: 100
};

// Start reporting
telemetry.start();

// Record metrics
telemetry.updateBandwidth(1024, 512);  // 1KB sent, 512B received
telemetry.recordLatency(150);          // 150ms request latency
telemetry.recordTask(true);            // Successful task
telemetry.updateResourceUsage(0.75, 0.45, 0.30);  // 75% RAM, 45% CPU, 30% SSD

// Record custom events
telemetry.recordEvent('user', 'login', 'success');
telemetry.recordError('api', 'Request failed', errorStack);

// Get current metrics
const metrics = telemetry.getMetrics();
```
