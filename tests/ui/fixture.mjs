// Local visual/interaction fixture. Loaded only by the preview test runner.
// No request reaches a running core, subscription server, or OS setting.
import { mockIPC, mockWindows } from '@tauri-apps/api/mocks'

const query = new URLSearchParams(location.search)
const verge = {
  language: 'zh',
  theme_mode: query.get('theme') || 'light',
  traffic_graph: true,
  pause_render_traffic_stats_on_blur: false,
  enable_system_proxy: true,
  enable_tun_mode: false,
  enable_auto_launch: false,
  auto_check_update: false,
  enable_group_icon: false,
  enable_auto_delay_detection: false,
  verge_mixed_port: 7890,
  enable_memory_usage: true,
  proxy_layout_column: 1,
}
const config = {
  mode: 'rule',
  'mixed-port': 7890,
  port: 0,
  'socks-port': 0,
  'allow-lan': false,
  ipv6: false,
  'log-level': 'info',
  tun: { enable: false, stack: 'mixed' },
}
const names = ['新加坡 · 日常', '日本 · 东京', '香港 · 备用', '美国 · 西部']
const capabilities = {
  udp: true,
  xudp: false,
  tfo: false,
  mptcp: false,
  smux: false,
}
const records = Object.fromEntries(
  names.map((name, index) => [
    name,
    {
      ...capabilities,
      name,
      recordId: name,
      type: ['Tuic', 'Vless', 'Hysteria2', 'Trojan'][index],
      alive: true,
      history: [{ time: new Date().toISOString(), delay: 48 + index * 31 }],
      source: { kind: 'core', proxyName: name },
    },
  ]),
)
const groups = [
  {
    ...capabilities,
    name: '节点选择',
    type: 'Selector',
    alive: true,
    now: names[0],
    history: [],
    members: names.map((name) => ({ kind: 'node', name, recordId: name })),
  },
]
const profile = {
  uid: 'demo',
  name: '日常订阅',
  type: 'remote',
  url: 'https://example.com/profile.yaml',
  updated: 1789862400,
  extra: {
    upload: 3 * 1024 ** 3,
    download: 37 * 1024 ** 3,
    total: 200 * 1024 ** 3,
    expire: 1814400000,
  },
  option: {},
}
const profiles = {
  current: 'demo',
  items: [
    profile,
    {
      ...profile,
      uid: 'travel',
      name: '出行备用',
      extra: { ...profile.extra, total: 100 * 1024 ** 3 },
    },
  ],
}
const connections = {
  uploadTotal: 3 * 1024 ** 3,
  downloadTotal: 37 * 1024 ** 3,
  connections: [
    {
      id: 'demo-connection',
      metadata: {
        network: 'tcp',
        type: 'HTTP',
        host: 'example.com',
        destinationIP: '192.0.2.10',
        destinationPort: '443',
        sourceIP: '127.0.0.1',
        sourcePort: '52000',
        process: 'browser.exe',
      },
      upload: 14200,
      download: 245000,
      start: new Date().toISOString(),
      chains: [names[0], '节点选择'],
      rule: 'DomainSuffix',
      rulePayload: 'example.com',
    },
  ],
}
const timers = new Map()
let nextSocket = 1
window.__uiCalls = []
window.__uiFixture = { verge, config, groups, profiles }
mockWindows('main')
mockIPC(
  async (command, args = {}) => {
    window.__uiCalls.push(command)
    if (command.startsWith('plugin:window|')) {
      if (
        command.endsWith('is_decorated') ||
        command.endsWith('is_visible') ||
        command.endsWith('is_focused')
      )
        return true
      if (command.endsWith('theme')) return verge.theme_mode
      if (command.endsWith('inner_size'))
        return { width: innerWidth, height: innerHeight }
      return false
    }
    if (command === 'get_verge_config') return { ...verge }
    if (command === 'patch_verge_config') {
      Object.assign(verge, args.payload)
      return null
    }
    if (
      command === 'get_runtime_config' ||
      command === 'plugin:mihomo|get_base_config'
    )
      return { ...config }
    if (command === 'get_clash_mode') return config.mode
    if (
      command === 'patch_clash_config' ||
      command === 'plugin:mihomo|patch_base_config'
    ) {
      Object.assign(config, args.payload || args.config)
      return null
    }
    if (command === 'patch_clash_mode') {
      config.mode = args.payload
      return null
    }
    if (command === 'get_clash_info')
      return { port: 7890, server: '127.0.0.1:9090', secret: '' }
    if (command === 'get_profiles') return structuredClone(profiles)
    if (command === 'get_proxy_view')
      return {
        schemaVersion: 1,
        orderSource: 'runtime',
        providerState: 'ready',
        global: { ...groups[0], name: 'GLOBAL' },
        direct: null,
        groups: structuredClone(groups),
        records,
        standalone: [],
        providers: [],
      }
    if (command === 'get_runtime_state')
      return {
        mode: 'Sidecar',
        service: 'notInstalled',
        serviceUnavailableReason: null,
        pendingAction: null,
        sidecarAllowed: true,
        isAdmin: false,
        opInFlight: false,
        serviceUsable: false,
        tunCapable: false,
        serviceNeedsAttention: false,
      }
    if (command === 'get_sys_proxy')
      return {
        enable: verge.enable_system_proxy,
        server: '127.0.0.1:7890',
        bypass: 'localhost',
      }
    if (command === 'get_auto_proxy') return { enable: false, url: '' }
    if (
      command === 'get_pending_failures' ||
      command === 'get_clash_logs' ||
      command === 'get_app_logs'
    )
      return []
    if (command === 'get_runtime_logs') return {}
    if (command === 'get_app_uptime') return 3600
    if (command === 'plugin:mihomo|get_version')
      return { version: 'Mihomo · 演示数据', meta: true }
    if (command === 'plugin:mihomo|get_rules')
      return {
        rules: [
          {
            type: 'DomainSuffix',
            payload: 'example.com',
            proxy: '节点选择',
            size: -1,
          },
          { type: 'Match', payload: '', proxy: 'DIRECT', size: -1 },
        ],
      }
    if (
      command === 'plugin:mihomo|get_rule_providers' ||
      command === 'plugin:mihomo|get_proxy_providers'
    )
      return { providers: {} }
    if (command === 'plugin:mihomo|get_connections') return connections
    if (command === 'plugin:mihomo|select_node_for_group') {
      await new Promise((resolve) => setTimeout(resolve, 250))
      if (window.__uiFailSelection) throw new Error('演示：节点切换失败')
      const group = groups.find((group) => group.name === args.groupName)
      if (group) group.now = args.node
      return null
    }
    if (command.includes('delay_proxy') || command.includes('healthcheck_node'))
      return { delay: 48 }
    if (command.startsWith('plugin:mihomo|ws_') && args.onMessage) {
      const id = nextSocket++
      const send = () => {
        const tick = Date.now() / 1000
        const data = command.endsWith('traffic')
          ? {
              up: 70000 + Math.round(Math.sin(tick) * 16000),
              down: 1_250_000 + Math.round(Math.cos(tick / 2) * 400000),
              upTotal: connections.uploadTotal,
              downTotal: connections.downloadTotal,
            }
          : command.endsWith('memory')
            ? { inuse: 92 * 1024 ** 2 }
            : command.endsWith('connections')
              ? connections
              : { type: 'info', payload: 'Clash UI preview — demo data' }
        args.onMessage.onmessage({ type: 'Text', data: JSON.stringify(data) })
      }
      timers.set(id, setInterval(send, 1000))
      return id
    }
    if (command === 'plugin:mihomo|ws_disconnect') {
      clearInterval(timers.get(args.id))
      return null
    }
    if (command === 'plugin:app|version') return '2.6.0'
    if (command === 'plugin:app|name') return 'Clash'
    if (command === 'plugin:updater|check') return null
    if (command === 'read_profile_file') return '# 演示配置\n'
    if (command === 'get_system_info')
      return { system_name: 'Windows', system_version: '11 (UI preview)' }
    if (command === 'get_network_interfaces') return []
    if (command === 'get_network_config') return {}
    if (command === 'get_webdav_config') return {}
    if (command.startsWith('plugin:')) return null
    return null
  },
  { shouldMockEvents: true },
)
// Vite serves its src root at /; this is intentionally a browser URL.
// eslint-disable-next-line import-x/no-unresolved
await import('/main.tsx')
