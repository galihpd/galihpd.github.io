/* dantist/js/cli.js */

class CiscoCLI {
  constructor(device, onOutput, onPingTrigger, onSessionClose) {
    this.device = device;
    this.onOutput = onOutput; // Callback to write text back to screen
    this.onPingTrigger = onPingTrigger; // Callback to trigger a simulator ping from CLI
    this.onSessionClose = onSessionClose; // Callback when remote session is closed
    
    this.mode = 'user'; // 'user', 'priv', 'config', 'interface'
    this.currentInterface = null; // Port reference
    this.commandBuffer = '';
    
    // Print banner on startup
    this.printWelcomeBanner();
  }

  printWelcomeBanner() {
    let devType = this.device.type.toUpperCase();
    let banner = [
      `--- Dantist OS CLI Terminal ---`,
      `Device: ${this.device.name} (${devType})`,
      `Press RETURN to get started.`,
      ``
    ].join('\r\n');
    this.onOutput(banner);
    this.showPrompt();
  }

  getPrompt() {
    const hostname = this.device.name;
    switch (this.mode) {
      case 'user':
        return `${hostname}>`;
      case 'priv':
        return `${hostname}#`;
      case 'config':
        return `${hostname}(config)#`;
      case 'interface':
        const portNameShort = this.getShortPortName(this.currentInterface.name);
        return `${hostname}(config-if)#`;
      default:
        return `${hostname}>`;
    }
  }

  getShortPortName(name) {
    return name
      .replace('FastEthernet', 'Fa')
      .replace('GigabitEthernet', 'Gig');
  }

  showPrompt() {
    this.onOutput(this.getPrompt());
  }

  // Handle keypresses / full commands
  handleInput(inputLine) {
    const line = inputLine.trim();
    
    if (line === '') {
      this.onOutput('\r\n');
      this.showPrompt();
      return;
    }

    this.onOutput('\r\n');

    // Parse tokens
    const tokens = line.split(/\s+/);
    const cmd = tokens[0].toLowerCase();
    
    let handled = false;

    // Help commands
    if (cmd === '?' || cmd === 'help') {
      this.showHelp();
      handled = true;
    } 
    // Navigation / General commands
    else if (cmd === 'enable' || cmd === 'en') {
      if (this.mode === 'user') {
        this.mode = 'priv';
      } else {
        this.onOutput('% Command already enabled.\r\n');
      }
      handled = true;
    } else if (cmd === 'disable' || cmd === 'dis') {
      if (this.mode === 'priv') {
        this.mode = 'user';
      } else if (this.mode === 'config' || this.mode === 'interface') {
        this.mode = 'priv';
        this.currentInterface = null;
      } else {
        this.onOutput('% Command disabled.\r\n');
      }
      handled = true;
    } else if (cmd === 'configure' || cmd === 'conf') {
      if (this.mode === 'priv') {
        if (tokens[1] && (tokens[1].toLowerCase() === 'terminal' || tokens[1].toLowerCase() === 't')) {
          this.mode = 'config';
        } else {
          this.onOutput('% Configuring from terminal, memory, or network [terminal]? \r\n');
          this.mode = 'config';
        }
      } else {
        this.onOutput('% Configure command only available in privileged mode.\r\n');
      }
      handled = true;
    } else if (cmd === 'exit' || cmd === 'ex') {
      this.handleExit();
      handled = true;
    } else if (cmd === 'end') {
      if (this.mode !== 'user' && this.mode !== 'priv') {
        this.mode = 'priv';
        this.currentInterface = null;
      }
      handled = true;
    }
    // Execution Mode
    else if (this.mode === 'user' || this.mode === 'priv') {
      handled = this.handleExecCommands(cmd, tokens);
    } 
    // Global Config Mode
    else if (this.mode === 'config') {
      handled = this.handleConfigCommands(cmd, tokens);
    } 
    // Interface Config Mode
    else if (this.mode === 'interface') {
      handled = this.handleInterfaceCommands(cmd, tokens);
    }

    if (!handled) {
      this.onOutput(`% Invalid input detected at '${tokens[0]}' marker.\r\n`);
    }

    this.onOutput('\r\n');
    this.showPrompt();
  }

  handleExit() {
    if (this.mode === 'interface') {
      this.mode = 'config';
      this.currentInterface = null;
    } else if (this.mode === 'config') {
      this.mode = 'priv';
    } else if (this.mode === 'priv') {
      this.mode = 'user';
    } else {
      this.onOutput('% Terminal session finished.\r\n');
      if (this.onSessionClose) {
        this.onSessionClose();
      }
    }
  }

  handleExecCommands(cmd, tokens) {
    // ping <ip>
    if (cmd === 'ping') {
      const isContinuous = tokens.includes('-t');
      const target = tokens.find((t, idx) => idx > 0 && t !== '-t');
      if (!target) {
        this.onOutput('% Usage: ping <ip_address> [-t]\r\n');
        return true;
      }
      this.onOutput(`\r\nType escape sequence to abort.\r\nSending ${isContinuous ? 'continuous' : '5'}, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:\r\n`);
      if (this.onPingTrigger) {
        this.onPingTrigger(this.device, target, isContinuous, (output) => {
          this.onOutput(output);
        });
      }
      return true;
    }
    // show ip interface brief
    if (cmd === 'show' || cmd === 'sh') {
      if (tokens.length < 2) {
        this.onOutput('% Incomplete command.\r\n');
        return true;
      }
      const sub = tokens[1].toLowerCase();
      if (sub === 'ip') {
        if (tokens[2] && (tokens[2].toLowerCase() === 'interface' || tokens[2].toLowerCase() === 'int')) {
          if (tokens[3] && (tokens[3].toLowerCase() === 'brief' || tokens[3].toLowerCase() === 'br')) {
            this.showIpInterfaceBrief();
            return true;
          }
        }
        if (tokens[2] && tokens[2].toLowerCase() === 'route') {
          this.showIpRoute();
          return true;
        }
        if (tokens[2] && (tokens[2].toLowerCase() === 'access-lists' || tokens[2].toLowerCase() === 'access-list')) {
          this.showAccessLists();
          return true;
        }
      } else if (sub === 'mac' || sub === 'mac-address-table') {
        this.showMacAddressTable();
        return true;
      } else if (sub === 'access-lists' || sub === 'access-list') {
        this.showAccessLists();
        return true;
      }
    }
    return false;
  }

  handleConfigCommands(cmd, tokens) {
    // hostname <name>
    if (cmd === 'hostname' || cmd === 'host') {
      if (tokens.length < 2) {
        this.onOutput('% Usage: hostname <new_name>\r\n');
        return true;
      }
      this.device.name = tokens[1];
      return true;
    }
    // interface <port>
    if (cmd === 'interface' || cmd === 'int') {
      if (tokens.length < 2) {
        this.onOutput('% Usage: interface <interface_name>\r\n');
        return true;
      }
      // Combine tokens to search for interface names like "FastEthernet 0/0"
      const portQuery = tokens.slice(1).join('').toLowerCase();
      
      // Let's resolve the port name mapping e.g., fa0/0 -> FastEthernet0/0, fa0 -> FastEthernet0
      let matchedPort = null;
      for (let p of this.device.ports) {
        let pName = p.name.toLowerCase();
        let shortName = this.getShortPortName(p.name).toLowerCase();
        if (pName === portQuery || shortName === portQuery || pName.replace('/', '') === portQuery) {
          matchedPort = p;
          break;
        }
      }

      if (matchedPort) {
        this.mode = 'interface';
        this.currentInterface = matchedPort;
      } else {
        this.onOutput(`% Interface '${tokens.slice(1).join(' ')}' not found on this device.\r\n`);
      }
      return true;
    }
    // ip route <dest> <mask> <gateway>
    if (cmd === 'ip' && tokens[1] && tokens[1].toLowerCase() === 'route') {
      if (this.device.type !== 'router') {
        this.onOutput('% IP routing is not enabled on this device (it is a switch/end device).\r\n');
        return true;
      }
      if (tokens.length < 5) {
        this.onOutput('% Usage: ip route <network_ip> <subnet_mask> <next_hop_ip | interface_name>\r\n');
        return true;
      }
      const dest = tokens[2];
      const mask = tokens[3];
      const gateway = tokens[4];

      // Add static route to routing table
      this.device.routingTable.push({
        dest: dest,
        mask: mask,
        gateway: gateway,
        interface: gateway.includes('/') || gateway.startsWith('fa') || gateway.startsWith('gi') ? gateway : 'Static'
      });
      this.onOutput(`% Static route to ${dest}/${mask} added.\r\n`);
      return true;
    }

    // access-list <num> {permit|deny} <protocol> <src> <dest> [eq <port>]
    if (cmd === 'access-list' || cmd === 'access-l') {
      if (this.device.type !== 'router') {
        this.onOutput('% Access-lists can only be configured on Routers.\r\n');
        return true;
      }
      if (tokens.length < 5) {
        this.onOutput('% Usage: access-list <1-199> {permit | deny} {ip | tcp | udp | icmp} <src> <dest> [eq <port>]\r\n');
        return true;
      }
      const aclNum = parseInt(tokens[1], 10);
      if (isNaN(aclNum) || aclNum < 1 || aclNum > 199) {
        this.onOutput('% Access-list number must be between 1 and 199.\r\n');
        return true;
      }
      
      const action = tokens[2].toLowerCase();
      if (action !== 'permit' && action !== 'deny') {
        this.onOutput('% Action must be permit or deny.\r\n');
        return true;
      }

      const protocol = tokens[3].toLowerCase();
      const validProts = ['ip', 'tcp', 'udp', 'icmp', 'any'];
      if (!validProts.includes(protocol)) {
        this.onOutput('% Protocol must be ip, tcp, udp, icmp, or any.\r\n');
        return true;
      }

      // Parse source term starting at index 4
      const srcParse = parseAclTerm(tokens, 4);
      if (!srcParse) {
        this.onOutput('% Invalid source IP configuration.\r\n');
        return true;
      }

      // Parse dest term starting at srcParse.nextIndex
      const destParse = parseAclTerm(tokens, srcParse.nextIndex);
      if (!destParse) {
        this.onOutput('% Invalid destination IP configuration.\r\n');
        return true;
      }

      // Check for port number: [eq <port>]
      let destPort = null;
      let nextIndex = destParse.nextIndex;
      if (tokens[nextIndex] && tokens[nextIndex].toLowerCase() === 'eq') {
        const portToken = tokens[nextIndex + 1];
        if (!portToken) {
          this.onOutput('% Missing port number after eq.\r\n');
          return true;
        }
        destPort = parseInt(portToken, 10);
        if (isNaN(destPort)) {
          // Check standard port names
          if (portToken.toLowerCase() === 'www' || portToken.toLowerCase() === 'http') destPort = 80;
          else if (portToken.toLowerCase() === 'dns') destPort = 53;
          else if (portToken.toLowerCase() === 'telnet') destPort = 23;
          else if (portToken.toLowerCase() === 'ssh') destPort = 22;
          else if (portToken.toLowerCase() === 'smtp') destPort = 25;
          else {
            this.onOutput(`% Invalid port identifier: "${portToken}".\r\n`);
            return true;
          }
        }
      }

      // Add to device ACLs
      if (!this.device.acls) this.device.acls = {};
      if (!this.device.acls[aclNum]) this.device.acls[aclNum] = [];
      
      const newRule = {
        action: action,
        protocol: protocol,
        src: srcParse.term,
        dest: destParse.term,
        destPort: destPort,
        text: tokens.slice(2).join(' ')
      };

      this.device.acls[aclNum].push(newRule);
      this.onOutput(`% Access-list rule added successfully.\r\n`);
      return true;
    }
    return false;
  }

  handleInterfaceCommands(cmd, tokens) {
    // ip address <ip> <subnet>
    if (cmd === 'ip' && tokens[1] && (tokens[1].toLowerCase() === 'address' || tokens[1].toLowerCase() === 'add')) {
      if (tokens.length < 4) {
        this.onOutput('% Usage: ip address <ip_address> <subnet_mask>\r\n');
        return true;
      }
      const ip = tokens[2];
      const subnet = tokens[3];

      // Basic regex check for IP structure
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(ip) || !ipRegex.test(subnet)) {
        this.onOutput('% Invalid IP address or subnet mask format.\r\n');
        return true;
      }

      this.currentInterface.ip = ip;
      this.currentInterface.subnet = subnet;
      this.device.updateConnectedRoutes();
      this.onOutput(`% IP address configured on interface ${this.currentInterface.name}.\r\n`);
      return true;
    }
    // shutdown
    if (cmd === 'shutdown' || cmd === 'shut') {
      this.currentInterface.status = 'down';
      this.device.updateConnectedRoutes();
      if (this.currentInterface.connectedLink) {
        this.currentInterface.connectedLink.updateStatus();
      }
      this.onOutput(`% Interface ${this.currentInterface.name} state changed to administratively down.\r\n`);
      return true;
    }
    // no shutdown / no shut
    if (cmd === 'no') {
      if (tokens[1] && (tokens[1].toLowerCase() === 'shutdown' || tokens[1].toLowerCase() === 'shut')) {
        this.currentInterface.status = 'up';
        this.device.updateConnectedRoutes();
        if (this.currentInterface.connectedLink) {
          this.currentInterface.connectedLink.updateStatus();
        }
        this.onOutput(`% Interface ${this.currentInterface.name} state changed to UP.\r\n`);
        return true;
      }
      // no ip access-group <num> {in|out}
      if (tokens[1] && tokens[1].toLowerCase() === 'ip' && tokens[2] && tokens[2].toLowerCase() === 'access-group') {
        if (tokens.length < 5) {
          this.onOutput('% Usage: no ip access-group <acl_number> <in | out>\r\n');
          return true;
        }
        const aclNum = parseInt(tokens[3], 10);
        const direction = tokens[4].toLowerCase();
        if (isNaN(aclNum) || (direction !== 'in' && direction !== 'out')) {
          this.onOutput('% Invalid access-list number or direction (in/out).\r\n');
          return true;
        }
        if (direction === 'in') {
          if (this.currentInterface.aclIn === aclNum) {
            this.currentInterface.aclIn = null;
          }
        } else {
          if (this.currentInterface.aclOut === aclNum) {
            this.currentInterface.aclOut = null;
          }
        }
        this.onOutput(`% Access-group ${aclNum} removed ${direction}bound from interface ${this.currentInterface.name}.\r\n`);
        return true;
      }
    }
    // ip access-group <num> {in|out}
    if (cmd === 'ip' && tokens[1] && tokens[1].toLowerCase() === 'access-group') {
      if (tokens.length < 4) {
        this.onOutput('% Usage: ip access-group <acl_number> <in | out>\r\n');
        return true;
      }
      const aclNum = parseInt(tokens[2], 10);
      const direction = tokens[3].toLowerCase();
      if (isNaN(aclNum) || (direction !== 'in' && direction !== 'out')) {
        this.onOutput('% Invalid access-list number or direction (in/out).\r\n');
        return true;
      }
      if (direction === 'in') {
        this.currentInterface.aclIn = aclNum;
      } else {
        this.currentInterface.aclOut = aclNum;
      }
      this.onOutput(`% Access-group ${aclNum} applied ${direction}bound on interface ${this.currentInterface.name}.\r\n`);
      return true;
    }
    return false;
  }

  showIpInterfaceBrief() {
    let output = 'Interface              IP-Address      OK? Method Status                Protocol\r\n';
    this.device.ports.forEach(port => {
      let ipStr = port.ip || 'unassigned';
      let ipPadded = ipStr.padEnd(16, ' ');
      let portPadded = port.name.padEnd(23, ' ');
      let statusStr = port.status === 'up' ? 'up' : 'administratively down';
      let protocolStr = (port.connectedLink && port.status === 'up' && port.getConnectedPort().status === 'up') ? 'up' : 'down';
      
      output += `${portPadded}${ipPadded}YES manual ${statusStr.padEnd(22, ' ')}${protocolStr}\r\n`;
    });
    this.onOutput(output);
  }

  showIpRoute() {
    if (this.device.type !== 'router') {
      this.onOutput('% IP Routing table only available on Routers.\r\n');
      return;
    }
    let output = 'Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP\r\n';
    output += 'Gateway of last resort is not set\r\n\r\n';
    
    this.device.routingTable.forEach(route => {
      let code = route.gateway === 'connected' ? 'C' : 'S';
      let hopStr = route.gateway === 'connected' ? `is directly connected, ${route.interface}` : `via ${route.gateway}`;
      output += `${code}    ${route.dest}/${route.mask} ${hopStr}\r\n`;
    });
    this.onOutput(output);
  }

  showMacAddressTable() {
    if (this.device.type !== 'switch') {
      this.onOutput('% MAC Address table only available on Switches.\r\n');
      return;
    }
    let output = '          Mac Address Table\r\n';
    output += '-------------------------------------------\r\n\r\n';
    output += 'Vlan    Mac Address       Type        Ports\r\n';
    output += '----    -----------       ----        -----\r\n';
    
    let entries = Object.keys(this.device.macTable);
    if (entries.length === 0) {
      output += 'No entries in table.\r\n';
    } else {
      entries.forEach(mac => {
        let port = this.device.macTable[mac];
        output += `1       ${mac.toLowerCase()} dynamic     ${port}\r\n`;
      });
    }
    this.onOutput(output);
  }

  showHelp() {
    let output = '';
    output += 'Help Commands:\r\n';
    output += '  help / ?                     - Show this help list\r\n';
    output += '  enable / en                  - Enter Privileged EXEC mode\r\n';
    output += '  disable / dis                - Return to User EXEC mode\r\n';
    output += '  exit / ex / end              - Exit current config mode / session\r\n';
    
    if (this.mode === 'user') {
      output += '  ping <ip>                    - Ping an IP address\r\n';
    } else if (this.mode === 'priv') {
      output += '  configure terminal / config t- Enter Global Configuration mode\r\n';
      output += '  ping <ip>                    - Ping an IP address\r\n';
      output += '  show ip interface brief      - Show device interface summary\r\n';
      output += '  show ip route                - Show routing table (Routers)\r\n';
      output += '  show mac-address-table       - Show L2 forwarding table (Switches)\r\n';
    } else if (this.mode === 'config') {
      output += '  hostname <name>              - Set host device name\r\n';
      output += '  interface <port>             - Select interface to configure (e.g. FastEthernet0/0)\r\n';
      if (this.device.type === 'router') {
        output += '  ip route <dest> <mask> <gw>  - Configure static IP routing\r\n';
      }
    } else if (this.mode === 'interface') {
      output += '  ip address <ip> <mask>       - Set interface IP settings\r\n';
      output += '  shutdown / shut              - Turn interface off\r\n';
      output += '  no shutdown / no shut        - Enable interface (UP)\r\n';
    }
    this.onOutput(output);
  }

  showAccessLists() {
    if (this.device.type !== 'router') {
      this.onOutput('% Access-lists only configured on Routers.\r\n');
      return;
    }
    if (!this.device.acls || Object.keys(this.device.acls).length === 0) {
      this.onOutput('No access-lists configured.\r\n');
      return;
    }
    let output = '';
    Object.keys(this.device.acls).forEach(aclNum => {
      output += `Extended IP access list ${aclNum}\r\n`;
      this.device.acls[aclNum].forEach((rule, idx) => {
        const seq = (idx + 1) * 10;
        output += `    ${seq} ${rule.action} ${rule.protocol} `;
        
        // src
        if (rule.src.type === 'any') output += 'any ';
        else if (rule.src.type === 'host') output += `host ${rule.src.ip} `;
        else output += `${rule.src.ip} ${rule.src.wildcard} `;
        
        // dest
        if (rule.dest.type === 'any') output += 'any';
        else if (rule.dest.type === 'host') output += `host ${rule.dest.ip}`;
        else output += `${rule.dest.ip} ${rule.dest.wildcard}`;
        
        if (rule.destPort) {
          output += ` eq ${rule.destPort}`;
        }
        output += '\r\n';
      });
    });
    this.onOutput(output);
  }
}

// Global helper to parse access-list source/dest expressions
function parseAclTerm(tokens, startIndex) {
  const term = tokens[startIndex];
  if (!term) return null;
  
  if (term.toLowerCase() === 'any') {
    return { term: { type: 'any' }, nextIndex: startIndex + 1 };
  }
  
  if (term.toLowerCase() === 'host') {
    const ip = tokens[startIndex + 1];
    if (!ip) return null;
    return { term: { type: 'host', ip: ip }, nextIndex: startIndex + 2 };
  }
  
  // Could be ip + wildcard mask
  const ip = term;
  const wildcard = tokens[startIndex + 1];
  if (wildcard && /^(\d{1,3}\.){3}\d{1,3}$/.test(wildcard)) {
    return { term: { type: 'subnet', ip: ip, wildcard: wildcard }, nextIndex: startIndex + 2 };
  }
  
  // Treat single IP as host if wildcard omitted
  return { term: { type: 'host', ip: ip }, nextIndex: startIndex + 1 };
}
