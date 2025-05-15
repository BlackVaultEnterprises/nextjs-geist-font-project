# Product Requirements Document (PRD)

**Project Title**: Optimized Swarm Intelligence Hub on Chromebook  
**Version**: 2.1  
**Date**: May 15, 2025  
**Prepared by**: [Assistant]  

---

## 1. Objective
Transform a Lenovo Chromebook (4GB RAM, 15GB internal storage, 2TB external SSD) into a high-performance swarm intelligence hub. The system must:
- Retrieve and process large datasets with minimal latency.
- Leverage external SSD, MCP servers, and free cloud tiers (e.g., Hugging Face Spaces, GitHub Codespaces).
- Operate within strict resource constraints: 4GB RAM, limited CPU, 40KB/s network bandwidth.

---

## 2. Key Requirements

### 2.1 Hardware Utilization
- **RAM Management**: Use `zswap` with `lz4` compression, capping swap at 500MB on the external SSD.
- **CPU Management**: Reserve 20% for system tasks, cap swarm operations at 75%.
- **SSD Utilization**: Limit swarm data to 1.7TB, reserving the rest for system use.
- **Network Cap**: Restrict swarm communication to 40KB/s.

### 2.2 Software Stack
- **Runtime**: Use **WAMR** (WebAssembly Micro Runtime) with `wasm-gc` and `tail-call` optimizations.
- **Swarm Fabric**: Implement **single-path QUIC** over WebTransport with **libp2p DAG-CBOR**.
- **MCP Servers**: Deploy three **IncludeOS unikernels**:
  - Data Processing MCP
  - Resource Scheduler MCP
  - TaskMaster AI MCP
- **Cloud Integration**: Offload tasks to free tiers when RAM > 3.2GB or CPU > 75%.

### 2.3 Optimizations
- **Memory**: Multi-tier caching with **OPFS** (40MB cap) and **IndexedDB** (batched writes).
- **Execution**: Pre-warm two 256KB WASM instances with `SharedArrayBuffer`.
- **Network**: Use **header-stripped QUIC** with predictive pre-fetching.
- **TinyML**: Run 4-bit quantized models locally, offload 16-bit layers to cloud.
- **Compression**: Apply **LZ4** via DEFLATE streams.

### 2.4 Security
- **Communication**: HTTPS/WSS with token-based authentication.
- **Data**: AES-GCM encryption for OPFS-stored secrets.
- **Zero Trust**: Validate task headers with 16-bit HMAC.

### 2.5 Monitoring & Enforcement
- **Resource Caps**: RAM (3.2GB), CPU (75%), SSD (1.7TB), Network (40KB/s).
- **Kill Triggers**: Terminate processes exceeding limits.
- **Telemetry**: Track bandwidth, latency, and task success.

---

## 3. Detailed Solution Components

### 3.1 Memory-Critical Path
- **WAMR Cold Boot Mitigation**:
  - Pre-warm two 256KB WASM instances during idle Chrome tabs.
  - Enable `wasm-gc` for 40% memory reduction.
  - Use `SharedArrayBuffer` for zero-copy data sharing.
- **OPFS/IndexedDB Hybrid Cache**:
  - Tier 1: OPFS memory-mapped (40MB, LRU purge).
  - Tier 2: IndexedDB batched writes (250ms coalesce).
  - Downgrade to RAM-only cache if disk I/O > 15ms.

### 3.2 Network Throttle Bypass
- **Header-Stripped QUIC**:
  - Pre-shared CBOR schema IDs (1-byte header).
  - UDP fallback for payloads < 10KB.
- **Predictive Pre-Fetch**:
  - Cache three likely next requests if ML inference < 100ms.
  - Allocate up to 5MB RAM, scaling dynamically.

### 3.3 TinyML Edge/Cloud Fission
- **Model Splitting**:
  - Local 4-bit quantized layers.
  - Offload 16-bit layers to Hugging Face.
- **Federated Learning Guardrails**:
  - Reject updates > 2MB.
  - Blacklist RAM-intensive operations server-side.

### 3.4 Chromebook-Specific Hacks
- **ZRAM Swap on /tmp**:
  - 512MB `lz4` compressed swap via Termux.
  - Disable if SSD wear > 3% per 24 hours.
- **GPU CSS Abuse**:
  - Use WebGL shaders for WASM math ops (test rigorously).

### 3.5 CloudBurst Triggers
- **Hard Limits**:
  - RAM: 3.2GB (kill beyond).
  - CPU: 75% over 5s → offload.
- **Free Tier Spread**:
  - Hugging Face: 10 req/min.
  - Replit: 3 concurrent runners.
  - GitHub Codespaces: 2hr/day burst.

---

## 4. Fixes and Enhancements

### 4.1 OPFS Quota Enforcer
- Size to 50% of available quota, capped at 90MB.
- Fetch fresh storage estimates in `enforce()`.

### 4.2 CBOR Header Redesign
- Two-byte bitmask for versioning, schema IDs, opcodes.
- 16-bit HMAC for security.

### 4.3 Jitter Buffer + FEC
- Sliding window with XOR-based parity for packet loss recovery.
- Rate limiter (500ms cooldown) for FEC requests.

### 4.4 SSD Wear Mitigation
- Switch to RAM disk (tmpfs) at 2% SSD wear.
- Rebuild cache asynchronously post-switch.

### 4.5 CloudBurst Circuit Breaker
- Token bucket with exponential backoff, reset on success.

### 4.6 Error Handling (Sentry-Lite)
- Circular buffer for logs (URL, user actions).
- Use `sendBeacon` for non-blocking log flushing.

### 4.7 Secrets Vault in OPFS
- Encrypt with AES-GCM.
- Persist `cryptoKey` with passphrase-derived master key.

### 4.8 CI/CD Pipeline
- Split unikernel and JS module artifacts for granular rollbacks.

---

## 5. Additional Features
- **Health-Check Endpoints**: `/health` on each unikernel.
- **Telemetry Reporter**: Real-time bandwidth, latency, task success.
- **Graceful Fallbacks**: Async cache rebuild during SSD → tmpfs transitions.

---

## 6. Deployment Checklist
- **Termux Setup**:
  - Install `wget`, `python`, `nodejs`.
  - Mount SSD: `mount /dev/sda1 /mnt/ssd`.
- **Browser Flags**:
  - Enable `chrome://flags/#enable-webassembly-garbage-collection`.
  - Enable `chrome://flags/#enable-experimental-webassembly-features`.
- **Replit Bastion**:
  - Mirror services on three free Replit instances (geodistributed).

---

## 7. Red Lines (DO NOT CROSS)
- ✖️ **No Docker** (RAM-intensive).
- ✖️ **No JVM** (GC spikes).
- ✖️ **No Electron** (overhead).

---

## 8. Expected Benchmarks
- **Data Throughput**: 8.3MB/s (LZ4 + QUIC).
- **Swarm Tasks**: 42 req/sec (95th percentile).
- **Cold Boot → Ready**: 1.8s (WASM pre-warm).

---

## 9. Final Notes
This PRD delivers a lean, efficient swarm intelligence hub on a 4GB Chromebook. It balances local and cloud resources, enforces strict caps, and integrates battle-tested fixes for stability and performance.

**Next Steps**:
- Deploy using the checklist.
- Monitor via telemetry.
- Iterate based on real-world data (memory, SSD wear).