/* dantist/js/network.js */

// Helper to generate unique MAC addresses
function generateMAC() {
  const hex = '0123456789ABCDEF';
  let mac = '00:60:2F:'; // Cisco vendor prefix for demonstration
  for (let i = 0; i < 6; i++) {
    mac += hex[Math.floor(Math.random() * 16)];
    if (i % 2 === 1 && i < 5) mac += ':';
  }
  return mac;
}

// Convert IP string to 32-bit integer
function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return 0;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Convert 32-bit integer to IP string
function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

// Check if IP belongs to a subnet
function ipInSubnet(ip, targetSubnet, subnetMask) {
  const ipInt = ipToInt(ip);
  const subnetInt = ipToInt(targetSubnet);
  const maskInt = ipToInt(subnetMask);
  
  return (ipInt & maskInt) === (subnetInt & maskInt);
}

// Convert CIDR prefix (e.g., 24) to subnet mask string
function cidrToMask(prefix) {
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  return intToIp(mask);
}

class Port {
  constructor(device, name) {
    this.device = device;
    this.name = name;
    this.ip = '';
    this.subnet = '';
    this.mac = generateMAC();
    this.status = 'down'; // Default is down
    this.connectedLink = null;
  }

  getConnectedPort() {
    if (!this.connectedLink) return null;
    return this.connectedLink.portA === this ? this.connectedLink.portB : this.connectedLink.portA;
  }
}

class Device {
  constructor(id, type, name, x, y) {
    this.id = id;
    this.type = type; // 'router', 'switch', 'pc', 'server', 'access_point', 'laptop', 'smartphone'
    this.name = name;
    this.x = x;
    this.y = y;
    this.ports = [];
    this.arpCache = {}; // IP -> MAC
    
    // Wireless default settings
    if (this.type === 'laptop' || this.type === 'smartphone') {
      this.wirelessSettings = {
        ssid: '',
        wpa2Key: '',
        connectedAP: null
      };
    } else if (this.type === 'access_point') {
      this.wirelessSettings = {
        ssid: 'NetSim-Wifi',
        wpa2Key: '12345678',
        securityEnabled: true,
        radius: 180
      };
      this.dhcpSettings = {
        enabled: false,
        ip: '192.168.1.1',
        subnet: '255.255.255.0',
        startIp: '192.168.1.100',
        maxUsers: 50,
        dnsServer: '8.8.8.8',
        reservations: [], // Array of { mac: '', ip: '' }
        leases: {}
      };
      this.firewallRules = []; // Array of { id, action, protocol, srcIp, destIp, port, enabled }
    }
    
    this.initializePorts();

    // Default services for Server devices
    if (this.type === 'server') {
      this.services = {
        http: {
          enabled: true,
          content: `<div class="space-y-1.5 bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-700 font-sans">
  <h5 class="font-bold text-indigo-900 text-xs">NetSim Web Server Home</h5>
  <p class="text-[10px] text-indigo-600">HTTP/1.1 200 OK</p>
  <p class="text-[10px] text-slate-600">Welcome to the server website! Dynamic HTML files are loaded successfully.</p>
</div>`
        },
        dns: {
          enabled: true,
          records: [
            { name: 'netsim.local', ip: '192.168.1.20' },
            { name: 'google.com', ip: '8.8.8.8' }
          ]
        },
        mail: {
          enabled: true,
          domain: 'netsim.com',
          users: [
            { username: 'admin', password: 'password', mails: [] },
            { username: 'user1', password: 'password', mails: [] },
            { username: 'user2', password: 'password', mails: [] }
          ]
        }
      };
    }
  }

  initializePorts() {
    if (this.type === 'pc' || this.type === 'server' || this.type === 'laptop' || this.type === 'smartphone') {
      const nicName = (this.type === 'laptop' || this.type === 'smartphone') ? 'Wireless0' : 'FastEthernet0';
      const nic = new Port(this, nicName);
      nic.status = 'up';
      nic.dhcpEnabled = (this.type === 'laptop' || this.type === 'smartphone');
      this.ports.push(nic);
      this.gateway = '';
    } else if (this.type === 'switch') {
      // Switches have 24 FastEthernet ports and 2 GigabitEthernet ports
      for (let i = 1; i <= 8; i++) {
        const port = new Port(this, `FastEthernet0/${i}`);
        port.status = 'up'; // Switch ports are up by default
        this.ports.push(port);
      }
      this.macTable = {}; // MAC -> PortName (L2 forwarding table)
    } else if (this.type === 'router') {
      // Routers have 2 FastEthernet/Gigabit ports by default
      const fa0 = new Port(this, 'FastEthernet0/0');
      const fa1 = new Port(this, 'FastEthernet0/1');
      fa0.status = 'down'; // Cisco router ports are shutdown by default!
      fa1.status = 'down';
      this.ports.push(fa0, fa1);
      
      this.routingTable = []; // Array of { dest, mask, gateway, interface }
    } else if (this.type === 'access_point') {
      const eth = new Port(this, 'Port1');
      eth.status = 'up';
      const wlan = new Port(this, 'Wireless0');
      wlan.status = 'up';
      this.ports.push(eth, wlan);
    }
  }

  getPort(name) {
    return this.ports.find(p => p.name.toLowerCase() === name.toLowerCase());
  }

  // Update routing table dynamically based on active IP interfaces (connected routes)
  updateConnectedRoutes() {
    if (this.type !== 'router') return;
    
    // Clear dynamic connected routes (those without a gateway)
    this.routingTable = this.routingTable.filter(route => route.gateway !== 'connected');
    
    this.ports.forEach(port => {
      if (port.status === 'up' && port.ip && port.subnet) {
        const ipInt = ipToInt(port.ip);
        const maskInt = ipToInt(port.subnet);
        const networkInt = (ipInt & maskInt) >>> 0;
        const networkIp = intToIp(networkInt);
        
        // Add connected route
        this.routingTable.push({
          dest: networkIp,
          mask: port.subnet,
          gateway: 'connected',
          interface: port.name
        });
      }
    });
  }
}

class Link {
  constructor(id, type, portA, portB) {
    this.id = id;
    this.type = type; // 'straight', 'crossover', 'console'
    this.portA = portA;
    this.portB = portB;
    
    portA.connectedLink = this;
    portB.connectedLink = this;
    
    this.updateStatus();
  }

  updateStatus() {
    // A link is physically active if both device interfaces are UP
    // For PCs/Switches, they are always up. For Routers, they must not be shutdown.
    const isUp = this.portA.status === 'up' && this.portB.status === 'up';
    // However, the port link status itself is determined by connection
    // Let's propagate status:
    // If router port is shutdown, link is down, meaning switch port connected to it gets no signal
    // In our model: if link is active, both ports are up.
  }

  disconnect() {
    this.portA.connectedLink = null;
    this.portB.connectedLink = null;
    
    // If they were connected to router, the ports themselves remain configured but lose link.
    // PCs/Switches keep their status 'up' logically, but have no connection.
  }
}

class NetworkTopology {
  constructor() {
    this.devices = [];
    this.links = [];
    this.deviceCounters = { router: 0, switch: 0, pc: 0, server: 0, access_point: 0, laptop: 0, smartphone: 0 };
  }

  addDevice(type, x, y, customName = '') {
    this.deviceCounters[type]++;
    const name = customName || `${type.charAt(0).toUpperCase() + type.slice(1)}${this.deviceCounters[type] - 1}`;
    const id = `device_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const dev = new Device(id, type, name, x, y);
    this.devices.push(dev);
    return dev;
  }

  removeDevice(id) {
    const idx = this.devices.findIndex(d => d.id === id);
    if (idx === -1) return null;
    
    const dev = this.devices[idx];
    // Remove all connected links
    dev.ports.forEach(port => {
      const connectedLinks = this.links.filter(l => l.portA === port || l.portB === port);
      connectedLinks.forEach(link => {
        this.removeLink(link.id);
      });
    });
    
    this.devices.splice(idx, 1);
    return dev;
  }

  getDevice(id) {
    return this.devices.find(d => d.id === id);
  }

  getDeviceByName(name) {
    return this.devices.find(d => d.name.toLowerCase() === name.toLowerCase());
  }

  addLink(type, deviceAId, portAName, deviceBId, portBName) {
    const devA = this.getDevice(deviceAId);
    const devB = this.getDevice(deviceBId);
    if (!devA || !devB) return null;

    const portA = devA.getPort(portAName);
    const portB = devB.getPort(portBName);
    if (!portA || !portB) return null;

    const isWirelessAPPort = (p) => p.device.type === 'access_point' && p.name === 'Wireless0';

    if (!isWirelessAPPort(portA) && portA.connectedLink) return null;
    if (!isWirelessAPPort(portB) && portB.connectedLink) return null;

    const id = `link_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const link = new Link(id, type, portA, portB);
    this.links.push(link);

    // Update routes if routers are connected
    devA.updateConnectedRoutes();
    devB.updateConnectedRoutes();

    return link;
  }

  removeLink(id) {
    const idx = this.links.findIndex(l => l.id === id);
    if (idx === -1) return null;

    const link = this.links[idx];
    const devA = link.portA.device;
    const devB = link.portB.device;

    link.disconnect();
    this.links.splice(idx, 1);

    // Update port.connectedLink for AP wireless ports if the disconnected link was the active one
    const checkAndRestoreAPLink = (port) => {
      if (port.device.type === 'access_point' && port.name === 'Wireless0') {
        if (port.connectedLink === link) {
          const otherLink = this.links.find(l => l.portA === port || l.portB === port);
          port.connectedLink = otherLink || null;
        }
      }
    };
    checkAndRestoreAPLink(link.portA);
    checkAndRestoreAPLink(link.portB);

    // Update routes
    devA.updateConnectedRoutes();
    devB.updateConnectedRoutes();

    return link;
  }

  clear() {
    this.devices = [];
    this.links = [];
    this.deviceCounters = { router: 0, switch: 0, pc: 0, server: 0, access_point: 0, laptop: 0, smartphone: 0 };
  }
}
