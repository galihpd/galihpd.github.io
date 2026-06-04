/* dantist/js/simulator.js */

function populateOsiLayers4To7(packet, osi, isOutgoing) {
  if (!osi.in) osi.in = {};
  if (!osi.out) osi.out = {};
  
  const target = isOutgoing ? osi.out : osi.in;
  const opposite = isOutgoing ? osi.in : osi.out;
  
  if (packet.type.startsWith('ICMP')) {
    target.l4 = `Transport: ICMP protocol. Raw IP encapsulation (no TCP/UDP ports).`;
    target.l5 = `Session: None (Connectionless ICMP session).`;
    target.l6 = `Presentation: Raw binary payload encoding.`;
    target.l7 = `Application: Ping utility payload (${packet.type === 'ICMP_REQ' ? 'Echo Request' : 'Echo Reply'}: "${packet.info}").`;
  }
  else if (packet.type.startsWith('DNS')) {
    target.l4 = `Transport: UDP protocol. Port 53 (DNS Server). Source/Dest Port: ${packet.type === 'DNS_REQ' ? '53000 -> 53' : '53 -> 53000'}.`;
    target.l5 = `Session: None (UDP connectionless session).`;
    target.l6 = `Presentation: Standard DNS Resource Record header formatting.`;
    target.l7 = `Application: DNS Query/Response. Resolution data: ${packet.info}.`;
  }
  else if (packet.type.startsWith('HTTP')) {
    target.l4 = `Transport: TCP protocol. Port 80 (HTTP Server). Seq: 1, Ack: 1. Source/Dest Port: ${packet.type === 'HTTP_REQ' ? '49152 -> 80' : '80 -> 49152'}.`;
    target.l5 = `Session: TCP connection handshake active/established.`;
    target.l6 = `Presentation: HTML plaintext encoding / gzip compression formats.`;
    target.l7 = `Application: HTTP GET Request / HTTP 200 OK Response. HTML payload: "${packet.info.slice(0, 40)}${packet.info.length > 40 ? '...' : ''}".`;
  }
  else if (packet.type.startsWith('SMTP') || packet.type.startsWith('POP3') || packet.type.startsWith('MAIL')) {
    const isSmtp = packet.type.includes('SMTP');
    const portName = isSmtp ? '25 (SMTP)' : '110 (POP3)';
    target.l4 = `Transport: TCP protocol. Port ${portName}. Source/Dest Port: ${isOutgoing ? '49153 -> ' + portName : portName + ' -> 49153'}.`;
    target.l5 = `Session: TCP session socket active.`;
    target.l6 = `Presentation: ASCII string commands / MIME email format.`;
    target.l7 = `Application: Mail transfer command/response. Details: ${packet.info}.`;
  }
  else if (packet.type.startsWith('DHCP')) {
    target.l4 = `Transport: UDP protocol. Src Port: ${packet.type.includes('DISCOVER') || packet.type.includes('REQUEST') ? '68' : '67'}, Dest Port: ${packet.type.includes('DISCOVER') || packet.type.includes('REQUEST') ? '67' : '68'}.`;
    target.l5 = `Session: None (UDP connectionless datagram).`;
    target.l6 = `Presentation: Binary DHCP options layout / BootP compatibility.`;
    target.l7 = `Application: DHCP Client-Server Handshake. Info: ${packet.info}.`;
  }
  else if (packet.type.startsWith('ARP')) {
    target.l4 = `Transport: Not applicable (ARP is Layer 2/3 control protocol).`;
    target.l5 = `Session: Not applicable.`;
    target.l6 = `Presentation: Not applicable.`;
    target.l7 = `Application: Not applicable.`;
  }
  else if (packet.type.startsWith('TELNET')) {
    const isReq = packet.type.endsWith('_REQ');
    target.l4 = `Transport: TCP protocol. Port 23 (Telnet). Source/Dest Port: ${isReq ? '49154 -> 23' : '23 -> 49154'}.`;
    target.l5 = `Session: Telnet virtual terminal session connection ${isReq ? 'initiated' : 'established'}.`;
    target.l6 = `Presentation: Unencrypted NVT (Network Virtual Terminal) 8-bit character mapping.`;
    target.l7 = `Application: Telnet Protocol commands (CLI redirection).`;
  }
  else if (packet.type.startsWith('SSH')) {
    const isReq = packet.type.endsWith('_REQ');
    target.l4 = `Transport: TCP protocol. Port 22 (SSH). Source/Dest Port: ${isReq ? '49155 -> 22' : '22 -> 49155'}.`;
    target.l5 = `Session: Secure Shell encrypted tunnel session ${isReq ? 'initiated' : 'established'}.`;
    target.l6 = `Presentation: Encrypted payload (symmetric cipher, e.g. AES, Key Exchange Diffie-Hellman).`;
    target.l7 = `Application: SSH remote shell protocol. Encrypted user terminal session.`;
  }
  else {
    target.l4 = `Transport: Bypassed.`;
    target.l5 = `Session: Bypassed.`;
    target.l6 = `Presentation: Bypassed.`;
    target.l7 = `Application: Bypassed.`;
  }
  
  ['l4', 'l5', 'l6', 'l7'].forEach(layer => {
    if (!opposite[layer]) {
      opposite[layer] = isOutgoing ? 'Incoming layer processing not executed yet.' : 'Outgoing encapsulation complete.';
    }
  });
}

class Packet {
  constructor(type, srcIp, destIp, srcMac, destMac, info = '') {
    this.id = `packet_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this.type = type; // 'ICMP_REQ', 'ICMP_REPLY', 'ARP_REQ', 'ARP_REPLY', 'DNS_REQ', 'DNS_REPLY', 'HTTP_REQ', 'HTTP_REPLY', 'SMTP_REQ', 'SMTP_REPLY'
    this.srcIp = srcIp;
    this.destIp = destIp;
    this.srcMac = srcMac;
    this.destMac = destMac;
    this.info = info;
    this.ttl = 64;
    
    // Distinct colors for protocols
    if (type.startsWith('ARP')) {
      this.color = '#eab308'; // Amber/Yellow
    } else if (type.startsWith('DNS')) {
      this.color = '#10b981'; // Emerald Green
    } else if (type.startsWith('HTTP')) {
      this.color = '#06b6d4'; // Cyan
    } else if (type.startsWith('SMTP')) {
      this.color = '#ec4899'; // Pink/Magenta
    } else {
      this.color = '#3b82f6'; // Blue for ICMP
    }
  }
}

class SimulationEvent {
  constructor(packet, fromPort, toPort, link, stepDescription) {
    this.id = `event_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.packet = packet;
    this.fromPort = fromPort;
    this.toPort = toPort;
    this.link = link;
    this.description = stepDescription; // Object containing L1, L2, L3 details
    this.timestamp = Date.now();
  }
}

class NetworkSimulator {
  constructor(topology, onEventTriggered, onSimulationFinished) {
    this.topology = topology;
    this.onEventTriggered = onEventTriggered; // Callback when a packet starts moving
    this.onSimulationFinished = onSimulationFinished; // Callback when simulation queue is drained
    
    this.eventQueue = [];
    this.history = [];
    this.packetQueueMap = {}; // DeviceID -> Array of queued packets waiting for ARP
    this.isPlaying = false;
    this.stepDelay = 500; // Time in ms for a single hop animation
  }

  // Trace L2 connectivity from each router port to find which port connects to the target IP
  findRouterPortForIp(router, destIp) {
    let targetPort = null;
    this.topology.devices.forEach(d => {
      d.ports.forEach(p => {
        if (p.ip === destIp) {
          targetPort = p;
        }
      });
    });
    
    if (!targetPort) return null;
    
    for (const port of router.ports) {
      if (port.status === 'down') continue;
      
      const visited = new Set();
      const queue = [port];
      visited.add(port);
      
      let found = false;
      while (queue.length > 0) {
        const currPort = queue.shift();
        if (currPort === targetPort) {
          found = true;
          break;
        }
        
        if (currPort.device !== router && currPort.device.type === 'router') {
          continue;
        }
        
        if (currPort.connectedLink) {
          const nextP = currPort.getConnectedPort();
          if (nextP && !visited.has(nextP)) {
            visited.add(nextP);
            queue.push(nextP);
          }
        }
        
        if (currPort.device.type === 'switch' || currPort.device.type === 'access_point') {
          currPort.device.ports.forEach(otherP => {
            if (otherP !== currPort && !visited.has(otherP)) {
              visited.add(otherP);
              queue.push(otherP);
            }
          });
        }
      }
      
      if (found) {
        return port;
      }
    }
    
    return null;
  }

  // Access Point Layer 2 Bridge Forwarding logic
  processAccessPoint(apDev, rxPort, packet, event, osi) {
    // 1. Enforce Firewall Rules if present
    if (apDev.firewallRules && apDev.firewallRules.length > 0) {
      const match = this.checkApFirewall(apDev, packet);
      if (match.action === 'deny') {
        event.status = 'dropped';
        osi.in.l2 = `Access Point Firewall: Packet dropped by rule (${match.rule.action.toUpperCase()} ${match.rule.protocol.toUpperCase()} Src: ${match.rule.srcIp} Dest: ${match.rule.destIp} Port: ${match.rule.port}).`;
        osi.out.l2 = `Dropped by AP Firewall`;
        if (event.description) {
          event.description.in = osi.in;
          event.description.out = osi.out;
        }
        this.history.push(event);
        if (this.onEventTriggered) {
          this.onEventTriggered(event);
        }
        return; // Drop packet!
      }
    }

    event.status = 'delivered';
    this.history.push(event);

    const port1 = apDev.ports[0]; // Port1 (Ethernet)
    const wireless0 = apDev.ports[1]; // Wireless0

    if (rxPort === port1) {
      osi.out.l2 = `Access Point forwarding frame from wired interface ${port1.name} to wireless interface ${wireless0.name}.`;
      
      // Find all wireless links in the topology connected to wireless0
      const wLinks = this.topology.links.filter(l => 
        l.type === 'wireless' && (l.portA === wireless0 || l.portB === wireless0)
      );

      wLinks.forEach(link => {
        const destPort = link.portA === wireless0 ? link.portB : link.portA;
        if (destPort && destPort.status === 'up' && destPort.device.type !== 'access_point') {
          const clone = Object.assign(Object.create(Object.getPrototypeOf(packet)), packet);
          clone.id = `packet_${Date.now()}_${Math.floor(Math.random()*10000)}`;

          const apEvent = new SimulationEvent(clone, wireless0, destPort, link, {
            in: { l1: `Signal received over WiFi (SSID: ${apDev.wirelessSettings.ssid}).`, l2: `Src: ${packet.srcMac}, Dest: ${packet.destMac}`, l3: '' },
            out: { l1: `Transmitting frame over WiFi via ${wireless0.name}`, l2: '', l3: '' }
          });
          this.eventQueue.push(apEvent);
        }
      });
    } else if (rxPort === wireless0) {
      osi.out.l2 = `Access Point bridging wireless frame from client to wired interface ${port1.name}.`;
      
      // Forward to wired interface
      if (port1.connectedLink && port1.status === 'up') {
        const connectedPort = port1.getConnectedPort();
        if (connectedPort && connectedPort.status === 'up') {
          const apEvent = new SimulationEvent(packet, port1, connectedPort, port1.connectedLink, {
            in: { l1: `Physical signal received on ${connectedPort.name}.`, l2: `Src: ${packet.srcMac}, Dest: ${packet.destMac}`, l3: '' },
            out: { l1: `Transmitting frame out ${port1.name}`, l2: '', l3: '' }
          });
          this.eventQueue.push(apEvent);
        }
      }

      // Client-to-client wireless bridging
      const wLinks = this.topology.links.filter(l => 
        l.type === 'wireless' && (l.portA === wireless0 || l.portB === wireless0)
      );
      wLinks.forEach(link => {
        const destPort = link.portA === wireless0 ? link.portB : link.portA;
        // Don't loop back to source
        if (destPort && destPort.status === 'up' && destPort.device.type !== 'access_point' && destPort.mac !== packet.srcMac) {
          if (packet.destMac === 'FF:FF:FF:FF:FF:FF' || packet.destMac === destPort.mac) {
            const clone = Object.assign(Object.create(Object.getPrototypeOf(packet)), packet);
            clone.id = `packet_${Date.now()}_${Math.floor(Math.random()*10000)}`;

            const apEvent = new SimulationEvent(clone, wireless0, destPort, link, {
              in: { l1: `Signal received over WiFi (SSID: ${apDev.wirelessSettings.ssid}).`, l2: `Src: ${packet.srcMac}, Dest: ${packet.destMac}`, l3: '' },
              out: { l1: `Transmitting frame over WiFi via ${wireless0.name}`, l2: '', l3: '' }
            });
            this.eventQueue.push(apEvent);
          }
        }
      });
    }
  }

  // AP Firewall matching logic
  checkApFirewall(apDevice, packet) {
    if (!apDevice.firewallRules || apDevice.firewallRules.length === 0) {
      return { action: 'permit' };
    }
    
    for (const rule of apDevice.firewallRules) {
      if (!rule.enabled) continue;
      
      // 1. Protocol check
      let protMatch = false;
      if (rule.protocol === 'any') {
        protMatch = true;
      } else if (rule.protocol === 'icmp') {
        protMatch = packet.type.startsWith('ICMP');
      } else if (rule.protocol === 'tcp') {
        protMatch = packet.type.startsWith('HTTP') || packet.type.startsWith('SMTP') || packet.type.startsWith('TELNET') || packet.type.startsWith('SSH');
      } else if (rule.protocol === 'udp') {
        protMatch = packet.type.startsWith('DNS') || packet.type.startsWith('DHCP');
      }
      
      if (!protMatch) continue;
      
      // 2. Source IP check
      let srcMatch = false;
      if (rule.srcIp === 'any') {
        srcMatch = true;
      } else if (rule.srcIp.includes('/')) {
        const [targetSub, prefix] = rule.srcIp.split('/');
        const mask = cidrToMask(parseInt(prefix, 10));
        srcMatch = ipInSubnet(packet.srcIp, targetSub, mask);
      } else {
        srcMatch = packet.srcIp === rule.srcIp;
      }
      
      if (!srcMatch) continue;
      
      // 3. Destination IP check
      let destMatch = false;
      if (rule.destIp === 'any') {
        destMatch = true;
      } else if (rule.destIp.includes('/')) {
        const [targetSub, prefix] = rule.destIp.split('/');
        const mask = cidrToMask(parseInt(prefix, 10));
        destMatch = ipInSubnet(packet.destIp, targetSub, mask);
      } else {
        destMatch = packet.destIp === rule.destIp;
      }
      
      if (!destMatch) continue;
      
      // 4. Port check
      if (rule.port !== 'any') {
        let packetPort = null;
        if (packet.type.startsWith('HTTP')) packetPort = 80;
        else if (packet.type.startsWith('DNS')) packetPort = 53;
        else if (packet.type.startsWith('TELNET')) packetPort = 23;
        else if (packet.type.startsWith('SSH')) packetPort = 22;
        else if (packet.type.startsWith('SMTP')) packetPort = 25;
        
        if (packetPort !== parseInt(rule.port, 10)) continue;
      }
      
      return { action: rule.action, rule: rule };
    }
    
    return { action: 'permit' };
  }

  // Check if packet matches the ACL rules applied on an interface
  checkAcl(device, aclNum, packet) {
    if (!device.acls || !device.acls[aclNum]) return { action: 'permit', reason: 'ACL not defined' };
    const rules = device.acls[aclNum];
    if (rules.length === 0) return { action: 'permit', reason: 'ACL empty' };

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      
      // 1. Protocol check
      let protMatch = false;
      if (rule.protocol === 'ip' || rule.protocol === 'any') {
        protMatch = true;
      } else if (rule.protocol === 'icmp') {
        protMatch = packet.type.startsWith('ICMP');
      } else if (rule.protocol === 'tcp') {
        protMatch = packet.type.startsWith('HTTP') || packet.type.startsWith('SMTP') || packet.type.startsWith('TELNET') || packet.type.startsWith('SSH');
      } else if (rule.protocol === 'udp') {
        protMatch = packet.type.startsWith('DNS') || packet.type.startsWith('DHCP');
      }
      
      if (!protMatch) continue;

      // 2. Source IP check
      let srcMatch = false;
      if (rule.src.type === 'any') {
        srcMatch = true;
      } else if (rule.src.type === 'host') {
        srcMatch = packet.srcIp === rule.src.ip;
      } else if (rule.src.type === 'subnet') {
        const subnetMask = rule.src.wildcard.split('.').map(x => 255 - parseInt(x, 10)).join('.');
        srcMatch = ipInSubnet(packet.srcIp, rule.src.ip, subnetMask);
      }
      
      if (!srcMatch) continue;

      // 3. Destination IP check
      let destMatch = false;
      if (rule.dest.type === 'any') {
        destMatch = true;
      } else if (rule.dest.type === 'host') {
        destMatch = packet.destIp === rule.dest.ip;
      } else if (rule.dest.type === 'subnet') {
        const subnetMask = rule.dest.wildcard.split('.').map(x => 255 - parseInt(x, 10)).join('.');
        destMatch = ipInSubnet(packet.destIp, rule.dest.ip, subnetMask);
      }
      
      if (!destMatch) continue;

      // 4. Port check (if specified)
      if (rule.destPort !== null) {
        let packetPort = null;
        if (packet.type.startsWith('HTTP')) packetPort = 80;
        else if (packet.type.startsWith('DNS')) packetPort = 53;
        else if (packet.type.startsWith('TELNET')) packetPort = 23;
        else if (packet.type.startsWith('SSH')) packetPort = 22;
        else if (packet.type.startsWith('SMTP')) packetPort = 25;
        
        if (packetPort !== rule.destPort) continue;
      }

      // All filters matched!
      return { action: rule.action, rule: rule };
    }

    // Implicit deny at the end of the ACL if there is at least one rule!
    return { action: 'deny', reason: 'implicit deny' };
  }

  // Create a generic packet transmission flow
  createPacket(srcDevice, destIp, type, info = '') {
    // 1. Resolve source and destination details
    let srcPort = srcDevice.ports.find(p => p.name === 'FastEthernet0' || p.name === 'FastEthernet0/0' || p.name === 'Wireless0');
    if (!srcPort || !srcPort.ip) {
      return { success: false, error: 'Source device has no configured active interface.' };
    }

    // Trigger transmission
    const genericPacket = new Packet(type, srcPort.ip, destIp, srcPort.mac, '', info);
    this.transmitPacket(srcDevice, srcPort, genericPacket);
    
    return { success: true };
  }

  // Create a ping packet flow
  createPing(srcDevice, destDeviceOrIp) {
    this.eventQueue = [];
    
    // 1. Resolve source and destination details
    let srcPort = srcDevice.ports.find(p => p.name === 'FastEthernet0' || p.name === 'FastEthernet0/0' || p.name === 'Wireless0');
    if (!srcPort || !srcPort.ip) {
      return { success: false, error: 'Source device has no configured active interface.' };
    }

    let destIp = '';
    let destDevice = null;
    
    // Check if target is a device name or IP
    const targetDev = this.topology.getDeviceByName(destDeviceOrIp);
    if (targetDev) {
      destDevice = targetDev;
      const targetPort = targetDev.ports.find(p => p.name === 'FastEthernet0' || p.name === 'FastEthernet0/0' || p.name === 'Wireless0');
      if (targetPort && targetPort.ip) {
        destIp = targetPort.ip;
      } else {
        return { success: false, error: 'Destination device has no IP interface.' };
      }
    } else {
      destIp = destDeviceOrIp;
      // Try to find device owning this IP
      this.topology.devices.forEach(d => {
        d.ports.forEach(p => {
          if (p.ip === destIp) destDevice = d;
        });
      });
    }

    if (!destIp) {
      return { success: false, error: `Could not resolve target IP ${destDeviceOrIp}` };
    }

    // Determine the gateway / next-hop IP
    let nextHopIp = destIp;
    let isLocal = false;

    if (srcDevice.type === 'pc' || srcDevice.type === 'server' || srcDevice.type === 'laptop' || srcDevice.type === 'smartphone') {
      if (srcDevice.gateway && !ipInSubnet(destIp, srcPort.ip, srcPort.subnet)) {
        nextHopIp = srcDevice.gateway;
      } else {
        isLocal = true;
      }
    } else if (srcDevice.type === 'router') {
      // Router routes its own packets using routing table lookup
      const route = this.lookupRoute(srcDevice, destIp);
      if (route) {
        if (route.gateway !== 'connected') {
          nextHopIp = route.gateway;
        }
      } else {
        return { success: false, error: `No route to destination ${destIp} in routing table.` };
      }
    }

    // Trigger transmission
    const icmpReq = new Packet('ICMP_REQ', srcPort.ip, destIp, srcPort.mac, '', `ICMP Echo Request`);
    this.transmitPacket(srcDevice, srcPort, icmpReq);
    
    return { success: true, packetsCreated: 1 };
  }

  // Look up route in router's routing table (longest prefix matching)
  lookupRoute(router, destIp) {
    let bestRoute = null;
    let bestMaskLength = -1;

    router.routingTable.forEach(route => {
      if (ipInSubnet(destIp, route.dest, route.mask)) {
        // Count 1s in mask for longest prefix match
        const ones = route.mask.split('.').map(Number)
          .map(n => n.toString(2).split('1').length - 1)
          .reduce((a, b) => a + b, 0);
        
        if (ones > bestMaskLength) {
          bestMaskLength = ones;
          bestRoute = route;
        }
      }
    });

    return bestRoute;
  }

  // Transmit a packet from a device port
  transmitPacket(device, port, packet) {
    const isLoopbackIp = (packet.destIp === '127.0.0.1' || packet.destIp === 'localhost');
    const isOwnIp = device.ports.some(p => p.ip === packet.destIp && p.status === 'up');
    const isLoopback = isLoopbackIp || isOwnIp;

    if (isLoopback) {
      // Loopback transmission: immediately route back internally
      const osi = {
        in: { l1: 'Internal loopback interface.', l2: 'Loopback MAC mapping.', l3: `Source IP: ${packet.srcIp}, Destination IP: ${packet.destIp}` },
        out: { l1: 'Loopback processing.', l2: 'Direct internal loopback.', l3: `Next-hop: Localhost` }
      };
      populateOsiLayers4To7(packet, osi, true);
      
      const event = new SimulationEvent(packet, port, port, null, osi);
      this.eventQueue.push(event);
      return;
    }

    // Description object for OSI analysis
    const osi = {
      in: {
        l1: 'Packet created or received internally.',
        l2: `Source MAC: ${packet.srcMac}`,
        l3: `Source IP: ${packet.srcIp}, Destination IP: ${packet.destIp}`
      },
      out: {
        l1: '',
        l2: '',
        l3: ''
      }
    };
    populateOsiLayers4To7(packet, osi, true);

    // Evaluate outbound L3, L2, L1
    // If ARP request
    if (packet.type === 'ARP_REQ') {
      packet.srcMac = port.mac;
      packet.destMac = 'FF:FF:FF:FF:FF:FF';
      osi.out.l3 = `ARP Request: Who has ${packet.destIp}? Tell ${packet.srcIp}`;
      osi.out.l2 = `Encapsulating ARP request. Src: ${packet.srcMac}, Dest: Broadcast`;
      osi.out.l1 = `Transmitting physical signal out port ${port.name}`;
    } 
    // If ARP reply
    else if (packet.type === 'ARP_REPLY') {
      packet.srcMac = port.mac;
      osi.out.l3 = `ARP Reply: ${packet.srcIp} is at ${packet.srcMac}`;
      osi.out.l2 = `Encapsulating ARP frame. Src: ${packet.srcMac}, Dest: ${packet.destMac}`;
      osi.out.l1 = `Transmitting physical signal out port ${port.name}`;
    } 
    // If IP packet (ICMP)
    else {
      packet.srcMac = port.mac;
      
      // Determine where the packet is going next-hop
      let nextHop = packet.destIp;
      
      if (device.type === 'pc' || device.type === 'server' || device.type === 'laptop' || device.type === 'smartphone') {
        if (device.gateway && !ipInSubnet(packet.destIp, port.ip, port.subnet)) {
          nextHop = device.gateway;
        }
      } else if (device.type === 'router') {
        const route = this.lookupRoute(device, packet.destIp);
        if (route) {
          if (route.gateway !== 'connected') {
            nextHop = route.gateway;
          }
          // Resolve which port actually reaches this nextHop via Layer 2
          const resolvedPort = this.findRouterPortForIp(device, nextHop);
          if (resolvedPort) {
            port = resolvedPort;
          } else {
            const routePort = device.getPort(route.interface);
            if (routePort) port = routePort;
          }
        } else {
          // Drop: No route
          this.logDrop(device, packet, 'No route to destination in routing table.');
          return;
        }
      }

      // Check ARP cache for next-hop MAC
      const destMac = device.arpCache[nextHop];
      if (destMac) {
        packet.destMac = destMac;
        osi.out.l3 = `IP packet ready. Next-hop IP: ${nextHop}`;
        osi.out.l2 = `Destination MAC found in ARP cache (${destMac}). Encapsulating Ethernet frame.`;
        osi.out.l1 = `Transmitting frame out interface ${port.name}`;
      } else {
        // MAC unknown! Queue this packet, send ARP request first.
        if (!this.packetQueueMap[device.id]) {
          this.packetQueueMap[device.id] = [];
        }
        this.packetQueueMap[device.id].push({ port, packet });
        
        // Log info in OSI model
        osi.out.l3 = `Destination IP ${packet.destIp} matches gateway/host. Next-hop: ${nextHop}.`;
        osi.out.l2 = `Next-hop MAC is UNKNOWN. Queuing packet and initiating ARP request.`;
        
        const arpReq = new Packet('ARP_REQ', port.ip, nextHop, port.mac, 'FF:FF:FF:FF:FF:FF', `ARP Request: Who has ${nextHop}?`);
        this.transmitPacket(device, port, arpReq);
        return;
      }
    }

    // Apply outbound ACL if present on port
    if (port.aclOut && !packet.type.startsWith('ARP')) {
      const aclRes = this.checkAcl(device, port.aclOut, packet);
      if (aclRes.action === 'deny') {
        osi.out.l3 = `Packet denied by Access-List ${port.aclOut} (outgoing) on interface ${port.name}.`;
        if (aclRes.rule) {
          osi.out.l3 += ` Matches rule: deny ${aclRes.rule.text}`;
        } else {
          osi.out.l3 += ` Matches rule: implicit deny`;
        }
        this.logDrop(device, packet, `Access-List ${port.aclOut} (outgoing) denied packet.`);
        return;
      } else {
        osi.out.l3 = `Packet permitted by Access-List ${port.aclOut} (outgoing) on interface ${port.name}.`;
      }
    }

    // Now, push connection transit event to the queue
    if (port.status === 'down') {
      this.logDrop(device, packet, `Port ${port.name} is administratively down.`);
      return;
    }

    let targetLink = null;
    let connectedPort = null;

    if (device.type === 'access_point' && port.name === 'Wireless0') {
      // Find all wireless links for this AP
      const wLinks = this.topology.links.filter(l => 
        l.type === 'wireless' && (l.portA === port || l.portB === port)
      );
      if (wLinks.length === 0) {
        this.logDrop(device, packet, `Port ${port.name} is not connected to any wireless clients.`);
        return;
      }
      
      if (packet.destMac === 'FF:FF:FF:FF:FF:FF') {
        // Broadcast: transmit to all clients
        wLinks.forEach(link => {
          const destPort = link.portA === port ? link.portB : link.portA;
          if (destPort && destPort.status === 'up') {
            const clone = Object.assign(Object.create(Object.getPrototypeOf(packet)), packet);
            clone.id = `packet_${Date.now()}_${Math.floor(Math.random()*10000)}`;
            const event = new SimulationEvent(clone, port, destPort, link, osi);
            this.eventQueue.push(event);
          }
        });
        return;
      } else {
        // Unicast: find client matching destMac
        for (const link of wLinks) {
          const destPort = link.portA === port ? link.portB : link.portA;
          if (destPort && destPort.mac === packet.destMac) {
            targetLink = link;
            connectedPort = destPort;
            break;
          }
        }
        if (!targetLink) {
          // Fallback flood (or drop)
          wLinks.forEach(link => {
            const destPort = link.portA === port ? link.portB : link.portA;
            if (destPort && destPort.status === 'up') {
              const clone = Object.assign(Object.create(Object.getPrototypeOf(packet)), packet);
              clone.id = `packet_${Date.now()}_${Math.floor(Math.random()*10000)}`;
              const event = new SimulationEvent(clone, port, destPort, link, osi);
              this.eventQueue.push(event);
            }
          });
          return;
        }
      }
    } else {
      if (!port.connectedLink) {
        this.logDrop(device, packet, `Port ${port.name} is not connected to any cable.`);
        return;
      }
      targetLink = port.connectedLink;
      connectedPort = port.getConnectedPort();
    }

    if (!connectedPort || connectedPort.status === 'down') {
      this.logDrop(device, packet, `Link is down. Receiving port on other end is down.`);
      return;
    }

    const event = new SimulationEvent(packet, port, connectedPort, targetLink, osi);
    this.eventQueue.push(event);
  }

  logDrop(device, packet, reason) {
    const dropEvent = new SimulationEvent(packet, null, null, null, {
      in: { l1: `Packet arrived at ${device.name}`, l2: `MAC: ${packet.destMac}`, l3: `IP: ${packet.destIp}` },
      out: { l1: `Dropped: ${reason}`, l2: 'Packet discarded.', l3: '' }
    });
    dropEvent.status = 'dropped';
    this.history.push(dropEvent);
    if (this.onEventTriggered) {
      this.onEventTriggered(dropEvent);
    }
  }

  // Process packet receipt at the target device
  processPacketReceipt(event) {
    const packet = event.packet;
    const rxPort = event.toPort;
    const device = rxPort.device;

    const osi = {
      in: {
        l1: `Physical signal received on interface ${rxPort.name}.`,
        l2: `Frame MAC check: Src: ${packet.srcMac}, Dest: ${packet.destMac}. `,
        l3: ''
      },
      out: { l1: '', l2: '', l3: '' }
    };
    populateOsiLayers4To7(packet, osi, false);
    if (event.description) {
      event.description.in = osi.in;
    }

    // L2 MAC validation
    if (packet.destMac !== 'FF:FF:FF:FF:FF:FF' && packet.destMac !== rxPort.mac && device.type !== 'switch' && device.type !== 'access_point') {
      // Not for us
      osi.in.l2 += `Destination MAC does not match device interface. Dropping packet.`;
      event.status = 'dropped';
      this.history.push(event);
      return;
    }

    osi.in.l2 += `Destination MAC matches. Frame passed to upper layers.`;

    // Apply inbound ACL if present on port
    if (rxPort.aclIn && !packet.type.startsWith('ARP')) {
      const aclRes = this.checkAcl(device, rxPort.aclIn, packet);
      if (aclRes.action === 'deny') {
        osi.in.l3 = `Packet denied by Access-List ${rxPort.aclIn} (incoming) on interface ${rxPort.name}.`;
        if (aclRes.rule) {
          osi.in.l3 += ` Matches rule: deny ${aclRes.rule.text}`;
        } else {
          osi.in.l3 += ` Matches rule: implicit deny`;
        }
        
        event.status = 'dropped';
        this.history.push(event);
        if (this.onEventTriggered) {
          this.onEventTriggered(event);
        }
        return;
      } else {
        osi.in.l3 = `Packet permitted by Access-List ${rxPort.aclIn} (incoming) on interface ${rxPort.name}.`;
      }
    }

    // Process based on device type
    if (device.type === 'switch') {
      this.processSwitch(device, rxPort, packet, event, osi);
    } else if (device.type === 'access_point') {
      const isForAp = device.ports.some(p => p.ip === packet.destIp) || 
                      (device.dhcpSettings && device.dhcpSettings.enabled && packet.destIp === device.dhcpSettings.ip);
      if (isForAp) {
        this.processL3(device, rxPort, packet, event, osi);
      } else {
        this.processAccessPoint(device, rxPort, packet, event, osi);
      }
    } else {
      // L3 processing for PC, Server, Router
      this.processL3(device, rxPort, packet, event, osi);
    }
  }

  // Switch Layer 2 logic
  processSwitch(switchDev, rxPort, packet, event, osi) {
    // 1. MAC learning
    switchDev.macTable[packet.srcMac] = rxPort.name;
    osi.in.l2 = `Switch learns Source MAC ${packet.srcMac} is on port ${rxPort.name}.`;

    // 2. MAC lookup for forwarding
    const destMac = packet.destMac;
    if (destMac === 'FF:FF:FF:FF:FF:FF') {
      osi.out.l2 = `Broadcast MAC detected. Flooding frame to all other ports.`;
      event.status = 'delivered';
      this.history.push(event);
      
      // Send clone to all other active ports
      switchDev.ports.forEach(port => {
        if (port !== rxPort && port.connectedLink && port.status === 'up') {
          const clone = Object.assign(Object.create(Object.getPrototypeOf(packet)), packet);
          clone.id = `packet_${Date.now()}_${Math.floor(Math.random()*10000)}`;
          
          const connectedPort = port.getConnectedPort();
          if (connectedPort && connectedPort.status === 'up') {
            const floodEvent = new SimulationEvent(clone, port, connectedPort, port.connectedLink, {
              in: { l1: 'Flooded frame.', l2: `Src: ${packet.srcMac}, Dest: Broadcast`, l3: '' },
              out: { l1: `Transmitting frame out ${port.name}`, l2: '', l3: '' }
            });
            this.eventQueue.push(floodEvent);
          }
        }
      });
    } else {
      const txPortName = switchDev.macTable[destMac];
      if (txPortName) {
        osi.out.l2 = `Destination MAC ${destMac} found in MAC table on port ${txPortName}. Forwarding.`;
        event.status = 'delivered';
        this.history.push(event);

        const txPort = switchDev.getPort(txPortName);
        if (txPort && txPort.connectedLink && txPort.status === 'up') {
          const connectedPort = txPort.getConnectedPort();
          if (connectedPort && connectedPort.status === 'up') {
            const fwdEvent = new SimulationEvent(packet, txPort, connectedPort, txPort.connectedLink, {
              in: { l1: 'Forwarding frame.', l2: `Src: ${packet.srcMac}, Dest: ${packet.destMac}`, l3: '' },
              out: { l1: `Transmitting frame out ${txPort.name}`, l2: '', l3: '' }
            });
            this.eventQueue.push(fwdEvent);
          }
        }
      } else {
        osi.out.l2 = `Destination MAC ${destMac} is unknown. Flooding frame to find target.`;
        event.status = 'delivered';
        this.history.push(event);

        switchDev.ports.forEach(port => {
          if (port !== rxPort && port.connectedLink && port.status === 'up') {
            const clone = Object.assign(Object.create(Object.getPrototypeOf(packet)), packet);
            clone.id = `packet_${Date.now()}_${Math.floor(Math.random()*10000)}`;
            
            const connectedPort = port.getConnectedPort();
            if (connectedPort && connectedPort.status === 'up') {
              const floodEvent = new SimulationEvent(clone, port, connectedPort, port.connectedLink, {
                in: { l1: 'Flooding frame (MAC lookup failed).', l2: `Src: ${packet.srcMac}, Dest: ${packet.destMac}`, l3: '' },
                out: { l1: `Transmitting frame out ${port.name}`, l2: '', l3: '' }
              });
              this.eventQueue.push(floodEvent);
            }
          }
        });
      }
    }
  }

  // Host / Router L3 Processing logic
  processL3(device, rxPort, packet, event, osi) {
    // ARP handling
    if (packet.type === 'ARP_REQ') {
      osi.in.l3 = `ARP Request received: Who has IP ${packet.destIp}?`;
      
      // Do we own the target IP?
      let ownIp = false;
      if (device.type === 'router' || device.type === 'access_point') {
        ownIp = device.ports.some(p => p.ip === packet.destIp && p.status === 'up');
        if (!ownIp && device.type === 'access_point') {
          ownIp = device.dhcpSettings && device.dhcpSettings.enabled && device.dhcpSettings.ip === packet.destIp;
        }
      } else {
        ownIp = rxPort.ip === packet.destIp;
      }

      // Check for Proxy ARP (Router only)
      let isProxyArp = false;
      if (!ownIp && device.type === 'router') {
        const resolvedPort = this.findRouterPortForIp(device, packet.destIp);
        if (resolvedPort) {
          if (resolvedPort !== rxPort && resolvedPort.status === 'up') {
            isProxyArp = true;
          }
        } else {
          // Only Proxy ARP if the destination IP actually exists on some device in the topology
          const targetExists = this.topology.devices.some(d => d.ports.some(p => p.ip === packet.destIp));
          if (targetExists) {
            const route = this.lookupRoute(device, packet.destIp);
            if (route) {
              const outPort = device.getPort(route.interface);
              if (outPort && outPort !== rxPort && outPort.status === 'up') {
                isProxyArp = true;
              }
            }
          }
        }
      }

      if (ownIp || isProxyArp) {
        if (ownIp) {
          osi.in.l3 += ` Target IP matches this device. Learning MAC of requester ${packet.srcIp} -> ${packet.srcMac}.`;
        } else {
          osi.in.l3 += ` Target IP is reachable via another interface. Proxy ARP active. Learning MAC of requester ${packet.srcIp} -> ${packet.srcMac}.`;
        }
        device.arpCache[packet.srcIp] = packet.srcMac;

        osi.out.l3 = `Generating ARP Reply: I have ${packet.destIp} at ${rxPort.mac}.`;
        event.status = 'delivered';
        this.history.push(event);

        const arpReply = new Packet('ARP_REPLY', packet.destIp, packet.srcIp, rxPort.mac, packet.srcMac, `ARP Reply: ${packet.destIp} is at ${rxPort.mac}`);
        this.transmitPacket(device, rxPort, arpReply);
      } else {
        osi.in.l3 += ` Target IP does not match this device and is not reachable via proxy. Discarding ARP Request.`;
        event.status = 'dropped';
        this.history.push(event);
      }
      return;
    }

    if (packet.type === 'ARP_REPLY') {
      osi.in.l3 = `ARP Reply received: ${packet.srcIp} is at ${packet.srcMac}.`;
      device.arpCache[packet.srcIp] = packet.srcMac;
      osi.in.l3 += ` Updating ARP cache.`;
      event.status = 'delivered';
      this.history.push(event);

      // Trigger queued packets waiting for this MAC
      const queue = this.packetQueueMap[device.id] || [];
      const waiting = queue.filter(q => {
        let nextHop = q.packet.destIp;
        if (device.type === 'pc' || device.type === 'server' || device.type === 'laptop' || device.type === 'smartphone') {
          if (device.gateway && !ipInSubnet(q.packet.destIp, q.port.ip, q.port.subnet)) {
            nextHop = device.gateway;
          }
        } else if (device.type === 'router') {
          const route = this.lookupRoute(device, q.packet.destIp);
          if (route && route.gateway !== 'connected') {
            nextHop = route.gateway;
          }
        }
        return nextHop === packet.srcIp;
      });

      // Remove from queue
      this.packetQueueMap[device.id] = queue.filter(q => !waiting.includes(q));

      // Re-transmit waiting packets now that MAC is resolved
      waiting.forEach(w => {
        w.packet.destMac = packet.srcMac;
        this.transmitPacket(device, w.port, w.packet);
      });
      return;
    }

    // IP Packet Processing (e.g. ICMP)
    osi.in.l3 = `IP packet received. Destination IP: ${packet.destIp}. `;
    
    // Check if the packet's destination IP matches this device's interfaces
    let targetMatch = false;
    if (packet.destIp === '127.0.0.1' || packet.destIp === 'localhost') {
      targetMatch = true;
    } else if (device.type === 'router' || device.type === 'access_point') {
      targetMatch = device.ports.some(p => p.ip === packet.destIp && p.status === 'up');
      if (!targetMatch && device.type === 'access_point') {
        targetMatch = device.dhcpSettings && device.dhcpSettings.enabled && device.dhcpSettings.ip === packet.destIp;
      }
    } else {
      targetMatch = rxPort.ip === packet.destIp;
    }

    if (targetMatch) {
      osi.in.l3 += `Destination IP matches this device. Passing to upper layers.`;
      
      if (packet.type === 'ICMP_REQ') {
        osi.out.l3 = `ICMP Echo Request received. Generating ICMP Echo Reply.`;
        event.status = 'delivered';
        this.history.push(event);

        const icmpReply = new Packet('ICMP_REPLY', packet.destIp, packet.srcIp, rxPort.mac, packet.srcMac, `ICMP Echo Reply`);
        this.transmitPacket(device, rxPort, icmpReply);
      } else if (packet.type === 'ICMP_REPLY') {
        osi.in.l3 += `ICMP Echo Reply received. Ping successful!`;
        event.status = 'success';
        this.history.push(event);
      } 
      
      // Telnet/SSH remote access connection
      else if (packet.type === 'TELNET_REQ' || packet.type === 'SSH_REQ') {
        event.status = 'delivered';
        this.history.push(event);
        
        osi.out.l3 = `${packet.type.replace('_REQ', '')} Connection Request received. Generating reply.`;
        const replyType = packet.type.replace('_REQ', '_REPLY');
        const reply = new Packet(replyType, packet.destIp, packet.srcIp, rxPort.mac, packet.srcMac, `${packet.type.replace('_REQ', '')} Connection Reply`);
        this.transmitPacket(device, rxPort, reply);
      } else if (packet.type === 'TELNET_REPLY' || packet.type === 'SSH_REPLY') {
        osi.in.l3 += `${packet.type.replace('_REPLY', '')} Connection Established!`;
        event.status = 'success';
        this.history.push(event);
        
        if (typeof window.establishRemoteSession === 'function') {
          window.establishRemoteSession(device, packet.srcIp, packet.type.startsWith('TELNET') ? 'telnet' : 'ssh');
        }
      }
      
      // DNS Query Resolution
      else if (packet.type === 'DNS_REQ') {
        event.status = 'delivered';
        this.history.push(event);
        
        let resolvedIp = 'NXDOMAIN';
        if (device.services && device.services.dns && device.services.dns.enabled) {
          const rec = device.services.dns.records.find(r => r.name.toLowerCase() === packet.info.toLowerCase());
          if (rec) {
            resolvedIp = rec.ip;
          }
        }
        
        osi.out.l3 = `DNS Request for ${packet.info} resolved to ${resolvedIp}.`;
        const dnsReply = new Packet('DNS_REPLY', packet.destIp, packet.srcIp, rxPort.mac, packet.srcMac, resolvedIp);
        this.transmitPacket(device, rxPort, dnsReply);
      } else if (packet.type === 'DNS_REPLY') {
        osi.in.l3 += `DNS Response received. Hostname resolved to: ${packet.info}`;
        event.status = 'success';
        this.history.push(event);
        
        if (typeof device.onDNSResolved === 'function') {
          device.onDNSResolved(packet.info);
        }
      }
      
      // HTTP Web Request Service
      else if (packet.type === 'HTTP_REQ') {
        event.status = 'delivered';
        this.history.push(event);
        
        let content = 'Connection Refused: HTTP service disabled';
        if (device.services && device.services.http && device.services.http.enabled) {
          content = device.services.http.content;
        }
        
        osi.out.l3 = `HTTP GET Request received. Transmitting page contents.`;
        const httpReply = new Packet('HTTP_REPLY', packet.destIp, packet.srcIp, rxPort.mac, packet.srcMac, content);
        this.transmitPacket(device, rxPort, httpReply);
      } else if (packet.type === 'HTTP_REPLY') {
        osi.in.l3 += `HTTP Response payload loaded.`;
        event.status = 'success';
        this.history.push(event);
        
        if (typeof device.onHTTPResponse === 'function') {
          device.onHTTPResponse(packet.info);
        }
      }
      
      // SMTP Mail Delivery Service
      else if (packet.type === 'SMTP_REQ') {
        event.status = 'delivered';
        this.history.push(event);
        
        let mailResponse = 'SMTP 504 Service Disabled';
        if (device.services && device.services.mail && device.services.mail.enabled) {
          try {
            const data = JSON.parse(packet.info);
            const user = device.services.mail.users.find(u => u.username.toLowerCase() === data.toUser.toLowerCase());
            if (user) {
              user.mails = user.mails || [];
              user.mails.push({
                from: data.from,
                subject: data.subject,
                body: data.body,
                timestamp: Date.now()
              });
              mailResponse = 'SMTP 250 OK Message accepted';
            } else {
              mailResponse = 'SMTP 550 User not found';
            }
          } catch(e) {
            mailResponse = 'SMTP 500 Syntax error';
          }
        }
        
        osi.out.l3 = `SMTP session processed. Code: ${mailResponse}`;
        const smtpReply = new Packet('SMTP_REPLY', packet.destIp, packet.srcIp, rxPort.mac, packet.srcMac, mailResponse);
        this.transmitPacket(device, rxPort, smtpReply);
      } else if (packet.type === 'SMTP_REPLY') {
        osi.in.l3 += `SMTP Server Response: ${packet.info}`;
        event.status = 'success';
        this.history.push(event);
        
        if (typeof device.onSMTPResponse === 'function') {
          device.onSMTPResponse(packet.info);
        }
      }
    } else {
      // Destination IP is not us. Can we route?
      if (device.type === 'router') {
        osi.in.l3 += `Destination IP is not local. Router will forward packet.`;
        
        // TTL Check
        packet.ttl--;
        if (packet.ttl <= 0) {
          osi.out.l3 = `TTL expired in transit. Dropping packet.`;
          event.status = 'dropped';
          this.history.push(event);
          return;
        }

        // Routing Table Lookup
        const route = this.lookupRoute(device, packet.destIp);
        if (route) {
          osi.out.l3 = `Route found: ${route.dest}/${route.mask} via ${route.interface}.`;
          event.status = 'delivered';
          this.history.push(event);

          const txPort = device.getPort(route.interface);
          if (txPort) {
            this.transmitPacket(device, txPort, packet);
          } else {
            this.logDrop(device, packet, `Matched interface ${route.interface} is missing.`);
          }
        } else {
          osi.out.l3 = `No route found in routing table. Routing failed.`;
          event.status = 'dropped';
          this.history.push(event);
          
          // Generate ICMP Destination Unreachable back to sender
          const icmpUnreach = new Packet('ICMP_REPLY', rxPort.ip, packet.srcIp, rxPort.mac, packet.srcMac, `ICMP Dest Unreachable`);
          this.transmitPacket(device, rxPort, icmpUnreach);
        }
      } else {
        // End host receiving packet not for it (MAC was correct but IP wasn't - should not happen often unless misconfig)
        osi.in.l3 += `Destination IP does not match end host. Dropping packet.`;
        event.status = 'dropped';
        this.history.push(event);
      }
    }
  }

  // Run next step in simulation
  step() {
    if (this.eventQueue.length === 0) {
      if (this.isPlaying) {
        this.isPlaying = false;
      }
      if (this.onSimulationFinished) {
        this.onSimulationFinished();
      }
      return null;
    }

    // Process the first event in the queue
    const event = this.eventQueue.shift();
    
    // Trigger animation in UI
    if (this.onEventTriggered) {
      this.onEventTriggered(event);
    }

    // After animation delay, execute processing of packet receipt
    setTimeout(() => {
      this.processPacketReceipt(event);
    }, 100);

    return event;
  }

  // Run all events automatically
  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    const runNext = () => {
      if (!this.isPlaying) return;
      
      const event = this.step();
      if (event) {
        // Wait for hop animation + processing to finish before running next step
        setTimeout(runNext, this.stepDelay);
      } else {
        this.isPlaying = false;
      }
    };
    
    runNext();
  }

  stop() {
    this.isPlaying = false;
  }

  clear() {
    this.eventQueue = [];
    this.history = [];
    this.packetQueueMap = {};
    this.isPlaying = false;
  }
}
