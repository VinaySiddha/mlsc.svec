---
title: 'WebRTC Meetings SFU Backend Specification'
status: 'published'
author:
  name: 'MLSC SVEC Core Team'
  picture: 'https://mlscsvec.com/favicon.ico'
slug: '05-webrtc-meetings-backend'
description: 'Distributed Selective Forwarding Unit (SFU) architecture for 500-peer low-latency video conferencing.'
publishedAt: '2026-09-01T00:00:00.000Z'
---

# WebRTC Meetings SFU Backend Specification

---

## 1. Overview
The **MLSC Meetings SFU** (`meet.mlscsvec.com`) provides custom, low-latency video, audio, and screen-sharing conferencing infrastructure designed to host 500+ concurrent student attendees during online technical bootcamps.

---

## 2. Distributed SFU Architecture

```mermaid
graph TD
    P1[Speaker / Presenter Video Stream] --> SFU1[Mediasoup C++ Worker Node 1]
    SFU1 --> PipeRouter[Mediasoup Pipe Transport / Redis PubSub]
    
    PipeRouter --> SFU2[Worker Node 2]
    PipeRouter --> SFU3[Worker Node 3]
    
    SFU1 --> A1[Attendee 1..150]
    SFU2 --> A2[Attendee 151..300]
    SFU3 --> A3[Attendee 301..500]
```

---

## 3. Technology Stack & Networking

- **Core Engine:** Mediasoup v3 (C++ media processing workers with Node.js orchestration).
- **Signaling Server:** Node.js + WebSockets / Socket.io with JWT authentication.
- **Inter-Worker Transport:** Redis pub/sub backplane and Mediasoup Pipe Transports for cross-worker stream distribution.
- **Firewall & Ports:**
  - Signaling: Port 443 (HTTPS/WSS)
  - RTP/RTCP Media: UDP Ports 40000 - 49999
  - STUN/TURN: CoTURN server on Port 3478 for NAT traversal across restrictive college firewalls.

---

## 4. Operational Playbook & Recovery

- If audio cuts out under high load: Mediasoup dynamically drops video simulcast layers to 360p/180p to prioritize crystal-clear audio packets.
- In case of a worker node crash: PM2 automatically restarts the node; the signaling server shifts new attendees to adjacent active workers.
